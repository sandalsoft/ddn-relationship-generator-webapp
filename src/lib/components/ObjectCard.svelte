<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import type { ObjectDefinition, Position, ConnectionPoint } from '$lib/types';

	export let object: ObjectDefinition;
	export let position: Position = { x: 0, y: 0 };
	export let isDraggingConnection = false;
	export let connectedFields: { [key: string]: any[] } = {};

	const dispatch = createEventDispatcher();
	let isDragging = false;
	let startX = 0;
	let startY = 0;
	let cardElement: HTMLElement;
	let resizeObserver: ResizeObserver;

	onMount(() => {
		// Setup resize observer for window resize handling
		resizeObserver = new ResizeObserver(() => {
			// Just trigger a redraw if needed
		});

		if (cardElement) {
			resizeObserver.observe(cardElement);
			// Dispatch element reference to parent
			dispatch('elementReady', {
				name: object.definition.name,
				element: cardElement
			});
		}
	});

	onDestroy(() => {
		if (resizeObserver) {
			resizeObserver.disconnect();
		}
	});

	// Handle card dragging
	function handleMouseDown(event: MouseEvent) {
		// If we're dragging a connection, don't start dragging the card
		if (isDraggingConnection) return;

		// Don't start dragging from control buttons
		if (
			(event.target as HTMLElement).classList.contains('connect-point') ||
			(event.target as HTMLElement).classList.contains('delete-relation')
		)
			return;

		isDragging = true;
		startX = event.clientX - position.x;
		startY = event.clientY - position.y;
		dispatch('dragStart', { object });
	}

	function handleMouseMove(event: MouseEvent) {
		if (!isDragging) return;

		// Calculate new position
		const newPosition = {
			x: event.clientX - startX,
			y: event.clientY - startY
		};

		// Update position
		position = newPosition;

		// Dispatch move event with both object and position
		dispatch('dragMove', { object, position: newPosition });
	}

	function handleMouseUp(event: MouseEvent) {
		if (isDragging) {
			isDragging = false;
			dispatch('dragEnd', { object, position });
		}
	}

	// Handle connection point dragging
	function startFieldDrag(event: MouseEvent, field: string) {
		event.stopPropagation();

		const connectPoint = event.target as HTMLElement;
		const connectRect = connectPoint.getBoundingClientRect();

		// Get the canvas SVG element
		const svg = document.querySelector('.canvas svg');
		if (!svg) return;

		const svgRect = svg.getBoundingClientRect();

		// Calculate coordinates relative to the SVG
		const startPoint: ConnectionPoint = {
			object,
			field,
			x: connectRect.left + connectRect.width / 2 - svgRect.left,
			y: connectRect.top + connectRect.height / 2 - svgRect.top
		};

		dispatch('fieldDragStart', { startPoint });
	}

	// Handle click on field row when a connection is being dragged
	function handleFieldClick(event: MouseEvent, field: string) {
		// Only handle this if we're in connection dragging mode
		if (!isDraggingConnection) return;

		event.stopPropagation();

		// Get the field row element
		const fieldLi = event.currentTarget as HTMLElement;
		const fieldRect = fieldLi.getBoundingClientRect();

		// Get the canvas SVG element
		const svg = document.querySelector('.canvas svg');
		if (!svg) return;

		const svgRect = svg.getBoundingClientRect();

		// Dispatch a custom event to signal the connection endpoint
		dispatch('fieldConnectionEnd', {
			object,
			field,
			fieldRect,
			svgRect
		});
	}

	// Handle delete relationship button click
	function deleteRelationship(event: MouseEvent, fieldName: string) {
		event.stopPropagation();

		// Get the position for the popup if needed
		const target = event.target as HTMLElement;
		const rect = target.getBoundingClientRect();
		const position = {
			x: rect.right + 5,
			y: rect.top
		};

		dispatch('deleteRelationship', {
			objectName: object.definition.name,
			fieldName,
			position
		});
	}

	// Check if a field has relationships
	function hasRelationships(fieldName: string): boolean {
		return !!connectedFields[fieldName] && connectedFields[fieldName].length > 0;
	}

	// Function to get appropriate field icon based on type
	function getFieldIcon(type: string) {
		if (type.includes('Int') || type.includes('Float') || type.includes('Double')) {
			return 'number';
		} else if (type.includes('Date') || type.includes('Time')) {
			return 'calendar';
		} else if (type.includes('Bool')) {
			return 'toggle';
		} else {
			return 'text';
		}
	}
</script>

<svelte:window on:mousemove={handleMouseMove} on:mouseup={handleMouseUp} />

<div
	class="object-card"
	style="left: {position.x}px; top: {position.y}px;"
	on:mousedown={handleMouseDown}
	draggable="false"
	on:dragstart|preventDefault
	bind:this={cardElement}
	data-name={object.definition.name}
	class:is-dragging-connection={isDraggingConnection}
	class:is-dragging={isDragging}
	role="region"
	aria-label={`${object.definition.name} object`}
