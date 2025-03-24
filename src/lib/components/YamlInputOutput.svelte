<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { filterObjectTypeYaml } from '$lib/yamlParser';

	const dispatch = createEventDispatcher();

	export let inputYaml: string;
	export let outputYaml: string;

	// Flag to control if we're showing filtered view or original
	let showFiltered = true;

	// State for copy feedback
	let isCopied = false;
	let copyTimeout: ReturnType<typeof setTimeout> | null = null;

	// Get the filtered YAML for display
	$: displayYaml = showFiltered ? filterObjectTypeYaml(inputYaml) || inputYaml : inputYaml;

	// Clean up any timeouts on component destroy
	onMount(() => {
		return () => {
			if (copyTimeout) clearTimeout(copyTimeout);
		};
	});

	// Dispatch input changes to the parent
	function handleInput(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		dispatch('inputChange', { yaml: target.value });
	}

	// Clear the input
	function clearInput() {
		dispatch('inputChange', { yaml: '' });
	}

	// Toggle between filtered and full view
	function toggleFilter() {
		showFiltered = !showFiltered;
	}

	// Copy output to clipboard with visual feedback
	function copyToClipboard() {
		if (!outputYaml) return;

		// Use modern clipboard API if available
		if (navigator.clipboard) {
			navigator.clipboard
				.writeText(outputYaml)
				.then(() => {
					showCopySuccess();
				})
				.catch((err) => {
					console.error('Clipboard API failed:', err);
					fallbackCopy();
				});
		} else {
			fallbackCopy();
		}
	}

	// Fallback copy method using text area
	function fallbackCopy() {
		try {
			// Create temporary textarea
			const textArea = document.createElement('textarea');
			textArea.value = outputYaml;
			textArea.style.position = 'fixed';
			textArea.style.left = '-999999px';
			textArea.style.top = '-999999px';
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();

			// Perform copy
			const successful = document.execCommand('copy');
			document.body.removeChild(textArea);

			if (successful) {
				showCopySuccess();
			}
		} catch (err) {
			console.error('Fallback copy failed:', err);
		}
	}

	// Show success feedback
	function showCopySuccess() {
		isCopied = true;

		// Clear any existing timeout
		if (copyTimeout) clearTimeout(copyTimeout);

		// Reset after 2 seconds
		copyTimeout = setTimeout(() => {
			isCopied = false;
			copyTimeout = null;
		}, 2000);
	}
</script>

<div class="yaml-io">
	<div class="yaml-section input-section">
		<div class="yaml-header">
			<h3>Input Objects {showFiltered ? '(ObjectType only)' : '(All)'}</h3>
			<div class="yaml-controls">
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
				<button class="icon-button" title="Clear" on:click={clearInput}>
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
			{#if showFiltered && displayYaml !== inputYaml}
				<div class="filter-badge">
					<span>Filtered view active</span>
				</div>
			{/if}
		</div>
	</div>

	<div class="yaml-section output-section">
		<div class="yaml-header">
			<h3>Generated Relationships</h3>
			<div class="yaml-controls">
				<button class="icon-button" title="Copy to clipboard" on:click={copyToClipboard}>
					<span class="visually-hidden">Copy to clipboard</span>
					{#if isCopied}
						<!-- Checkmark icon for copied state -->
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
							class="copied-icon"
						>
							<path d="M20 6L9 17l-5-5"></path>
						</svg>
					{:else}
						<!-- Copy icon for normal state -->
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
					{/if}
				</button>
			</div>
		</div>
		<div class="yaml-content">
			<pre>{outputYaml}</pre>
			{#if isCopied}
				<div class="copy-toast" transition:fade={{ duration: 200 }}>Copied to clipboard!</div>
			{/if}
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
		position: relative;
	}

	.icon-button:hover {
		background-color: var(--primary-light);
		color: var(--primary-color);
	}

	.icon-button .copied-icon {
		color: var(--success-color, #10b981);
	}

	.yaml-content {
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
		pointer-events: none;
	}

	.copy-toast {
		position: absolute;
		bottom: 20px;
		right: 20px;
		background-color: var(--success-color, #10b981);
		color: white;
		padding: 8px 12px;
		border-radius: var(--radius-md);
		font-size: 0.85rem;
		font-weight: 500;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		z-index: 10;
	}
</style>
