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
		relationshipYaml = relationships
			.map((r: Relationship) => generateRelationshipYaml(r))
			.join('\n');
	}
</script>

<main>
	<div class="app-header">
		<h1>Relationship Builder</h1>
		<div class="app-controls">
			<button class="secondary">Export</button>
		</div>
	</div>

	<div class="app-container">
		<div class="left-panel">
			<YamlInputOutput
				{inputYaml}
				outputYaml={relationshipYaml}
				on:inputChange={handleInputChange}
			/>
		</div>
		<div class="canvas-panel">
			<Canvas {objects} on:relationshipsUpdate={handleRelationshipsUpdate} />
		</div>
	</div>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100vh;
		overflow: hidden;
	}

	.app-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 1.5rem;
		background-color: var(--card-bg);
		border-bottom: 1px solid var(--card-border);
		box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
		z-index: 10;
	}

	.app-header h1 {
		font-size: 1.5rem;
		color: var(--primary-dark);
		margin: 0;
	}

	.app-controls {
		display: flex;
		gap: 0.75rem;
	}

	.app-container {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.left-panel {
		flex: 0 0 30%;
		height: 100%;
		border-right: 1px solid var(--card-border);
		background-color: var(--bg-color);
		overflow: hidden;
		transition: flex-basis var(--transition-speed) ease;
	}

	.canvas-panel {
		flex: 1;
		height: 100%;
		background-color: var(--bg-color);
	}

	@media (max-width: 1024px) {
		.left-panel {
			flex: 0 0 40%;
		}
	}

	@media (max-width: 768px) {
		.app-container {
			flex-direction: column;
		}

		.left-panel,
		.canvas-panel {
			width: 100%;
			flex: none;
		}

		.left-panel {
			height: 40%;
			border-right: none;
			border-bottom: 1px solid var(--card-border);
		}

		.canvas-panel {
			height: 60%;
		}
	}
</style>
