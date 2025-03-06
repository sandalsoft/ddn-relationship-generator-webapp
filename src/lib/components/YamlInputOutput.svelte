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
  <div class="input-section">
    <h3>Input</h3>
    <textarea bind:value={inputYaml} on:input={handleInput} />
  </div>
  <div class="output-section">
    <h3>Output</h3>
    <pre>{outputYaml}</pre>
  </div>
</div>

<style>
  .yaml-io {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .input-section,
  .output-section {
    flex: 1;
    overflow: auto;
    padding: 10px;
  }
  textarea {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    font-family: monospace;
    resize: none;
  }
  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: monospace;
    margin: 0;
  }
</style>