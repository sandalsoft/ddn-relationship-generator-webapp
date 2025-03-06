<!-- src/lib/components/Canvas.svelte -->
<script lang="ts">
	import { createEventDispatcher, tick } from 'svelte';
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
			lineStart = { x: startPoint.x, y: startPoint.y };
			lineEnd = lineStart; // Initialize end at start
		}
	}

	// Handle direct connection to a field (when the whole field is clicked)
	function handleFieldConnectionEnd(event: CustomEvent) {
		if (!draggingConnection || !startPoint) return;

		const { object: endObj, field: endField, connectRect, svgRect } = event.detail;

		// Only create relationship if this is a different object from the start point
		if (endObj !== startPoint.object) {
			// Calculate coordinates relative to the SVG for the line
			const endX = connectRect.left + connectRect.width / 2 - svgRect.left;
			const endY = connectRect.top + connectRect.height / 2 - svgRect.top;

			// Store the pending relationship and show the popup
			pendingRelationship = {
				from: { object: startPoint.object.definition.name, field: startPoint.field },
				to: { object: endObj.definition.name, field: endField },
				created: new Date().toISOString(),
				type: 'Object', // Default type
				description: `Relationship from ${startPoint.object.definition.name} to ${endObj.definition.name}`,
				sourceType: 'object'
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
							description: `Relationship from ${startPoint.object.definition.name} to ${endObj.definition.name}`,
							sourceType: 'object'
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
	function getFieldCoordinates(objectName: string, fieldName: string) {
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
			// Find the connect-point for this field
			const fieldElements = Array.from(objectElement.querySelectorAll('li'));
			if (fieldIndex < fieldElements.length) {
				const fieldElement = fieldElements[fieldIndex];
				const connectPoint = fieldElement.querySelector('.connect-point');

				if (connectPoint) {
					const rect = connectPoint.getBoundingClientRect();
					const svg = document.querySelector('.canvas svg');
					if (svg) {
						const svgRect = svg.getBoundingClientRect();
						return {
							x: rect.left + rect.width / 2 - svgRect.left,
							y: rect.top + rect.height / 2 - svgRect.top
						};
					}
				}
			}
		}

		// Fallback to calculated position if DOM elements can't be found
		return {
			x: objPosition.x + 16, // Position of connect point from left
			y: objPosition.y + 60 + fieldIndex * 27 // 60px is approximate vertical offset to first field, 27px between fields
		};
	}

	// Format relationship display text
	function formatRelationship(rel: any) {
		return `${rel.from.object}.${rel.from.field} → ${rel.to.object}.${rel.to.field} (${rel.type})`;
	}
</script>

<svelte:window on:mousemove={onMouseMove} on:mouseup={handleMouseUp} />

<div class="canvas">
	<svg width="100%" height="100%">
		<!-- Define markers for line ends -->
		<defs>
			<marker
				id="arrow"
				viewBox="0 0 10 10"
				refX="5"
				refY="5"
				markerWidth="4"
				markerHeight="4"
				orient="auto-start-reverse"
			>
				<path d="M 0 0 L 10 5 L 0 10 z" fill="black" />
			</marker>
		</defs>

		<!-- Render existing relationships -->
		{#each relationships as rel}
			{@const fromObj = objects.find((o) => o.definition.name === rel.from.object)}
			{@const toObj = objects.find((o) => o.definition.name === rel.to.object)}
			{#if fromObj && toObj}
				{@const fromCoords = getFieldCoordinates(rel.from.object, rel.from.field)}
				{@const toCoords = getFieldCoordinates(rel.to.object, rel.to.field)}
				<line
					x1={fromCoords.x}
					y1={fromCoords.y}
					x2={toCoords.x}
					y2={toCoords.y}
					stroke="black"
					stroke-width="2"
					marker-end="url(#arrow)"
				/>
			{/if}
		{/each}

		<!-- Render the temporary dragging line -->
		{#if draggingConnection}
			<line
				x1={lineStart.x}
				y1={lineStart.y}
				x2={lineEnd.x}
				y2={lineEnd.y}
				stroke="gray"
				stroke-width="2"
				stroke-dasharray="5"
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

	<!-- Relationship Type Popup -->
	{#if showRelationshipPopup}
		<div class="popup-overlay" on:click={cancelRelationship}>
			<div class="popup" on:click|stopPropagation>
				<h3>Relationship Type</h3>
				<div class="popup-options">
					<button on:click={() => selectRelationshipType('Object')}> Object (1 to 1) </button>
					<button on:click={() => selectRelationshipType('Array')}> Array (1 to Many) </button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Relationship Deletion Popup -->
	{#if showDeletionPopup}
		<div class="deletion-popup" style="top: {deletionPosition.y}px; left: {deletionPosition.x}px;">
			<h4>Select relationship to delete:</h4>
			<ul>
				{#each relationsToDelete as rel}
					<li on:click={() => deleteRelationship(rel)}>
						{formatRelationship(rel)}
					</li>
				{/each}
			</ul>
			<button class="close-btn" on:click={closeDeletionPopup}>Cancel</button>
		</div>
	{/if}
</div>

<style>
	.canvas {
		position: relative;
		width: 100%;
		height: 100%;
		background: #f5f5f5;
		overflow: hidden;
	}
	svg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none; /* Allow clicks to pass through to cards */
	}

	.popup-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10;
	}

	.popup {
		background: white;
		border-radius: 8px;
		padding: 20px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		min-width: 300px;
		text-align: center;
	}

	.popup h3 {
		margin-top: 0;
		margin-bottom: 16px;
	}

	.popup-options {
		display: flex;
		justify-content: space-between;
		gap: 10px;
	}

	.popup-options button {
		flex: 1;
		padding: 10px;
		background: #4caf50;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	.popup-options button:hover {
		background: #45a049;
	}

	.deletion-popup {
		position: absolute;
		background: white;
		border-radius: 4px;
		padding: 10px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		z-index: 5;
		min-width: 250px;
	}

	.deletion-popup h4 {
		margin-top: 0;
		margin-bottom: 8px;
		font-size: 14px;
	}

	.deletion-popup ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.deletion-popup li {
		padding: 8px;
		cursor: pointer;
		border-radius: 4px;
		margin-bottom: 2px;
		font-size: 12px;
	}

	.deletion-popup li:hover {
		background: #f0f0f0;
	}

	.deletion-popup .close-btn {
		display: block;
		width: 100%;
		padding: 6px;
		background: #ddd;
		border: none;
		border-radius: 4px;
		margin-top: 8px;
		cursor: pointer;
	}

	.deletion-popup .close-btn:hover {
		background: #ccc;
	}
</style>
