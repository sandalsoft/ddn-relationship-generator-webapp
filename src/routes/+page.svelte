<script lang="ts">
  import Canvas from '../lib/components/Canvas.svelte';
  import YamlInputOutput from '../lib/components/YamlInputOutput.svelte';
  import { parseObjectsFromYaml, generateRelationshipYaml } from '$lib/yamlParser';
	import type { Relationship } from '$lib/types';

  // Updated YAML with document separators
  let inputYaml = `kind: ObjectType
version: v1
definition:
  name: Customers
  fields:
    - name: address
      type: Varchar
    - name: customerId
      type: Int4!
    - name: email
      type: Varchar
---
kind: ObjectType
version: v1
definition:
  name: Transactions
  fields:
    - name: amount
      type: Int4!
    - name: customerId
      type: Varchar
    - name: date
      type: Date
`;

  // Parsed objects for the canvas
  let objects = parseObjectsFromYaml(inputYaml);
  // YAML output for relationships
  let relationshipYaml = '';

  // Handle changes to the input YAML
  function handleInputChange(event: CustomEvent) {
    inputYaml = event.detail.yaml;
    objects = parseObjectsFromYaml(inputYaml);
  }

  // Handle updates to relationships from the canvas
  function handleRelationshipsUpdate(event: CustomEvent) {
    const relationships = event.detail.relationships;
    relationshipYaml = relationships.map((r: Relationship) => generateRelationshipYaml(r)).join('\n');
  }
</script>

<main>
  <div class="left-panel">
    <YamlInputOutput
      {inputYaml}
      outputYaml={relationshipYaml}
      on:inputChange={handleInputChange}
    />
  </div>
  <div class="canvas-panel">
    <Canvas
      {objects}
      on:relationshipsUpdate={handleRelationshipsUpdate}
    />
  </div>
</main>

<style>
  main {
    display: flex;
    width: 100vw;
    height: 100vh;
  }
  .left-panel {
    width: 20%;
    height: 100%;
  }
  .canvas-panel {
    width: 80%;
    height: 100%;
  }
</style>