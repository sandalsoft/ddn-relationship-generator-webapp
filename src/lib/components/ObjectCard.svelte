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
    if ((event.target as HTMLElement).classList.contains('connect-point') ||
        (event.target as HTMLElement).classList.contains('delete-relation')) return;
    
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
    
    // Get the center point of the field's connect-point for the line
    const fieldLi = event.currentTarget as HTMLElement;
    const connectPoint = fieldLi.querySelector('.connect-point');
    
    if (connectPoint) {
      const rect = connectPoint.getBoundingClientRect();
      
      // Get the canvas SVG element
      const svg = document.querySelector('.canvas svg');
      if (!svg) return;
      
      const svgRect = svg.getBoundingClientRect();
      
      // Dispatch a custom event to signal the connection endpoint
      dispatch('fieldConnectionEnd', {
        object,
        field,
        connectRect: rect,
        svgRect
      });
    }
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
>
  <h3>{object.definition.name}</h3>
  <ul>
    {#each object.definition.fields as field}
      <li 
        on:click={e => handleFieldClick(e, field.name)}
        on:mouseup={e => handleFieldClick(e, field.name)}
      >
        <div class="field-controls">
          <span
            class="connect-point"
            on:mousedown|stopPropagation={e => startFieldDrag(e, field.name)}
            class:dragging={isDraggingConnection}
          >+</span>
          
          {#if hasRelationships(field.name)}
            <span 
              class="delete-relation"
              on:click|stopPropagation={e => deleteRelationship(e, field.name)}
              title="Delete relationship"
            >×</span>
          {/if}
        </div>
        <span class="field">{field.name}: {field.type}</span>
      </li>
    {/each}
  </ul>
</div>

<style>
  .object-card {
    position: absolute;
    width: 200px;
    padding: 10px;
    background: white;
    border: 2px solid #333;
    border-radius: 5px;
    cursor: move;
    user-select: none;
    z-index: 1; /* Below connections */
  }
  h3 {
    margin: 0 0 10px 0;
  }
  ul {
    list-style: none;
    padding: 0;
  }
  li {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
    padding: 3px;
    border-radius: 4px;
    transition: background-color 0.15s ease, box-shadow 0.15s ease;
  }
  
  /* Highlight row on hover during connection dragging */
  .is-dragging-connection li:hover {
    background-color: #c8e6c9; /* Light green background */
    box-shadow: 0 0 0 2px #4CAF50;
    cursor: pointer;
  }
  
  .is-dragging-connection li:hover .connect-point {
    background-color: #2e7d32; /* Darker green */
  }
  
  .field-controls {
    display: flex;
    align-items: center;
    margin-right: 5px;
  }
  .connect-point {
    width: 16px;
    height: 16px;
    background: #4CAF50;
    color: white;
    text-align: center;
    border-radius: 50%;
    cursor: pointer;
    line-height: 16px;
    font-size: 12px;
    margin-right: 2px;
  }
  .connect-point:hover {
    background: #45a049;
  }
  .connect-point.dragging {
    background: #666;
  }
  .delete-relation {
    width: 16px;
    height: 16px;
    background: #f44336;
    color: white;
    text-align: center;
    border-radius: 50%;
    cursor: pointer;
    line-height: 14px;
    font-size: 16px;
    font-weight: bold;
  }
  .delete-relation:hover {
    background: #d32f2f;
  }
  .field {
    flex: 1;
  }
</style>