>
	<div class="card-header">
		<h3>{object.definition.name}</h3>
		<div class="card-actions">
			<button class="icon-button small" title="Collapse card">
				<span class="visually-hidden">Collapse</span>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="14"
					height="14"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polyline points="18 15 12 9 6 15"></polyline>
				</svg>
			</button>
		</div>
	</div>

	<ul>
		{#each object.definition.fields as field}
			<li
				on:click={(e) => handleFieldClick(e, field.name)}
				on:mouseup={(e) => handleFieldClick(e, field.name)}
				class:has-relations={hasRelationships(field.name)}
				role="button"
				tabindex="0"
			>
				<div class="field-controls">
					<span
						class="connect-point"
						on:mousedown|stopPropagation={(e) => startFieldDrag(e, field.name)}
						class:dragging={isDraggingConnection}
						role="button"
						aria-label={`Connect from ${field.name}`}
						tabindex="0"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="12"
							height="12"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<line x1="12" y1="5" x2="12" y2="19"></line>
							<line x1="5" y1="12" x2="19" y2="12"></line>
						</svg>
					</span>

					{#if hasRelationships(field.name)}
						<span
							class="delete-relation"
							on:click|stopPropagation={(e) => deleteRelationship(e, field.name)}
							title="Delete relationship"
							role="button"
							aria-label={`Delete relationship for ${field.name}`}
							tabindex="0"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<line x1="18" y1="6" x2="6" y2="18"></line>
								<line x1="6" y1="6" x2="18" y2="18"></line>
							</svg>
						</span>
					{/if}
				</div>

				<div class="field-info">
					<span class="field-name">{field.name}</span>
					<span class="field-type">{field.type}</span>
				</div>

				<div class="field-type-icon" title={field.type}>
					{#if getFieldIcon(field.type) === 'number'}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="12"
							height="12"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<line x1="12" y1="1" x2="12" y2="23"></line>
							<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
						</svg>
					{:else if getFieldIcon(field.type) === 'calendar'}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="12"
							height="12"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
							<line x1="16" y1="2" x2="16" y2="6"></line>
							<line x1="8" y1="2" x2="8" y2="6"></line>
							<line x1="3" y1="10" x2="21" y2="10"></line>
						</svg>
					{:else if getFieldIcon(field.type) === 'toggle'}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="12"
							height="12"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect>
							<circle cx="16" cy="12" r="3"></circle>
						</svg>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="12"
							height="12"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<line x1="17" y1="10" x2="3" y2="10"></line>
							<line x1="21" y1="6" x2="3" y2="6"></line>
							<line x1="21" y1="14" x2="3" y2="14"></line>
							<line x1="17" y1="18" x2="3" y2="18"></line>
						</svg>
					{/if}
				</div>
			</li>
		{/each}
	</ul>
</div>

<style>
	.object-card {
		position: absolute;
		width: 240px;
		background: var(--card-bg);
		border-radius: var(--radius-md);
		box-shadow: var(--card-shadow);
		border: 1px solid var(--card-border);
		cursor: move;
		user-select: none;
		z-index: 1;
		transition:
			box-shadow var(--transition-speed) ease,
			transform var(--transition-speed) ease;
		overflow: hidden;
	}

	.object-card.is-dragging {
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
		z-index: 2;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 12px;
		background: var(--primary-color);
		color: white;
		border-bottom: 1px solid var(--primary-dark);
	}

	.card-actions {
		display: flex;
		gap: 4px;
	}

	.icon-button.small {
		width: 20px;
		height: 20px;
		background: rgba(255, 255, 255, 0.2);
		color: white;
	}

	.icon-button.small:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	h3 {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 600;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		max-height: 300px;
		overflow-y: auto;
	}

	li {
		display: flex;
		align-items: center;
		padding: 6px 12px;
		border-bottom: 1px solid var(--card-border);
		transition:
			background-color var(--transition-speed) ease,
			box-shadow var(--transition-speed) ease;
	}

	li:last-child {
		border-bottom: none;
	}

	/* Highlight connected fields */
	li.has-relations {
		background-color: var(--primary-light);
	}

	/* Highlight row on hover during connection dragging */
	.is-dragging-connection li:hover {
		background-color: var(--secondary-light);
		box-shadow: inset 0 0 0 1px var(--secondary-color);
		cursor: pointer;
	}

	.is-dragging-connection li:hover .connect-point {
		background-color: var(--secondary-dark);
		transform: scale(1.1);
	}

	.field-controls {
		display: flex;
		align-items: center;
		margin-right: 8px;
	}

	.connect-point {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		background: var(--primary-color);
		color: white;
		border-radius: 50%;
		cursor: pointer;
		transition: all var(--transition-speed) ease;
		margin-right: 4px;
	}

	.connect-point:hover {
		background: var(--primary-dark);
		transform: scale(1.1);
	}

	.connect-point.dragging {
		background: var(--accent-color);
	}

	.delete-relation {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		background: var(--danger-color);
		color: white;
		border-radius: 50%;
		cursor: pointer;
		transition: all var(--transition-speed) ease;
	}

	.delete-relation:hover {
		background: var(--danger-dark);
		transform: scale(1.1);
	}

	.field-info {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0; /* Allows text truncation to work */
	}

	.field-name {
		font-weight: 500;
		font-size: 0.85rem;
		color: var(--text-color);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.field-type {
		font-size: 0.75rem;
		color: var(--text-light);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.field-type-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		margin-left: 4px;
		color: var(--text-light);
		opacity: 0.7;
	}
</style>
