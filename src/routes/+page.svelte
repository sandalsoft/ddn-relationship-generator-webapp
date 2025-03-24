<script lang="ts">
	import Canvas from '../lib/components/Canvas.svelte';
	import YamlInputOutput from '../lib/components/YamlInputOutput.svelte';
	import FileUpload from '../lib/components/FileUpload.svelte';
	import { parseObjectsFromYaml, generateRelationshipYaml } from '$lib/yamlParser';
	import type { Relationship } from '$lib/types';
	import { fade } from 'svelte/transition';


	// Replace this string with sample.hml for a more complex demo
	// Default sample YAML with document separators
	const defaultYaml = `kind: ObjectType
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

	// State variables
	let inputYaml = defaultYaml;
	let objects = parseObjectsFromYaml(inputYaml);
	let relationshipYaml = '';
	let showUpload = false;
	let uploadedFiles: string[] = [];
	let isCustomData = false;

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

	// Handle uploaded files
	function handleFilesUploaded(event: CustomEvent) {
		const content = event.detail.content;
		const fileNames = event.detail.fileNames;

		// Error flag
		let hasError = false;

		try {
			// Replace default objects with uploaded content
			inputYaml = content;
			const parsedObjects = parseObjectsFromYaml(content);

			if (parsedObjects.length === 0) {
				// Show error that no valid objects were found
				showError(
					`No valid ObjectType definitions found in the uploaded files. Please ensure your files contain objects with 'kind: ObjectType'.`
				);
				hasError = true;
			} else {
				// Success - use the parsed objects
				objects = parsedObjects;
				isCustomData = true;
				uploadedFiles = fileNames;

				// Show success message or info about the objects
				if (document.querySelector('.error-notification')) {
					document.querySelector('.error-notification')?.remove();
				}
			}
		} catch (error) {
			// Handle YAML parsing errors
			showError(
				`Error parsing the uploaded files: ${error instanceof Error ? error.message : String(error)}`
			);
			hasError = true;
		} finally {
			// Only hide the upload panel if no errors occurred
			if (!hasError) {
				showUpload = false;
			}
		}
	}

	// Show error notification
	function showError(message: string) {
		// Check if we already have an error notification
		let errorNotification = document.querySelector('.error-notification');

		if (!errorNotification) {
			// Create a new error notification
			errorNotification = document.createElement('div');
			errorNotification.className = 'error-notification';

			const errorIcon = document.createElement('div');
			errorIcon.className = 'error-icon';
			errorIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

			const errorMessage = document.createElement('div');
			errorMessage.className = 'error-message';

			const closeButton = document.createElement('button');
			closeButton.className = 'error-close';
			closeButton.innerHTML = '×';
			closeButton.onclick = () => {
				if (document.body.contains(errorNotification as Node)) {
					document.body.removeChild(errorNotification as Node);
				}
			};

			errorNotification.appendChild(errorIcon);
			errorNotification.appendChild(errorMessage);
			errorNotification.appendChild(closeButton);

			document.body.appendChild(errorNotification);

			// Auto-dismiss after 5 seconds
			setTimeout(() => {
				if (document.body.contains(errorNotification as Node)) {
					document.body.removeChild(errorNotification as Node);
				}
			}, 5000);
		}

		// Update the error message
		const messageElement = errorNotification.querySelector('.error-message');
		if (messageElement) {
			messageElement.textContent = message;
		}
	}

	// Reset to default objects
	function resetToDefaults() {
		inputYaml = defaultYaml;
		objects = parseObjectsFromYaml(defaultYaml);
		isCustomData = false;
		uploadedFiles = [];
	}

	// Toggle upload panel
	function toggleUpload() {
		showUpload = !showUpload;
	}
</script>

<main>
	<div class="app-header">
		<h1>Relationship Builder</h1>
		<div class="app-controls">
			<button class="secondary" on:click={toggleUpload}>
				{showUpload ? 'Cancel Upload' : 'Upload Objects'}
			</button>
			{#if isCustomData}
				<button class="danger" on:click={resetToDefaults}>Reset to Defaults</button>
			{/if}
			<button class="secondary">Export</button>
		</div>
	</div>

	<div class="app-container">
		<div class="left-panel">
			{#if showUpload}
				<div class="upload-panel" transition:fade={{ duration: 200 }}>
					<h2>Upload Object Files</h2>
					<p class="help-text">
						Upload .hml, .yaml, or .yml files containing object definitions. Only objects with
						"kind: ObjectType" will be used.
					</p>
					<FileUpload on:filesUploaded={handleFilesUploaded} />
				</div>
			{:else if uploadedFiles.length > 0}
				<div class="files-info" transition:fade={{ duration: 200 }}>
					<h3>Loaded files:</h3>
					<ul class="file-list">
						{#each uploadedFiles as file}
							<li>{file}</li>
						{/each}
					</ul>
					<p class="object-count">{objects.length} objects found</p>
				</div>
			{/if}

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
		display: flex;
		flex-direction: column;
	}

	.upload-panel {
		padding: 1rem;
		background-color: var(--card-bg);
		border-bottom: 1px solid var(--card-border);
	}

	.upload-panel h2 {
		font-size: 1.2rem;
		margin-top: 0;
		margin-bottom: 1rem;
		color: var(--text-color);
	}

	.help-text {
		font-size: 0.9rem;
		color: var(--text-light);
		margin-bottom: 1rem;
	}

	.files-info {
		padding: 1rem;
		background-color: var(--primary-light);
		border-bottom: 1px solid var(--card-border);
	}

	.files-info h3 {
		font-size: 0.9rem;
		margin-top: 0;
		margin-bottom: 0.5rem;
		color: var(--primary-dark);
	}

	.file-list {
		list-style: none;
		padding-left: 0.5rem;
		margin: 0 0 0.5rem 0;
		font-size: 0.8rem;
		color: var(--text-color);
	}

	.file-list li {
		margin-bottom: 0.25rem;
	}

	.object-count {
		font-size: 0.8rem;
		margin: 0;
		color: var(--primary-dark);
		font-weight: 500;
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

	/* Error notification styles */
	:global(.error-notification) {
		position: fixed;
		bottom: 20px;
		left: 50%;
		transform: translateX(-50%);
		background-color: #fee2e2;
		color: #b91c1c;
		padding: 0.75rem 1rem;
		border-radius: 4px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		gap: 0.75rem;
		max-width: 80%;
		z-index: 1000;
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			transform: translate(-50%, 100%);
			opacity: 0;
		}
		to {
			transform: translate(-50%, 0);
			opacity: 1;
		}
	}

	:global(.error-icon) {
		color: #b91c1c;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	:global(.error-message) {
		flex: 1;
		font-size: 0.9rem;
	}

	:global(.error-close) {
		background: none;
		border: none;
		color: #b91c1c;
		font-size: 1.25rem;
		line-height: 1;
		cursor: pointer;
		padding: 0 0.25rem;
	}

	:global(.error-close:hover) {
		color: #7f1d1d;
	}

	button.secondary {
		background-color: var(--card-bg);
		color: var(--primary-dark);
		border: 1px solid var(--card-border);
		padding: 0.5rem 1rem;
		border-radius: 4px;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	button.secondary:hover {
		background-color: var(--primary-light);
		border-color: var(--primary);
	}

	button.danger {
		background-color: #fee2e2;
		color: #b91c1c;
		border: 1px solid #f87171;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	button.danger:hover {
		background-color: #fecaca;
		border-color: #ef4444;
	}
</style>
