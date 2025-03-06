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
</script>

<svelte:window on:mousemove={onMouseMove} on:mouseup={handleMouseUp} />

<div class="canvas">
	<svg width="100%" height="100%">
		<!-- Define markers for line ends -->
		<defs>
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
				{@const fromCoords = getFieldCoordinates(rel.from.object, rel.from.field)}
				{@const toCoords = getFieldCoordinates(rel.to.object, rel.to.field)}
				{@const objectColor = getObjectColor(rel.from.object)}
				{@const markerId = `arrow-${idx}`}
				{@const arrayMarkerId = `arrow-array-${idx}`}

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
					<path d="M 0 0 L 10 5 L 0 10 z" fill={objectColor} />
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
						<path d="M 0 0 L 10 5 L 0 10 z M 6 0 L 16 5 L 6 10 z" fill={objectColor} />
					</marker>
				{/if}

				<!-- Path with curved connection using object-specific color -->
				<path
					d="M {fromCoords.x},{fromCoords.y} C {fromCoords.x +
						(toCoords.x - fromCoords.x) * 0.5},{fromCoords.y} {fromCoords.x +
						(toCoords.x - fromCoords.x) * 0.5},{toCoords.y} {toCoords.x},{toCoords.y}"
					stroke={objectColor}
					stroke-width="2"
					fill="none"
					marker-end={rel.type === 'Array' ? `url(#${arrayMarkerId})` : `url(#${markerId})`}
					opacity="0.9"
				/>

				<!-- Small dot at source point for better visibility -->
				<circle cx={fromCoords.x} cy={fromCoords.y} r="3" fill={objectColor} />
			{/if}
		{/each}

		<!-- Render the temporary dragging line -->
		{#if draggingConnection}
			<path
				d="M {lineStart.x},{lineStart.y} C {lineStart.x +
					(lineEnd.x - lineStart.x) * 0.5},{lineStart.y} {lineStart.x +
					(lineEnd.x - lineStart.x) * 0.5},{lineEnd.y} {lineEnd.x},{lineEnd.y}"
				stroke="#999999"
				stroke-width="2"
				fill="none"
				stroke-dasharray="4"
				marker-end="url(#arrow-temp)"
				opacity="0.6"
			/>

			<!-- Small dot at start point for the dragging line -->
			<circle cx={lineStart.x} cy={lineStart.y} r="3" fill="#999999" />
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

	<!-- Color debug info -->
	<div class="color-debug">
		<div class="color-debug-title">Color assignments:</div>
		{#each objects as obj}
			{@const objColor = getObjectColor(obj.definition.name)}
			<div class="color-item">
				<span class="color-swatch" style="background-color: {objColor};"></span>
				<span class="color-name">{obj.definition.name}: {objColor}</span>
			</div>
		{/each}
	</div>

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
		pointer-events: none; /* Allow clicks to pass through to cards */
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
</style>
