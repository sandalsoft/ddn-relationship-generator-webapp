<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	// State variables
	let dragActive = false;
	let files: FileList | null = null;
	let errorMessage = '';
	let uploading = false;

	// Valid file extensions
	const validExtensions = ['.hml', '.yaml', '.yml'];

	// Event handlers for drag and drop
	function handleDragEnter(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		dragActive = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		dragActive = false;
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		dragActive = true;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		dragActive = false;

		if (e.dataTransfer) {
			files = e.dataTransfer.files;
			validateAndProcessFiles();
		}
	}

	// File input change handler
	function handleFileInputChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files) {
			files = target.files;
			validateAndProcessFiles();
		}
	}

	// Validate and process selected files
	function validateAndProcessFiles() {
		if (!files || files.length === 0) {
			setError('No files selected');
			return;
		}

		// Filter valid files
		const validFiles: File[] = [];
		const fileNames: string[] = [];

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const fileName = file.name.toLowerCase();

			// Check if file has valid extension
			if (validExtensions.some((ext) => fileName.endsWith(ext))) {
				validFiles.push(file);
				fileNames.push(file.name);
			}
		}

		if (validFiles.length === 0) {
			setError(`Please select files with valid extensions: ${validExtensions.join(', ')}`);
			return;
		}

		// Process valid files
		processFiles(validFiles, fileNames);
	}

	// Process and read files
	async function processFiles(validFiles: File[], fileNames: string[]) {
		uploading = true;
		errorMessage = '';

		try {
			// Read all files and combine their contents
			const fileContents = await Promise.all(validFiles.map((file) => readFileAsText(file)));

			// Combine all file contents with document separators
			const combinedContent = fileContents
				.filter((content) => content) // Remove empty contents
				.join('\n---\n'); // Add document separator

			// Dispatch the combined content
			dispatch('filesUploaded', {
				content: combinedContent,
				fileNames: fileNames
			});
		} catch (error) {
			if (error instanceof Error) {
				setError(`Error reading files: ${error.message}`);
			} else {
				setError('An unknown error occurred while reading files');
			}
		} finally {
			uploading = false;
		}
	}

	// Read file as text
	function readFileAsText(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = () => {
				if (typeof reader.result === 'string') {
					resolve(reader.result);
				} else {
					reject(new Error('Failed to read file as text'));
				}
			};

			reader.onerror = () => {
				reject(new Error('File read error'));
			};

			reader.readAsText(file);
		});
	}

	// Set error message
	function setError(message: string) {
		errorMessage = message;
		setTimeout(() => {
			errorMessage = '';
		}, 5000); // Clear error after 5 seconds
	}

	// Clear file selection
	function clearFiles() {
		files = null;
		errorMessage = '';
	}
</script>

<div class="file-upload">
	<!-- Drag and drop area -->
	<div
		class="dropzone"
		class:active={dragActive}
		on:dragenter={handleDragEnter}
		on:dragleave={handleDragLeave}
		on:dragover={handleDragOver}
		on:drop={handleDrop}
	>
		<div class="dropzone-content">
			<div class="upload-icon">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
					<polyline points="17 8 12 3 7 8"></polyline>
					<line x1="12" y1="3" x2="12" y2="15"></line>
				</svg>
			</div>
			<p class="dropzone-text">
				Drag and drop your files here<br />
				<span class="dropzone-subtext">or</span>
			</p>
			<label class="file-input-label">
				Browse Files
				<input
					type="file"
					accept=".hml,.yaml,.yml"
					multiple
					on:change={handleFileInputChange}
					class="file-input"
				/>
			</label>
			<p class="supported-formats">
				Supported formats: {validExtensions.join(', ')}
			</p>
		</div>
	</div>

	<!-- File list -->
	{#if files && files.length > 0}
		<div class="selected-files">
			<div class="files-header">
				<h3>Selected Files ({files.length})</h3>
				<button class="clear-button" on:click={clearFiles}>Clear</button>
			</div>
			<ul class="files-list">
				{#each Array.from(files) as file}
					<li class="file-item">
						<span class="file-name">{file.name}</span>
						<span class="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Error message -->
	{#if errorMessage}
		<div class="error-message">
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
				<circle cx="12" cy="12" r="10"></circle>
				<line x1="12" y1="8" x2="12" y2="12"></line>
				<line x1="12" y1="16" x2="12.01" y2="16"></line>
			</svg>
			{errorMessage}
		</div>
	{/if}

	<!-- Loading indicator -->
	{#if uploading}
		<div class="loading">
			<div class="spinner"></div>
			<p>Processing files...</p>
		</div>
	{/if}
</div>

<style>
	.file-upload {
		width: 100%;
		margin-bottom: 1rem;
	}

	.dropzone {
		border: 2px dashed var(--card-border);
		border-radius: 4px;
		padding: 2rem 1rem;
		background-color: var(--bg-color);
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.dropzone.active {
		border-color: var(--primary);
		background-color: var(--primary-light);
	}

	.dropzone-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	.upload-icon {
		margin-bottom: 1rem;
		color: var(--primary);
	}

	.dropzone-text {
		margin: 0 0 1rem;
		font-size: 1rem;
		color: var(--text-color);
	}

	.dropzone-subtext {
		color: var(--text-light);
		font-size: 0.9rem;
	}

	.file-input {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		border: 0;
	}

	.file-input-label {
		display: inline-block;
		padding: 0.5rem 1rem;
		background-color: var(--primary);
		color: white;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 500;
		transition: background-color 0.2s ease;
	}

	.file-input-label:hover {
		background-color: var(--primary-dark);
	}

	.supported-formats {
		margin-top: 1rem;
		font-size: 0.8rem;
		color: var(--text-light);
	}

	.selected-files {
		margin-top: 1rem;
		padding: 1rem;
		background-color: var(--card-bg);
		border-radius: 4px;
		border: 1px solid var(--card-border);
	}

	.files-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.files-header h3 {
		margin: 0;
		font-size: 0.9rem;
		color: var(--text-color);
	}

	.clear-button {
		background: none;
		border: none;
		color: var(--primary);
		cursor: pointer;
		font-size: 0.8rem;
		padding: 0;
	}

	.clear-button:hover {
		color: var(--primary-dark);
		text-decoration: underline;
	}

	.files-list {
		list-style: none;
		padding: 0;
		margin: 0;
		max-height: 150px;
		overflow-y: auto;
	}

	.file-item {
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--card-border);
		font-size: 0.8rem;
		display: flex;
		justify-content: space-between;
	}

	.file-item:last-child {
		border-bottom: none;
	}

	.file-name {
		color: var(--text-color);
		max-width: 70%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.file-size {
		color: var(--text-light);
	}

	.error-message {
		margin-top: 1rem;
		padding: 0.75rem;
		background-color: #fee2e2;
		color: #b91c1c;
		border-radius: 4px;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
	}

	.loading {
		margin-top: 1rem;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		color: var(--text-color);
		font-size: 0.9rem;
	}

	.spinner {
		width: 18px;
		height: 18px;
		border: 2px solid rgba(0, 0, 0, 0.1);
		border-top-color: var(--primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
