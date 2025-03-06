<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { filterObjectTypeYaml } from '$lib/yamlParser';

	export let yaml: string = '';
	let filteredYaml: string = '';
	let showFiltered: boolean = true;

	const dispatch = createEventDispatcher();

	// Update filtered YAML whenever the input changes
	$: {
		try {
			filteredYaml = filterObjectTypeYaml(yaml);
		} catch (e) {
			console.error('Error filtering YAML:', e);
			filteredYaml = ''; // Clear on error
		}
	}

	// The YAML to display (filtered or original)
	$: displayYaml = showFiltered ? filteredYaml || yaml : yaml;

	// Handle textarea input
	function handleInput(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		const newValue = target.value;
		yaml = newValue;
		dispatch('change', { yaml: newValue });
	}

	// Toggle between filtered and full view
	function toggleFilter() {
		showFiltered = !showFiltered;
	}

	// Clear the text
	function clearText() {
		yaml = '';
		dispatch('change', { yaml: '' });
	}
</script>

<div class="object-type-editor">
	<div class="editor-header">
		<h3>Input Objects {showFiltered ? '(ObjectType only)' : '(All)'}</h3>
		<div class="editor-controls">
			<button
				class="icon-button"
				title={showFiltered ? 'Show All Objects' : 'Show ObjectType Only'}
				on:click={toggleFilter}
			>
				<span class="visually-hidden"
					>{showFiltered ? 'Show All Objects' : 'Show ObjectType Only'}</span
				>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
					<circle cx="12" cy="12" r="3"></circle>
				</svg>
			</button>
			<button class="icon-button" title="Clear" on:click={clearText}>
				<span class="visually-hidden">Clear</span>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
					<path d="M3 6h18"></path>
					<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
				</svg>
			</button>
		</div>
	</div>

	<div class="editor-content">
		<textarea
			value={yaml}
			on:input={handleInput}
			placeholder="Paste or enter YAML objects here. Only ObjectType objects will be displayed by default."
		></textarea>

		{#if showFiltered && filteredYaml && yaml !== filteredYaml}
			<div class="filter-badge">
				<span
					>Filtered view: {yaml.split('---').length - 1} documents, {filteredYaml.split('---')
						.length} ObjectType</span
				>
			</div>
		{/if}
	</div>
</div>

<style>
	.object-type-editor {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
	}

	.editor-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 1rem;
		background-color: var(--bg-color);
		border-bottom: 1px solid var(--card-border);
	}

	.editor-header h3 {
		margin: 0;
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--text-color);
	}

	.editor-controls {
		display: flex;
		gap: 0.5rem;
	}

	.icon-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		padding: 0;
		border: none;
		border-radius: var(--radius-sm);
		background-color: transparent;
		color: var(--text-light);
		transition: all var(--transition-speed) ease;
	}

	.icon-button:hover {
		background-color: var(--primary-light);
		color: var(--primary-color);
	}

	.editor-content {
		flex: 1;
		overflow: auto;
		padding: 1rem;
		background-color: var(--card-bg);
		position: relative;
	}

	textarea {
		width: 100%;
		height: 100%;
		min-height: 200px;
		box-sizing: border-box;
		font-family: var(--font-mono);
		font-size: 0.9rem;
		line-height: 1.5;
		padding: 0.5rem;
		color: var(--text-color);
		background-color: var(--card-bg);
		border: 1px solid var(--card-border);
		border-radius: var(--radius-sm);
		resize: none;
	}

	textarea:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 0 2px var(--primary-light);
	}

	.filter-badge {
		position: absolute;
		bottom: 10px;
		right: 10px;
		background-color: var(--primary-light);
		color: var(--primary-dark);
		border-radius: var(--radius-md);
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		font-weight: 500;
		opacity: 0.8;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>
