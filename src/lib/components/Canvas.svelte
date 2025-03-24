<!-- src/lib/components/Canvas.svelte -->
<script lang="ts">
	import { createEventDispatcher, tick, onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import ObjectCard from './ObjectCard.svelte';
	import type { ConnectionPoint } from '$lib/types';

	export let objects: any[] = [];
	const dispatch = createEventDispatcher();

	let draggingConnection = false;
	let startPoint: ConnectionPoint | null = null;
	let lineStart = { x: 0, y: 0 };
	let lineEnd = { x: 0, y: 0 };
	let relationships: any[] = [];
	let positions: { [key: string]: { x: number; y: number } } = {};
	// Store references to ObjectCard components
	let objectRefs: Map<string, HTMLElement> = new Map();

	// For relationship type popup
	let showRelationshipPopup = false;
	let pendingRelationship: any = null;

	// For relationship deletion popup
	let showDeletionPopup = false;
	let relationsToDelete: any[] = [];
	let deletionPosition = { x: 0, y: 0 };

	// For error notifications
	let errorMessage = '';
	let showErrorNotification = false;
	let errorTimeoutId: ReturnType<typeof setTimeout> | null = null;

	// WebGL settings
	let effectMode: 'glow' | 'fire' | 'neon' | 'pulse' = 'fire';
	let effectIntensity: number = 1.5;
	let effectsEnabled: boolean = true; // New state variable to track if effects are enabled
	let canvasElement: HTMLDivElement;

	let showDebugInfo = false; // Added debug info flag

	// Add tooltip state variables
	let showTooltip = false;
	let tooltipContent = '';
	let tooltipPosition = { x: 0, y: 0 };
	let highlightedRelationship: number | null = null;

	onMount(() => {
		window.addEventListener('resize', updateEffects);

		// Give a small delay to ensure all elements are rendered
		setTimeout(() => {
			// Enable pointer events on hover paths
			const hoverPaths = document.querySelectorAll('.canvas svg path[style*="cursor: pointer"]');
			hoverPaths.forEach((path) => {
				(path as HTMLElement).style.pointerEvents = 'all';
			});

			console.log('Initialized hover paths:', hoverPaths.length);
		}, 500);

		return () => window.removeEventListener('resize', updateEffects);
	});

	// Simple function to update effects when needed
	function updateEffects() {
		// This is just to trigger a reactive update
		effectIntensity = effectIntensity;
	}

	// Toggle debug info
	function toggleDebugInfo() {
		showDebugInfo = !showDebugInfo;

		// Add or remove debug-mode class to canvas element for hover area visualization
		if (canvasElement) {
			if (showDebugInfo) {
				canvasElement.classList.add('debug-mode');
			} else {
				canvasElement.classList.remove('debug-mode');
			}
		}
	}

	// Toggle WebGL effect mode
	function toggleEffectMode() {
		const modes = ['glow', 'fire', 'neon', 'pulse'];
		const currentIndex = modes.indexOf(effectMode);
		const nextIndex = (currentIndex + 1) % modes.length;
		effectMode = modes[nextIndex] as 'glow' | 'fire' | 'neon' | 'pulse';
	}

	// Toggle effects on/off
	function toggleEffectsEnabled() {
		effectsEnabled = !effectsEnabled;
	}

	// Show error message
	function showError(message: string) {
		errorMessage = message;
		showErrorNotification = true;

		// Clear any existing timeout
		if (errorTimeoutId) {
			clearTimeout(errorTimeoutId);
		}

		// Auto-hide the error after 5 seconds
		errorTimeoutId = setTimeout(() => {
			showErrorNotification = false;
			errorMessage = '';
		}, 5000);
	}

	// Hide error notification
	function hideError() {
		showErrorNotification = false;
		if (errorTimeoutId) {
			clearTimeout(errorTimeoutId);
			errorTimeoutId = null;
		}
	}

	// Initialize positions for objects if not provided
	$: {
		objects.forEach((obj, i) => {
			if (!positions[obj.definition.name]) {
				positions[obj.definition.name] = {
					x: 100 * (i % 4) + 50,
					y: Math.floor(i / 4) * 150 + 50
				};
			}
		});
	}

	// Calculate connected fields for each object
	$: connectedFields = calculateConnectedFields(relationships, objects);

	function calculateConnectedFields(rels: any[], objs: any[]) {
		const result: { [key: string]: { [key: string]: any[] } } = {};

		// Initialize the structure
		objs.forEach((obj) => {
			result[obj.definition.name] = {};
		});

		// Populate with relationships
		rels.forEach((rel) => {
			// Add to the "from" object
			if (!result[rel.from.object][rel.from.field]) {
				result[rel.from.object][rel.from.field] = [];
			}
			result[rel.from.object][rel.from.field].push(rel);

			// Add to the "to" object
			if (!result[rel.to.object][rel.to.field]) {
				result[rel.to.object][rel.to.field] = [];
			}
			result[rel.to.object][rel.to.field].push(rel);
		});

		return result;
	}

	// Register object card reference
	function registerObjectRef(name: string, element: HTMLElement) {
		objectRefs.set(name, element);
	}

	// Register object card reference from element ready event
	function handleElementReady(event: CustomEvent) {
		const { name, element } = event.detail;
		registerObjectRef(name, element);
	}

	// Start dragging a connection from a field
	function handleFieldDragStart(event: CustomEvent) {
		draggingConnection = true;
		startPoint = event.detail.startPoint;

		if (startPoint) {
			// Get the actual object and field information
			const objectName = startPoint.object.definition.name;
			const fieldName = startPoint.field;

			// Calculate coordinates at the right edge of the object for outgoing connections
			const sourceCoords = getFieldCoordinates(objectName, fieldName, true);

			lineStart = { x: sourceCoords.x, y: sourceCoords.y };
			lineEnd = lineStart; // Initialize end at start
		}
	}

	// Handle direct connection to a field (when the whole field is clicked)
	function handleFieldConnectionEnd(event: CustomEvent) {
		if (!draggingConnection || !startPoint) return;

		const { object: endObj, field: endField, fieldRect, svgRect } = event.detail;

		// Only create relationship if this is a different object from the start point
		if (endObj !== startPoint.object) {
			// Calculate target coordinates at the left edge of the object
			const targetCoords = getFieldCoordinates(endObj.definition.name, endField, false);

			// Store the pending relationship and show the popup
			pendingRelationship = {
				from: { object: startPoint.object.definition.name, field: startPoint.field },
				to: { object: endObj.definition.name, field: endField },
				created: new Date().toISOString(),
				type: 'Object', // Default type
				description: `Relationship from ${startPoint.object.definition.name} to ${endObj.definition.name}`
			};

			showRelationshipPopup = true;
		}

		// End the connection dragging
		draggingConnection = false;
		startPoint = null;
	}

	// Update line endpoint during drag
	function onMouseMove(event: MouseEvent) {
		if (!draggingConnection || !startPoint) return;

		const svg = document.querySelector('.canvas svg');
		if (!svg) return;

		const rect = svg.getBoundingClientRect();
		lineEnd = {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		};
	}

	// Track object dragging start
	function handleDragStart(event: CustomEvent) {
		const { object } = event.detail;
	}

	// Track object dragging during movement
	function handleDragMove(event: CustomEvent) {
		const { object, position } = event.detail;
		const oldPosition = positions[object.definition.name];

		// Only create trails for significant movement
		if (
			oldPosition &&
			(Math.abs(position.x - oldPosition.x) > 5 || Math.abs(position.y - oldPosition.y) > 5)
		) {
			// Create trail effect by adding temporary SVG elements
			const trailContainer = document.querySelector('.canvas svg');
			if (trailContainer) {
				const objectColor = getObjectColor(object.definition.name);

				// Create a trail particle
				const trail = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
				trail.setAttribute('cx', String(oldPosition.x + 120)); // Center of object card
				trail.setAttribute('cy', String(oldPosition.y + 25)); // Approx top of object card
				trail.setAttribute('r', String(3 + Math.random() * 5));
				trail.setAttribute('fill', objectColor);
				trail.setAttribute('opacity', '0.7');
				trail.setAttribute('filter', `url(#${effectMode}-effect)`);
				trail.classList.add('trail-particle');

				// Add animation to fade out and remove
				const anim = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
				anim.setAttribute('attributeName', 'opacity');
				anim.setAttribute('from', '0.7');
				anim.setAttribute('to', '0');
				anim.setAttribute('dur', '1s');
				anim.setAttribute('begin', '0s');
				anim.setAttribute('fill', 'freeze');
				trail.appendChild(anim);

				trailContainer.appendChild(trail);

				// Remove the trail after animation completes
				setTimeout(() => {
					if (trail.parentNode) {
						trail.parentNode.removeChild(trail);
					}
				}, 1000);
			}

			// Temporarily increase effect intensity during movement for more dramatic effect
			const originalIntensity = effectIntensity;
			effectIntensity = Math.min(3.0, originalIntensity * 1.2);

			// Reset intensity after a short delay
			setTimeout(() => {
				effectIntensity = originalIntensity;
			}, 300);
		}

		// Update the object's position
		positions[object.definition.name] = position;
		positions = { ...positions }; // Trigger reactivity
	}

	// End drag and create a relationship if dropped on another object's field
	function handleMouseUp(event: MouseEvent) {
		// Handle connection dragging
		if (draggingConnection && startPoint) {
			const target = event.target as HTMLElement;
			const connectPoint = target.closest('.connect-point');
			if (connectPoint) {
				const card = connectPoint.closest('.object-card') as HTMLElement;
				if (card) {
					const endObjName = card.getAttribute('data-name');
					const endObj = objects.find((o) => o.definition.name === endObjName);

					// Get the field by traversing up to the li and then finding the field span
					const fieldLi = connectPoint.closest('li');
					let fieldName = '';

					if (fieldLi) {
						const fieldSpan = fieldLi.querySelector('.field');
						if (fieldSpan) {
							fieldName = fieldSpan.textContent?.split(':')[0].trim() || '';
						}
					}

					if (endObj && fieldName && endObj !== startPoint.object) {
						// Store the pending relationship and show the popup
						pendingRelationship = {
							from: { object: startPoint.object.definition.name, field: startPoint.field },
							to: { object: endObj.definition.name, field: fieldName },
							created: new Date().toISOString(),
							type: 'Object', // Default type
							description: `Relationship from ${startPoint.object.definition.name} to ${endObj.definition.name}`
						};

						showRelationshipPopup = true;
					}
				}
			}
			draggingConnection = false;
			startPoint = null;
		}
	}

	// Handle selecting a relationship type
	function selectRelationshipType(type: string) {
		if (pendingRelationship) {
			pendingRelationship.type = type;

			// Check if this relationship already exists
			const isDuplicate = relationships.some(
				(rel) =>
					rel.from.object === pendingRelationship.from.object &&
					rel.from.field === pendingRelationship.from.field &&
					rel.to.object === pendingRelationship.to.object &&
					rel.to.field === pendingRelationship.to.field
			);

			if (isDuplicate) {
				// Show error notification
				showError(
					`Relationship from ${pendingRelationship.from.object}.${pendingRelationship.from.field} to ${pendingRelationship.to.object}.${pendingRelationship.to.field} already exists.`
				);
				// Hide popup and clear pending relationship
				showRelationshipPopup = false;
				pendingRelationship = null;
				return;
			}

			// Add relationship if not a duplicate
			relationships = [...relationships, pendingRelationship];
			dispatch('relationshipsUpdate', { relationships });

			// Hide popup and clear pending relationship
			showRelationshipPopup = false;
			pendingRelationship = null;
		}
	}

	// Close the popup without creating a relationship
	function cancelRelationship() {
		showRelationshipPopup = false;
		pendingRelationship = null;
	}

	// Update object position after dragging the card
	function handleDragEnd(event: CustomEvent) {
		const { object, position } = event.detail;
		positions[object.definition.name] = position;
		positions = { ...positions }; // Trigger reactivity
	}

	// Handle delete relationship button click
	function handleDeleteRelationship(event: CustomEvent) {
		const { objectName, fieldName, position } = event.detail;
		const relatedRelationships = connectedFields[objectName]?.[fieldName] || [];

		if (relatedRelationships.length === 0) {
			return;
		} else if (relatedRelationships.length === 1) {
			// Delete the single relationship directly
			deleteRelationship(relatedRelationships[0]);
		} else {
			// Show popup with multiple relationships
			relationsToDelete = relatedRelationships;
			deletionPosition = position;
			showDeletionPopup = true;
		}
	}

	// Delete a specific relationship
	function deleteRelationship(relationship: any) {
		relationships = relationships.filter(
			(r) =>
				!(
					r.from.object === relationship.from.object &&
					r.from.field === relationship.from.field &&
					r.to.object === relationship.to.object &&
					r.to.field === relationship.to.field
				)
		);
		dispatch('relationshipsUpdate', { relationships });
		showDeletionPopup = false;
	}

	// Close the deletion popup
	function closeDeletionPopup() {
		showDeletionPopup = false;
	}

	// Get field coordinates based on the object position and field index
	function getFieldCoordinates(objectName: string, fieldName: string, isSource = true) {
		const objPosition = positions[objectName];
		if (!objPosition) return { x: 0, y: 0 };

		const obj = objects.find((o) => o.definition.name === objectName);
		if (!obj) return { x: 0, y: 0 };

		// Find the field index
		const fieldIndex = obj.definition.fields.findIndex((f: any) => f.name === fieldName);
		if (fieldIndex === -1) return { x: 0, y: 0 };

		// Try to find the actual DOM element for more accurate positioning
		const objectElement = objectRefs.get(objectName);
		if (objectElement) {
			const objectRect = objectElement.getBoundingClientRect();
			const svg = document.querySelector('.canvas svg');
			if (!svg) return { x: 0, y: 0 };

			const svgRect = svg.getBoundingClientRect();

			// Get the field list container (ul element)
			const fieldList = objectElement.querySelector('ul');
			if (!fieldList) return { x: 0, y: 0 };

			// Find the field element for this field
			const fieldElements = Array.from(objectElement.querySelectorAll('li'));
			if (fieldIndex < fieldElements.length) {
				const fieldElement = fieldElements[fieldIndex];
				const fieldRect = fieldElement.getBoundingClientRect();

				// Check if the field is within the visible area of the object card
				const isVisible =
					fieldRect.top >= objectRect.top &&
					fieldRect.bottom <= objectRect.bottom &&
					// Add a small buffer to handle partially visible fields
					fieldRect.top >= objectRect.top - 5 &&
					fieldRect.bottom <= objectRect.bottom + 5;

				if (isVisible) {
					// Field is visible, use the field's position
					return {
						x: isSource
							? objectRect.right - svgRect.left // Right edge for source
							: objectRect.left - svgRect.left, // Left edge for target
						y: fieldRect.top + fieldRect.height / 2 - svgRect.top // Middle of the field row
					};
				} else {
					// Field is scrolled out of view
					// Determine if it's scrolled above or below
					const fieldListRect = fieldList.getBoundingClientRect();
					const isAbove = fieldRect.bottom < fieldListRect.top + 5; // Field is above the visible area
					const isBelow = fieldRect.top > fieldListRect.bottom - 5; // Field is below the visible area

					if (isAbove) {
						// Anchor to the top of the visible field list area
						return {
							x: isSource
								? objectRect.right - svgRect.left // Right edge for source
								: objectRect.left - svgRect.left, // Left edge for target
							y: fieldListRect.top + 5 - svgRect.top // Top of field list + small padding
						};
					} else if (isBelow) {
						// Anchor to the bottom of the visible field list area
						return {
							x: isSource
								? objectRect.right - svgRect.left // Right edge for source
								: objectRect.left - svgRect.left, // Left edge for target
							y: fieldListRect.bottom - 5 - svgRect.top // Bottom of field list - small padding
						};
					}
				}
			}
		}

		// Fallback to calculated position if DOM elements can't be found
		const CARD_WIDTH = 240; // Standard width of the object card
		return {
			x: isSource
				? objPosition.x + CARD_WIDTH // Right edge for source
				: objPosition.x, // Left edge for target
			y: objPosition.y + 45 + fieldIndex * 31 // Header is ~45px tall, each field row is ~31px tall
		};
	}

	// Get a specific color for each object
	function getObjectColor(objectName: string) {
		// Assign specific colors directly based on object name
		const colorMap: { [key: string]: string } = {
			Customers: '#4285F4', // Blue
			Transactions: '#0F9D58', // Green
			Orders: '#8B5CF6', // Purple
			Products: '#F4511E', // Orange
			Users: '#009688', // Teal
			Profiles: '#E91E63', // Pink
			Items: '#FFC107', // Amber
			Categories: '#DB4437' // Red
		};

		// Return color for known objects or default to a distinguishable color
		return colorMap[objectName] || `hsl(${objectName.length * 40}, 70%, 50%)`;
	}

	// Format relationship display text
	function formatRelationship(rel: any) {
		const color = getObjectColor(rel.from.object);
		return {
			text: `${rel.from.object}.${rel.from.field} → ${rel.to.object}.${rel.to.field} (${rel.type})`,
			color
		};
	}

	// Check if a field is scrolled out of view
	function isFieldScrolledOutOfView(objectElement: HTMLElement, fieldName: string): boolean {
		if (!objectElement) return false;

		const fieldList = objectElement.querySelector('ul');
		if (!fieldList) return false;

		const fieldListRect = fieldList.getBoundingClientRect();
		const objectRect = objectElement.getBoundingClientRect();

		// Find the field element by name
		const fieldElements = Array.from(objectElement.querySelectorAll('li'));
		const fieldElement = fieldElements.find((li) => {
			const fieldNameElement = li.querySelector('.field-name');
			return fieldNameElement && fieldNameElement.textContent === fieldName;
		});

		if (!fieldElement) return false;

		const fieldRect = fieldElement.getBoundingClientRect();

		// Check if the field is outside the visible area of the field list
		return (
			fieldRect.bottom < fieldListRect.top + 5 || // Field is above the visible area
			fieldRect.top > fieldListRect.bottom - 5 // Field is below the visible area
		);
	}

	// Show tooltip for relationship line and highlight the line
	function showRelationshipTooltip(event: MouseEvent, relationship: any, index: number) {
		console.log('Hover detected on relationship:', index);
		highlightedRelationship = index;
		const fromObj = objects.find((o) => o.definition.name === relationship.from.object);
		const toObj = objects.find((o) => o.definition.name === relationship.to.object);

		if (fromObj && toObj) {
			const fromField = fromObj.definition.fields.find(
				(f: any) => f.name === relationship.from.field
			);
			const toField = toObj.definition.fields.find((f: any) => f.name === relationship.to.field);

			// Get color for this relationship
			const objectColor = getObjectColor(relationship.from.object);

			// Get relationship type icon
			const typeIcon =
				relationship.type === 'Array'
					? '<svg width="16" height="10" viewBox="0 0 16 10"><path d="M0,0 L10,5 L0,10 z M6,0 L16,5 L6,10 z" fill="currentColor" /></svg>'
					: '<svg width="10" height="10" viewBox="0 0 10 10"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" /></svg>';

			// Create formatted tooltip content
			tooltipContent = `
				<div class="tooltip-header" style="border-color: ${objectColor}; color: ${objectColor};">
					Relationship Details
					<span class="tooltip-type-icon" style="color: ${objectColor};">${typeIcon}</span>
				</div>
				<div class="tooltip-section">
					<span class="tooltip-label">From:</span>
					<span class="tooltip-value" style="color: ${objectColor};">${relationship.from.object}.${relationship.from.field}</span>
					${fromField ? `<span class="tooltip-type">(${fromField.type})</span>` : ''}
				</div>
				<div class="tooltip-section">
					<span class="tooltip-label">To:</span>
					<span class="tooltip-value">${relationship.to.object}.${relationship.to.field}</span>
					${toField ? `<span class="tooltip-type">(${toField.type})</span>` : ''}
				</div>
				<div class="tooltip-section">
					<span class="tooltip-label">Type:</span>
					<span class="tooltip-value tooltip-badge" style="background-color: ${objectColor};">
						${relationship.type === 'Array' ? 'One-to-Many' : 'One-to-One'}
					</span>
				</div>
				${
					relationship.description
						? `
				<div class="tooltip-section">
					<span class="tooltip-label">Description:</span>
					<span class="tooltip-value tooltip-description">${relationship.description}</span>
				</div>
				`
						: ''
				}
				${
					relationship.created
						? `
				<div class="tooltip-section tooltip-meta">
					<span class="tooltip-label">Created:</span>
					<span class="tooltip-value">${new Date(relationship.created).toLocaleString()}</span>
				</div>
				`
						: ''
				}
			`;

			// Position tooltip near the relationship midpoint for better visibility
			const fromCoords = getFieldCoordinates(
				relationship.from.object,
				relationship.from.field,
				true
			);
			const toCoords = getFieldCoordinates(relationship.to.object, relationship.to.field, false);

			// Calculate midpoint of the relationship
			const midX = (fromCoords.x + toCoords.x) / 2;
			const midY = (fromCoords.y + toCoords.y) / 2;

			// Convert to viewport coordinates
			const svg = document.querySelector('.canvas svg');
			let x = midX;
			let y = midY;

			if (svg) {
				const svgRect = svg.getBoundingClientRect();
				x += svgRect.left;
				y += svgRect.top;
			} else {
				// Fallback to mouse position if SVG not found
				x = event.clientX;
				y = event.clientY;
			}

			// Adjust tooltip position
			x += 20; // Offset from the line

			// Ensure the tooltip stays within viewport bounds
			const viewportWidth = window.innerWidth;
			const viewportHeight = window.innerHeight;
			const tooltipWidth = 280; // Approximate max width
			const tooltipHeight = 200; // Approximate max height

			// Adjust if too close to right edge
			if (x + tooltipWidth > viewportWidth - 20) {
				x = x - tooltipWidth - 40; // Place it on the left side
			}

			// Adjust if too close to bottom edge
			if (y + tooltipHeight > viewportHeight - 20) {
				y = y - tooltipHeight - 20;
			}

			// Adjust if too close to top edge
			if (y < 20) {
				y = 20;
			}

			tooltipPosition = { x, y };
			showTooltip = true;
		}
	}

	// Hide the tooltip and remove highlight
	function hideTooltip() {
		console.log('Hover ended');
		showTooltip = false;
		highlightedRelationship = null;
	}

	// Handle relationship click - for better interaction
	function handleRelationshipClick(event: MouseEvent, relationship: any, index: number) {
		// If already highlighted, hide tooltip
		if (highlightedRelationship === index) {
			hideTooltip();
		} else {
			// Show tooltip for this relationship
			showRelationshipTooltip(event, relationship, index);

			// When clicking, we want the tooltip to stay visible even if mouse leaves
			// So we'll remove the mouseleave handler temporarily
			setTimeout(() => {
				const hoverPaths = document.querySelectorAll('.hover-path');
				hoverPaths.forEach((path) => {
					const element = path as HTMLElement;
					element.onmouseleave = null;
				});
			}, 50);
		}

		// Prevent event from bubbling to canvas
		event.stopPropagation();
	}

	// Update the hideTooltip function to allow it to be called from clicking on canvas
	function handleCanvasClick(event: MouseEvent) {
		// Only hide if clicking directly on canvas (not on a relationship or object)
		if (event.target === canvasElement || event.target === document.querySelector('.canvas svg')) {
			hideTooltip();
		}
	}
</script>

<svelte:window on:mousemove={onMouseMove} on:mouseup={handleMouseUp} />

<div class="canvas" bind:this={canvasElement} on:click={handleCanvasClick}>
	<svg width="100%" height="100%" style="pointer-events: all;">
		<!-- Define filters for WebGL-like effects -->
		<defs>
			<!-- Glow effect filter -->
			<filter id="glow-effect" x="-50%" y="-50%" width="200%" height="200%">
				<feGaussianBlur stdDeviation="4" result="blur" />
				<feComposite in="SourceGraphic" in2="blur" operator="over" />
				<feColorMatrix
					type="matrix"
					values="
					1 0 0 0 0
					0 1 0 0 0
					0 0 1 0 0
					0 0 0 3 0"
				/>
			</filter>

			<!-- Fire effect filter with animated turbulence -->
			<filter id="fire-effect" x="-50%" y="-50%" width="200%" height="200%">
				<feTurbulence
					type="fractalNoise"
					baseFrequency="0.05"
					numOctaves="3"
					seed="0"
					result="noise"
				>
					<animate
						attributeName="baseFrequency"
						values="0.05 0.05;0.07 0.07;0.05 0.05"
						dur="10s"
						repeatCount="indefinite"
					/>
				</feTurbulence>
				<feColorMatrix
					in="noise"
					type="matrix"
					values="
					1 0 0 0 0
					0 1 0 0 0 
					0 0 1 0 0
					0 0 0 2 -0.5"
					result="coloredNoise"
				/>
				<feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="maskedNoise" />
				<feGaussianBlur in="maskedNoise" stdDeviation="3" result="blur" />
				<feComponentTransfer in="blur" result="brighten">
					<feFuncR type="linear" slope="3" intercept="0" />
					<feFuncG type="linear" slope="3" intercept="0" />
					<feFuncB type="linear" slope="1.5" intercept="0" />
				</feComponentTransfer>
				<feComposite operator="over" in="brighten" in2="SourceGraphic" />
				<feDisplacementMap
					in="SourceGraphic"
					in2="noise"
					scale="5"
					xChannelSelector="R"
					yChannelSelector="G"
				/>
			</filter>

			<!-- Neon effect filter with brightness animation -->
			<filter id="neon-effect" x="-50%" y="-50%" width="200%" height="200%">
				<feGaussianBlur stdDeviation="3" result="blur">
					<animate
						attributeName="stdDeviation"
						values="2.5;3.5;2.5"
						dur="2s"
						repeatCount="indefinite"
					/>
				</feGaussianBlur>
				<feComponentTransfer in="blur" result="glow">
					<feFuncR type="linear" slope="4" intercept="0" />
					<feFuncG type="linear" slope="4" intercept="0" />
					<feFuncB type="linear" slope="4" intercept="0" />
				</feComponentTransfer>
				<feComposite operator="over" in="glow" in2="SourceGraphic" />
			</filter>

			<!-- Pulse effect filter with animation -->
			<filter id="pulse-effect" x="-50%" y="-50%" width="200%" height="200%">
				<feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="turbulence">
					<animate
						attributeName="baseFrequency"
						values="0.05;0.1;0.05"
						dur="8s"
						repeatCount="indefinite"
					/>
				</feTurbulence>
				<feDisplacementMap
					in="SourceGraphic"
					in2="turbulence"
					scale="2"
					xChannelSelector="R"
					yChannelSelector="G"
					result="displaced"
				/>
				<feGaussianBlur in="displaced" stdDeviation="2" result="blur" />
				<feColorMatrix
					in="blur"
					type="matrix"
					values="
					1 0 0 0 0
					0 1 0 0 0
					0 0 1 0 0
					0 0 0 5 -1"
					result="glow"
				/>
				<feMerge>
					<feMergeNode in="glow" />
					<feMergeNode in="displaced" />
				</feMerge>
			</filter>

			<!-- Temporary connection marker -->
			<marker
				id="arrow-temp"
				viewBox="0 0 10 10"
				refX="8"
				refY="5"
				markerWidth="6"
				markerHeight="6"
				orient="auto-start-reverse"
			>
				<path d="M 0 0 L 10 5 L 0 10 z" fill="#999999" />
			</marker>
		</defs>

		<!-- Grid for visual reference (subtle) -->
		<pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
			<path
				d="M 50 0 L 0 0 0 50"
				fill="none"
				stroke="var(--card-border)"
				stroke-width="0.5"
				opacity="0.5"
			/>
		</pattern>
		<rect width="100%" height="100%" fill="url(#grid)" />

		<!-- Render existing relationships -->
		{#each relationships as rel, idx}
			{@const fromObj = objects.find((o) => o.definition.name === rel.from.object)}
			{@const toObj = objects.find((o) => o.definition.name === rel.to.object)}
			{#if fromObj && toObj}
				{@const fromCoords = getFieldCoordinates(rel.from.object, rel.from.field, true)}
				{@const toCoords = getFieldCoordinates(rel.to.object, rel.to.field, false)}
				{@const objectColor = getObjectColor(rel.from.object)}
				{@const markerId = `arrow-${idx}`}
				{@const arrayMarkerId = `arrow-array-${idx}`}
				{@const isHighlighted = highlightedRelationship === idx}

				<!-- Check if we need to use a different line style for scrolled-out fields -->
				{@const objectElement = objectRefs.get(rel.from.object)}
				{@const isSourceFieldScrolledOut =
					objectElement && isFieldScrolledOutOfView(objectElement, rel.from.field)}
				{@const isTargetFieldScrolledOut = objectRefs.get(rel.to.object)
					? isFieldScrolledOutOfView(objectRefs.get(rel.to.object)!, rel.to.field)
					: false}

				<!-- Create a marker for this relationship's arrow -->
				<marker
					id={markerId}
					viewBox="0 0 10 10"
					refX="8"
					refY="5"
					markerWidth="6"
					markerHeight="6"
					orient="auto-start-reverse"
				>
					<path
						d="M 0 0 L 10 5 L 0 10 z"
						fill={objectColor}
						filter={effectsEnabled && effectMode === 'glow' ? 'url(#glow-effect)' : null}
					/>
				</marker>

				<!-- Create a marker for array relationships if needed -->
				{#if rel.type === 'Array'}
					<marker
						id={arrayMarkerId}
						viewBox="0 0 16 10"
						refX="14"
						refY="5"
						markerWidth="8"
						markerHeight="6"
						orient="auto-start-reverse"
					>
						<path
							d="M 0 0 L 10 5 L 0 10 z M 6 0 L 16 5 L 6 10 z"
							fill={objectColor}
							filter={effectsEnabled && effectMode === 'glow' ? 'url(#glow-effect)' : null}
						/>
					</marker>
				{/if}

				<!-- Create a smaller directional marker for the path -->
				<marker
					id={`direction-${idx}`}
					viewBox="0 0 6 6"
					refX="3"
					refY="3"
					markerWidth="4"
					markerHeight="4"
					orient="auto"
				>
					<path
						d="M 0 0 L 6 3 L 0 6 z"
						fill={objectColor}
						filter={effectsEnabled && effectMode === 'glow' ? 'url(#glow-effect)' : null}
					/>
				</marker>

				<!-- Create effect-specific definitions for this relationship -->
				{@const effectId = `effect-${idx}`}
				{@const gradientId = `gradient-${idx}`}

				<linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
					<stop offset="0%" stop-color={objectColor} />
					<stop
						offset="50%"
						stop-color={`hsl(${parseInt(objectColor.slice(1), 16) % 360}, 100%, 75%)`}
					/>
					<stop offset="100%" stop-color={objectColor} />
					<animate attributeName="x1" values="0%;100%;0%" dur="3s" repeatCount="indefinite" />
					<animate attributeName="x2" values="100%;0%;100%" dur="3s" repeatCount="indefinite" />
				</linearGradient>

				<!-- Path with curved connection using object-specific color -->
				<path
					d="M {fromCoords.x},{fromCoords.y} 
						H {fromCoords.x + 15} 
						C {fromCoords.x + (toCoords.x - fromCoords.x) * 0.5},{fromCoords.y} 
						  {fromCoords.x + (toCoords.x - fromCoords.x) * 0.5},{toCoords.y} 
						  {toCoords.x - 15},{toCoords.y} 
						H {toCoords.x}"
					stroke={effectsEnabled && effectMode === 'pulse' ? `url(#${gradientId})` : objectColor}
					stroke-width={effectsEnabled
						? 2 * effectIntensity * (isHighlighted ? 1.5 : 1)
						: 2 * (isHighlighted ? 1.5 : 1)}
					fill="none"
					stroke-dasharray={isSourceFieldScrolledOut || isTargetFieldScrolledOut ? '5,3' : 'none'}
					marker-end={rel.type === 'Array' ? `url(#${arrayMarkerId})` : `url(#${markerId})`}
					opacity={isHighlighted ? '1' : '0.9'}
					filter={effectsEnabled
						? isHighlighted
							? 'url(#glow-effect)'
							: `url(#${effectMode}-effect)`
						: null}
					style="--effect-intensity: {effectIntensity *
						(isHighlighted ? 1.5 : 1)}; transition: all 0.2s ease;"
				>
					{#if effectsEnabled && (effectMode === 'fire' || effectMode === 'pulse') && !isHighlighted}
						<animate
							attributeName="stroke-opacity"
							values="0.7;1;0.7"
							dur="1.5s"
							repeatCount="indefinite"
						/>
					{/if}
				</path>

				<!-- Invisible wider path for better hover detection -->
				<path
					d="M {fromCoords.x},{fromCoords.y} 
						H {fromCoords.x + 15} 
						C {fromCoords.x + (toCoords.x - fromCoords.x) * 0.5},{fromCoords.y} 
						  {fromCoords.x + (toCoords.x - fromCoords.x) * 0.5},{toCoords.y} 
						  {toCoords.x - 15},{toCoords.y} 
						H {toCoords.x}"
					stroke="transparent"
					stroke-width="20"
					fill="none"
					style="cursor: pointer; pointer-events: all;"
					class="hover-path {isHighlighted ? 'hover-active' : ''}"
					on:mouseenter={(e) => showRelationshipTooltip(e, rel, idx)}
					on:mouseleave={hideTooltip}
					on:click|stopPropagation={(e) => handleRelationshipClick(e, rel, idx)}
				/>

				<!-- Directional arrow in the middle of the path -->
				{@const midX = fromCoords.x + (toCoords.x - fromCoords.x) * 0.5}
				{@const midY = fromCoords.y + (toCoords.y - fromCoords.y) * 0.5}
				{@const angle =
					Math.atan2(toCoords.y - fromCoords.y, toCoords.x - fromCoords.x) * (180 / Math.PI)}

				<g transform="translate({midX}, {midY}) rotate({angle}, 0, 0)">
					<path
						d="M -8,0 L 8,0 M 0,-5 L 8,0 L 0,5"
						stroke={objectColor}
						stroke-width={isHighlighted ? '3' : '2'}
						fill="none"
						filter={effectsEnabled
							? isHighlighted
								? 'url(#glow-effect)'
								: `url(#${effectMode}-effect)`
							: null}
					/>
				</g>

				<!-- Small dots at source and target points -->
				<circle
					cx={fromCoords.x}
					cy={fromCoords.y}
					r={isHighlighted ? '4' : '3'}
					fill={objectColor}
					opacity={isHighlighted ? '1' : '0.8'}
					filter={effectsEnabled
						? isHighlighted
							? 'url(#glow-effect)'
							: `url(#${effectMode}-effect)`
						: null}
				/>

				<circle
					cx={toCoords.x}
					cy={toCoords.y}
					r={isHighlighted ? '4' : '3'}
					fill={objectColor}
					opacity={isHighlighted ? '1' : '0.8'}
					filter={effectsEnabled
						? isHighlighted
							? 'url(#glow-effect)'
							: `url(#${effectMode}-effect)`
						: null}
				/>

				<!-- Debug info showing coordinates -->
				{#if showDebugInfo}
					<text x={fromCoords.x + 5} y={fromCoords.y - 5} font-size="10" fill={objectColor}>
						({fromCoords.x.toFixed(0)},{fromCoords.y.toFixed(0)})
					</text>
					<text x={toCoords.x + 5} y={toCoords.y - 5} font-size="10" fill={objectColor}>
						({toCoords.x.toFixed(0)},{toCoords.y.toFixed(0)})
					</text>
				{/if}
			{/if}
		{/each}

		<!-- Render the temporary dragging line -->
		{#if draggingConnection}
			<path
				d="M {lineStart.x},{lineStart.y}
					H {lineStart.x + 15}
					C {lineStart.x + (lineEnd.x - lineStart.x) * 0.5},{lineStart.y}
					  {lineStart.x + (lineEnd.x - lineStart.x) * 0.5},{lineEnd.y}
					  {lineEnd.x - 15},{lineEnd.y}
					H {lineEnd.x}"
				stroke="#999999"
				stroke-width="2"
				fill="none"
				stroke-dasharray="4"
				marker-end="url(#arrow-temp)"
				opacity="0.6"
				filter={effectsEnabled ? 'url(#glow-effect)' : null}
			/>

			<!-- Small dot at start point for the dragging line -->
			<circle
				cx={lineStart.x}
				cy={lineStart.y}
				r="3"
				fill="#999999"
				filter={effectsEnabled ? 'url(#glow-effect)' : null}
			/>
		{/if}
	</svg>

	<!-- Render object cards -->
	{#each objects as obj}
		<ObjectCard
			object={obj}
			position={positions[obj.definition.name]}
			isDraggingConnection={draggingConnection}
			connectedFields={connectedFields[obj.definition.name] || {}}
			on:fieldDragStart={handleFieldDragStart}
			on:fieldConnectionEnd={handleFieldConnectionEnd}
			on:dragStart={handleDragStart}
			on:dragMove={handleDragMove}
			on:dragEnd={handleDragEnd}
			on:elementReady={handleElementReady}
			on:deleteRelationship={handleDeleteRelationship}
		/>
	{/each}

	<!-- Debug toggle button -->
	<div class="debug-toggle">
		<button on:click={toggleDebugInfo} class="debug-button">
			{showDebugInfo ? 'Hide Debug Info' : 'Show Debug Info'}
		</button>
		<button
			on:click={toggleEffectsEnabled}
			class="effect-button"
			class:effect-disabled={!effectsEnabled}
		>
			{effectsEnabled ? 'Effects: On' : 'Effects: Off'}
		</button>
		{#if effectsEnabled}
			<button on:click={toggleEffectMode} class="effect-mode-button">
				Mode: {effectMode}
			</button>
			<div class="intensity-control">
				<label for="effect-intensity">Intensity: {effectIntensity.toFixed(1)}</label>
				<input
					type="range"
					id="effect-intensity"
					min="0.2"
					max="3.0"
					step="0.1"
					bind:value={effectIntensity}
				/>
			</div>
		{/if}
	</div>

	<!-- Color debug info -->
	<div class="color-debug" class:active={showDebugInfo}>
		<div class="color-debug-title">Color assignments:</div>
		{#each objects as obj}
			{@const objColor = getObjectColor(obj.definition.name)}
			<div class="color-item">
				<span class="color-swatch" style="background-color: {objColor};"></span>
				<span class="color-name">{obj.definition.name}: {objColor}</span>
			</div>
		{/each}
	</div>

	<!-- Error notification -->
	{#if showErrorNotification}
		<div class="error-notification" transition:fade={{ duration: 200 }}>
			<div class="error-icon">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<circle cx="12" cy="12" r="10"></circle>
					<line x1="12" y1="8" x2="12" y2="12"></line>
					<line x1="12" y1="16" x2="12.01" y2="16"></line>
				</svg>
			</div>
			<div class="error-message">{errorMessage}</div>
			<button class="error-close" on:click={hideError} aria-label="Close notification">×</button>
		</div>
	{/if}

	<!-- Relationship Type Popup -->
	{#if showRelationshipPopup}
		<div class="popup-overlay" on:click={cancelRelationship}>
			<div
				class="popup"
				on:click|stopPropagation
				role="dialog"
				aria-labelledby="relationshipTypeHeading"
			>
				<h3 id="relationshipTypeHeading">Select Relationship Type</h3>
				<p class="popup-description">
					Creating a relationship from
					<span class="highlight"
						>{pendingRelationship?.from.object}.{pendingRelationship?.from.field}</span
					>
					to
					<span class="highlight"
						>{pendingRelationship?.to.object}.{pendingRelationship?.to.field}</span
					>
				</p>
				<div class="popup-options">
					<button on:click={() => selectRelationshipType('Object')} class="primary">
						<span class="relationship-icon">1:1</span>
						<span>Object (One to One)</span>
					</button>
					<button on:click={() => selectRelationshipType('Array')} class="secondary">
						<span class="relationship-icon">1:n</span>
						<span>Array (One to Many)</span>
					</button>
				</div>
				<button class="cancel-button" on:click={cancelRelationship}> Cancel </button>
			</div>
		</div>
	{/if}

	<!-- Relationship Deletion Popup -->
	{#if showDeletionPopup}
		<div
			class="deletion-popup"
			style="top: {deletionPosition.y}px; left: {deletionPosition.x}px;"
			role="dialog"
			aria-labelledby="deletionHeading"
		>
			<h4 id="deletionHeading">Select relationship to delete:</h4>
			<ul>
				{#each relationsToDelete as rel}
					{@const formattedRel = formatRelationship(rel)}
					<li
						on:click={() => deleteRelationship(rel)}
						role="button"
						tabindex="0"
						style="border-left: 3px solid {formattedRel.color}; padding-left: 0.8rem;"
					>
						{formattedRel.text}
					</li>
				{/each}
			</ul>
			<button class="close-btn" on:click={closeDeletionPopup}>Cancel</button>
		</div>
	{/if}

	<!-- Tooltip for relationship details -->
	{#if showTooltip}
		<div
			class="relationship-tooltip"
			style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px;"
			transition:fade={{ duration: 150 }}
		>
			{@html tooltipContent}
		</div>
	{/if}
</div>

<style>
	.canvas {
		position: relative;
		width: 100%;
		height: 100%;
		background: var(--bg-color);
		background-image: radial-gradient(var(--card-border) 1px, transparent 0);
		background-size: 20px 20px;
		background-position: -10px -10px;
		overflow: hidden;
	}

	svg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none; /* By default allow clicks to pass through */
	}

	.popup-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(2px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		animation: fadeIn 0.2s ease;
		role: dialog;
		aria-modal: true;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes scaleIn {
		from {
			transform: scale(0.95);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	.popup {
		background: var(--card-bg);
		border-radius: var(--radius-md);
		padding: 1.5rem;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
		min-width: 320px;
		max-width: 90%;
		text-align: center;
		animation: scaleIn 0.2s ease;
	}

	.popup h3 {
		margin-top: 0;
		margin-bottom: 1.25rem;
		color: var(--text-color);
		font-size: 1.25rem;
	}

	.popup-options {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}

	.popup-options button {
		flex: 1;
		padding: 0.75rem 1rem;
		font-size: 0.95rem;
		font-weight: 500;
	}

	.deletion-popup {
		position: absolute;
		background: var(--card-bg);
		border-radius: var(--radius-md);
		padding: 1rem;
		box-shadow: var(--card-shadow);
		z-index: 10;
		min-width: 250px;
		max-width: 300px;
		animation: scaleIn 0.2s ease;
	}

	.deletion-popup h4 {
		margin-top: 0;
		margin-bottom: 0.75rem;
		font-size: 0.9rem;
		color: var(--text-color);
	}

	.deletion-popup ul {
		list-style: none;
		padding: 0;
		margin: 0 0 0.75rem 0;
		max-height: 200px;
		overflow-y: auto;
	}

	.deletion-popup li {
		padding: 0.5rem 0.75rem;
		cursor: pointer;
		border-radius: var(--radius-sm);
		margin-bottom: 0.25rem;
		font-size: 0.85rem;
		transition: background-color var(--transition-speed) ease;
	}

	.deletion-popup li:hover {
		background: var(--primary-light);
	}

	.deletion-popup .close-btn {
		display: block;
		width: 100%;
		padding: 0.5rem;
		background: var(--bg-color);
		color: var(--text-light);
		border: 1px solid var(--card-border);
		border-radius: var(--radius-sm);
		font-size: 0.85rem;
		margin-top: 0.5rem;
		cursor: pointer;
		transition: all var(--transition-speed) ease;
	}

	.deletion-popup .close-btn:hover {
		background: var(--card-border);
		color: var(--text-color);
	}

	.popup-description {
		margin-bottom: 1.5rem;
		color: var(--text-light);
		font-size: 0.9rem;
	}

	.highlight {
		color: var(--primary-dark);
		font-weight: 600;
		display: inline-block;
		background: var(--primary-light);
		border-radius: var(--radius-sm);
		padding: 0.15rem 0.35rem;
		margin: 0 0.1rem;
	}

	.relationship-icon {
		display: inline-block;
		font-weight: 600;
		margin-right: 0.5rem;
		font-size: 0.9rem;
	}

	.cancel-button {
		margin-top: 0.75rem;
		background: var(--bg-color);
		color: var(--text-color);
		border: 1px solid var(--card-border);
	}

	.cancel-button:hover {
		background: var(--card-border);
	}

	.color-debug {
		position: fixed;
		top: 10px;
		right: 10px;
		background: rgba(255, 255, 255, 0.95);
		border: 1px solid var(--card-border);
		border-radius: var(--radius-md);
		padding: 10px;
		font-size: 12px;
		z-index: 1000;
		box-shadow: var(--card-shadow);
		max-width: 300px;
		display: none; /* Hide by default */
	}

	.color-debug.active {
		display: block; /* Show when active */
	}

	.color-debug-title {
		font-weight: bold;
		margin-bottom: 6px;
		border-bottom: 1px solid var(--card-border);
		padding-bottom: 4px;
	}

	.color-item {
		display: flex;
		align-items: center;
		margin-bottom: 4px;
	}

	.color-swatch {
		display: inline-block;
		width: 16px;
		height: 16px;
		border-radius: 3px;
		margin-right: 6px;
		border: 1px solid rgba(0, 0, 0, 0.1);
	}

	.color-name {
		font-family: var(--font-mono);
		font-size: 11px;
	}

	.error-notification {
		position: fixed;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		background-color: #fee2e2;
		color: #b91c1c;
		border: 1px solid #ef4444;
		border-radius: var(--radius-md);
		padding: 12px 16px;
		display: flex;
		align-items: center;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
		z-index: 2000;
		max-width: 500px;
		width: auto;
	}

	.error-icon {
		margin-right: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #b91c1c;
	}

	.error-message {
		flex: 1;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.error-close {
		background: transparent;
		border: none;
		color: #b91c1c;
		font-size: 20px;
		cursor: pointer;
		padding: 0;
		margin-left: 12px;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.debug-toggle {
		position: fixed;
		top: 10px;
		left: 10px;
		z-index: 1000;
		display: flex;
		gap: 8px;
	}

	.debug-button,
	.effect-button,
	.effect-mode-button {
		background: var(--bg-color);
		color: var(--text-color);
		border: 1px solid var(--card-border);
		border-radius: var(--radius-sm);
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-speed) ease;
	}

	.effect-button {
		background: var(--primary-light);
		color: var(--primary-dark);
		border-color: var(--primary-color);
	}

	.effect-mode-button {
		background: var(--secondary-light);
		color: var(--secondary-dark);
		border-color: var(--secondary-color);
	}

	.effect-button.effect-disabled {
		background: var(--card-border);
		color: var(--text-light);
		border-color: var(--card-border);
	}

	.debug-button:hover,
	.effect-button:hover,
	.effect-mode-button:hover {
		background: var(--card-border);
	}

	.effect-button:hover {
		background: var(--primary-color);
		color: white;
	}

	.effect-mode-button:hover {
		background: var(--secondary-color);
		color: white;
	}

	.intensity-control {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.intensity-control label {
		font-weight: 500;
	}

	.intensity-control input[type='range'] {
		width: 100px;
	}

	@keyframes pulse {
		0% {
			filter: drop-shadow(0 0 2px currentColor);
		}
		50% {
			filter: drop-shadow(0 0 8px currentColor);
		}
		100% {
			filter: drop-shadow(0 0 2px currentColor);
		}
	}

	@keyframes flow {
		0% {
			stroke-dashoffset: 0;
		}
		100% {
			stroke-dashoffset: 20;
		}
	}

	@keyframes float {
		0% {
			transform: translateY(0) translateX(0);
		}
		50% {
			transform: translateY(-10px) translateX(5px);
		}
		100% {
			transform: translateY(0) translateX(0);
		}
	}

	/* Add styles for animated effects */
	:global(.canvas path[filter*='fire-effect']) {
		animation: pulse 2s infinite;
	}

	:global(.canvas path[filter*='glow-effect']) {
		filter: drop-shadow(0 0 3px currentColor) drop-shadow(0 0 6px currentColor);
	}

	:global(.canvas path[filter*='neon-effect']) {
		filter: drop-shadow(0 0 5px currentColor) drop-shadow(0 0 8px currentColor);
	}

	:global(.canvas path[filter*='pulse-effect']) {
		animation: pulse 2s infinite;
		stroke-dasharray: 4, 2;
		animation: flow 1s linear infinite;
	}

	:global(.trail-particle) {
		animation: float 3s ease-in-out;
	}

	/* Enhanced SVG filters - these make the effects more visible */
	:global(.canvas circle[filter]) {
		mix-blend-mode: screen;
	}

	:global(.canvas path[filter]) {
		mix-blend-mode: normal;
	}

	/* Tooltip styles */
	.relationship-tooltip {
		position: fixed;
		background-color: var(--card-bg);
		border: 1px solid var(--card-border);
		border-radius: var(--radius-md);
		padding: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		font-size: 0.9rem;
		z-index: 3000; /* Increased from 1000 */
		max-width: 280px;
		pointer-events: none;
		animation: tooltipPop 0.2s ease-out;
	}

	@keyframes tooltipPop {
		0% {
			opacity: 0;
			transform: scale(0.9);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}

	:global(.tooltip-header) {
		font-weight: 600;
		font-size: 1rem;
		margin-bottom: 8px;
		color: var(--primary-dark);
		border-bottom: 1px solid var(--card-border);
		padding-bottom: 4px;
	}

	:global(.tooltip-section) {
		margin-bottom: 6px;
	}

	:global(.tooltip-label) {
		font-weight: 500;
		color: var(--text-light);
		margin-right: 4px;
	}

	:global(.tooltip-value) {
		color: var(--text-color);
		font-weight: 500;
	}

	:global(.tooltip-type) {
		color: var(--text-light);
		font-size: 0.8rem;
		margin-left: 4px;
		font-style: italic;
	}

	:global(.tooltip-type-icon) {
		margin-left: 4px;
		font-size: 0.8rem;
		font-style: normal;
	}

	:global(.tooltip-badge) {
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
		font-size: 0.8rem;
		font-weight: 500;
	}

	:global(.tooltip-description) {
		font-size: 0.9rem;
		color: var(--text-light);
	}

	:global(.tooltip-meta) {
		font-size: 0.8rem;
		color: var(--text-light);
	}

	/* Allow pointer events specifically for hover detection paths */
	:global(.canvas path[style*='cursor: pointer']) {
		pointer-events: all !important;
	}

	/* Debug style to see the hover area (only when debug is on) */
	:global(.canvas.debug-mode path.hover-active) {
		stroke: rgba(255, 0, 0, 0.3);
		stroke-width: 15px;
	}
</style>
