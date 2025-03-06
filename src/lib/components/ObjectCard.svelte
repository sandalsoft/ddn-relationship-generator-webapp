<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import type { ObjectDefinition, Position, ConnectionPoint } from '$lib/types';

  export let object: ObjectDefinition;
  export let position: Position = { x: 0, y: 0 };
  export let isDraggingConnection = false;
  export let highlightedFields: string[] = [];

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
    if ((event.target as HTMLElement).classList.contains('connect-point')) return;
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

  function handleMouseUp() {
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
>
  <h3>{object.definition.name}</h3>
  <ul>
    {#each object.definition.fields as field}
      <li class:highlight={highlightedFields.includes(field.name)}>
        <span
          class="connect-point"
          on:mousedown|stopPropagation={e => startFieldDrag(e, field.name)}
          class:dragging={isDraggingConnection}
        >+</span>
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
  }
  .connect-point {
    width: 16px;
    height: 16px;
    margin-right: 5px;
    background: #4CAF50;
    color: white;
    text-align: center;
    border-radius: 50%;
    cursor: pointer;
    line-height: 16px;
    font-size: 12px;
  }
  .connect-point:hover {
    background: #45a049;
  }
  .connect-point.dragging {
    background: #666;
  }
  .field {
    flex: 1;
  }
  .highlight {
    background-color: #e0f7fa; /* Light blue for highlighted fields */
  }
</style>