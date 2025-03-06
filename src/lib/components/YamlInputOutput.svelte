<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let inputYaml: string;
	export let outputYaml: string;

	// Dispatch input changes to the parent
	function handleInput(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		dispatch('inputChange', { yaml: target.value });
	}
</script>

<div class="yaml-io">
	<div class="yaml-section input-section">
		<div class="yaml-header">
			<h3>Input Objects</h3>
			<div class="yaml-controls">
				<button class="icon-button" title="Clear">
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
		<div class="yaml-content">
			<textarea bind:value={inputYaml} on:input={handleInput}></textarea>
		</div>
	</div>

	<div class="yaml-section output-section">
		<div class="yaml-header">
			<h3>Generated Relationships</h3>
			<div class="yaml-controls">
				<button class="icon-button" title="Copy to clipboard">
					<span class="visually-hidden">Copy to clipboard</span>
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
						<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
						<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
					</svg>
				</button>
			</div>
		</div>
		<div class="yaml-content">
			<pre>{outputYaml}</pre>
		</div>
	</div>
</div>

<style>
	.yaml-io {
		display: flex;
		flex-direction: column;
		height: 100%;
		background-color: var(--card-bg);
	}

	.yaml-section {
		display: flex;
		flex-direction: column;
		flex: 1;
		padding: 0;
		position: relative;
		overflow: hidden;
	}

	.yaml-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 1rem;
		background-color: var(--bg-color);
		border-bottom: 1px solid var(--card-border);
	}

	.yaml-header h3 {
		margin: 0;
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--text-color);
	}

	.yaml-controls {
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
		border-radius: var(--radius-sm);
		background-color: transparent;
		color: var(--text-light);
		transition: all var(--transition-speed) ease;
	}

	.icon-button:hover {
		background-color: var(--primary-light);
		color: var(--primary-color);
	}

	.yaml-content {
		flex: 1;
		overflow: auto;
		padding: 1rem;
		background-color: var(--card-bg);
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

	pre {
		white-space: pre-wrap;
		word-break: break-word;
		font-family: var(--font-mono);
		font-size: 0.9rem;
		line-height: 1.5;
		margin: 0;
		padding: 0.5rem;
		color: var(--text-color);
		background-color: var(--card-bg);
		border: 1px solid var(--card-border);
		border-radius: var(--radius-sm);
		height: 100%;
		overflow: auto;
	}

	.input-section,
	.output-section {
		border-bottom: 1px solid var(--card-border);
	}
</style>
