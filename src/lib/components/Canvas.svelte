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
          const endObj = objects.find(o => o.definition.name === endObjName);
          
          const fieldName = connectPoint.nextElementSibling?.textContent?.split(':')[0].trim();
          if (endObj && fieldName && endObj !== startPoint.object) {
            const relationship = {
              from: { object: startPoint.object.definition.name, field: startPoint.field },
              to: { object: endObj.definition.name, field: fieldName },
              created: new Date().toISOString()
            };
            
            relationships = [...relationships, relationship];
            dispatch('relationshipsUpdate', { relationships });
          }
        }
      }
      draggingConnection = false;
      startPoint = null;
    }
  }

  // Update object position after dragging the card
  function handleDragEnd(event: CustomEvent) {
    const { object, position } = event.detail;
    positions[object.definition.name] = position;
    positions = { ...positions }; // Trigger reactivity
  }
  
  // Get field coordinates based on the object position and field index
  function getFieldCoordinates(objectName: string, fieldName: string) {
    const objPosition = positions[objectName];
    if (!objPosition) return { x: 0, y: 0 };
    
    const obj = objects.find(o => o.definition.name === objectName);
    if (!obj) return { x: 0, y: 0 };
    
    // Find the field index
    const fieldIndex = obj.definition.fields.findIndex((f: any) => f.name === fieldName);
    if (fieldIndex === -1) return { x: 0, y: 0 };
    
    // Calculate the position based on the object position and field index
    return {
      x: objPosition.x + 16, // Position of connect point from left
      y: objPosition.y + 60 + (fieldIndex * 27) // 60px is approximate vertical offset to first field, 27px between fields
    };
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
      {@const fromObj = objects.find(o => o.definition.name === rel.from.object)}
      {@const toObj = objects.find(o => o.definition.name === rel.to.object)}
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
      on:fieldDragStart={handleFieldDragStart}
      on:dragStart={handleDragStart}
      on:dragMove={handleDragMove}
      on:dragEnd={handleDragEnd}
      on:elementReady={handleElementReady}
    />
  {/each}
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
</style>