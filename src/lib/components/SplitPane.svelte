<script lang="ts">
  import { viewMode } from '../stores/editorStore';

  let splitPosition = 50; // percentage
  let isDragging = false;
  let container: HTMLDivElement;

  function onMouseDown(e: MouseEvent) {
    if ($viewMode !== 'split') return;
    isDragging = true;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  function onMouseMove(e: MouseEvent) {
    if (!isDragging || !container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(15, Math.min(85, (x / rect.width) * 100));
    splitPosition = percentage;
  }

  function onMouseUp() {
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  }
</script>

<div class="split-pane-container" bind:this={container}>
  {#if $viewMode === 'split'}
    <div class="pane left-pane" style="width: {splitPosition}%;">
      <slot name="left" />
    </div>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="divider" on:mousedown={onMouseDown} class:dragging={isDragging}>
      <div class="divider-line"></div>
    </div>
    <div class="pane right-pane" style="width: {100 - splitPosition}%;">
      <slot name="right" />
    </div>
  {:else if $viewMode === 'editor'}
    <div class="pane full-pane">
      <slot name="left" />
    </div>
  {:else if $viewMode === 'preview'}
    <div class="pane full-pane">
      <slot name="right" />
    </div>
  {/if}
</div>

<style>
  .split-pane-container {
    width: 100%;
    height: 100%;
    display: flex;
    position: relative;
    overflow: hidden;
  }

  .pane {
    height: 100%;
    overflow: hidden;
  }

  .full-pane {
    width: 100%;
  }

  .divider {
    width: 6px;
    height: 100%;
    cursor: col-resize;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 10;
    transition: background 0.15s ease;
  }

  .divider:hover, .divider.dragging {
    background: var(--brand-glow);
  }

  .divider-line {
    width: 1px;
    height: 100%;
    background: var(--border-color);
  }

  .divider:hover .divider-line, .divider.dragging .divider-line {
    background: var(--brand-primary);
  }
</style>
