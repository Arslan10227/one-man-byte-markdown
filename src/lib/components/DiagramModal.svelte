<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { X, ZoomIn, ZoomOut, RotateCcw, Maximize2, Copy, Download, Check } from 'lucide-svelte';
  import { toastStore } from '../stores/toastStore';

  export let isOpen = false;
  export let svgContent: string = '';
  export let title: string = 'Diagram Viewer';

  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let copied = false;
  let containerRef: HTMLDivElement;
  let contentRef: HTMLDivElement;

  $: if (isOpen) {
    resetView();
  }

  function resetView() {
    scale = 1;
    translateX = 0;
    translateY = 0;
  }

  function zoomIn() {
    scale = Math.min(scale * 1.25, 6.0);
  }

  function zoomOut() {
    scale = Math.max(scale / 1.25, 0.15);
  }

  function fitToScreen() {
    if (!containerRef || !contentRef) return;
    const svgEl = contentRef.querySelector('svg');
    if (!svgEl) return;

    const cRect = containerRef.getBoundingClientRect();
    const sRect = svgEl.getBoundingClientRect();
    
    // Compute natural size
    const naturalWidth = svgEl.viewBox?.baseVal?.width || svgEl.clientWidth || 600;
    const naturalHeight = svgEl.viewBox?.baseVal?.height || svgEl.clientHeight || 400;

    const scaleX = (cRect.width - 80) / naturalWidth;
    const scaleY = (cRect.height - 120) / naturalHeight;
    scale = Math.min(scaleX, scaleY, 2.5);
    translateX = 0;
    translateY = 0;
  }

  function handleWheel(e: WheelEvent) {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    const newScale = Math.min(Math.max(scale * zoomFactor, 0.15), 6.0);
    scale = newScale;
  }

  function handleMouseDown(e: MouseEvent) {
    if (e.button !== 0) return; // Only left click
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
  }

  function handleMouseUp() {
    isDragging = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      close();
    } else if (e.key === '+' || e.key === '=') {
      zoomIn();
    } else if (e.key === '-') {
      zoomOut();
    } else if (e.key === '0') {
      resetView();
    }
  }

  function close() {
    isOpen = false;
  }

  async function copySvg() {
    try {
      await navigator.clipboard.writeText(svgContent);
      copied = true;
      toastStore.success('Diagram SVG copied to clipboard');
      setTimeout(() => (copied = false), 2000);
    } catch (e) {
      toastStore.error('Failed to copy SVG');
    }
  }

  function downloadSvg() {
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagram-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toastStore.success('Diagram exported as SVG');
  }

  function downloadPng() {
    if (!contentRef) return;
    const svgEl = contentRef.querySelector('svg');
    if (!svgEl) return;

    const svgXml = new XMLSerializer().serializeToString(svgEl);
    const naturalWidth = svgEl.viewBox?.baseVal?.width || svgEl.clientWidth || 800;
    const naturalHeight = svgEl.viewBox?.baseVal?.height || svgEl.clientHeight || 600;

    const img = new Image();
    const svgBlob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      // 2x supersampling for ultra sharp crisp rendering
      canvas.width = naturalWidth * 2;
      canvas.height = naturalHeight * 2;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `diagram-${Date.now()}.png`;
        a.click();
        toastStore.success('Diagram exported as high-res PNG');
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="diagram-modal-overlay" on:click={close}>
    <div class="diagram-modal-card" on:click|stopPropagation>
      <!-- Header / Toolbar -->
      <div class="modal-topbar">
        <div class="diagram-title">
          <span>{title}</span>
          <span class="zoom-badge">{Math.round(scale * 100)}%</span>
        </div>

        <div class="toolbar-actions">
          <button class="tool-btn" title="Zoom In (+)" on:click={zoomIn}>
            <ZoomIn size={16} />
          </button>
          <button class="tool-btn" title="Zoom Out (-)" on:click={zoomOut}>
            <ZoomOut size={16} />
          </button>
          <button class="tool-btn" title="Reset Zoom (0)" on:click={resetView}>
            <RotateCcw size={15} />
          </button>
          <button class="tool-btn" title="Fit to Screen" on:click={fitToScreen}>
            <Maximize2 size={15} />
          </button>

          <div class="divider"></div>

          <button class="tool-btn" title="Copy SVG" on:click={copySvg}>
            {#if copied}
              <Check size={16} style="color: var(--success);" />
            {:else}
              <Copy size={16} />
            {/if}
          </button>
          <button class="tool-btn" title="Export as PNG" on:click={downloadPng}>
            <Download size={16} />
            <span class="btn-text">PNG</span>
          </button>
          <button class="tool-btn" title="Export as SVG" on:click={downloadSvg}>
            <Download size={16} />
            <span class="btn-text">SVG</span>
          </button>

          <div class="divider"></div>

          <button class="close-modal-btn" title="Close (Esc)" on:click={close}>
            <X size={18} />
          </button>
        </div>
      </div>

      <!-- Canvas Area (Pan & Zoom) -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="diagram-canvas-container"
        bind:this={containerRef}
        on:wheel={handleWheel}
        on:mousedown={handleMouseDown}
        on:mousemove={handleMouseMove}
        on:mouseup={handleMouseUp}
        on:mouseleave={handleMouseUp}
        class:is-dragging={isDragging}
      >
        <div
          class="diagram-content-layer"
          bind:this={contentRef}
          style="transform: translate({translateX}px, {translateY}px) scale({scale});"
        >
          <!-- SVG Container -->
          {@html svgContent}
        </div>

        <div class="canvas-hint">
          <span>Scroll to Zoom • Click & Drag to Pan • Esc to Close</span>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .diagram-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(4, 7, 13, 0.85);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 24px;
    animation: fadeIn 0.15s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .diagram-modal-card {
    width: 95vw;
    height: 90vh;
    max-width: 1400px;
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .modal-topbar {
    height: 52px;
    background: var(--bg-surface-elevated);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    user-select: none;
    z-index: 10;
  }

  .diagram-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.92rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .zoom-badge {
    background: var(--bg-app);
    border: 1px solid var(--border-color);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--brand-primary);
    font-family: var(--font-mono);
  }

  .toolbar-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .tool-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    height: 32px;
    border-radius: 6px;
    background: var(--bg-app);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .tool-btn:hover {
    background: var(--bg-hover);
    border-color: var(--brand-primary);
    color: var(--text-primary);
  }

  .btn-text {
    font-size: 0.72rem;
  }

  .divider {
    width: 1px;
    height: 20px;
    background: var(--border-color);
    margin: 0 4px;
  }

  .close-modal-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background: transparent;
    border: 1px solid transparent;
    color: var(--text-muted);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .close-modal-btn:hover {
    background: #ef4444;
    color: #ffffff;
  }

  .diagram-canvas-container {
    flex: 1;
    position: relative;
    overflow: hidden;
    background: var(--bg-app);
    cursor: grab;
    display: flex;
    align-items: center;
    justify-content: center;
    user-select: none;
  }

  .diagram-canvas-container.is-dragging {
    cursor: grabbing;
  }

  .diagram-content-layer {
    position: absolute;
    transform-origin: center center;
    transition: transform 0.05s linear;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .diagram-content-layer :global(svg) {
    max-width: none !important;
    max-height: none !important;
    height: auto;
    filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.3));
  }

  .canvas-hint {
    position: absolute;
    bottom: 16px;
    background: rgba(15, 23, 42, 0.75);
    backdrop-filter: blur(4px);
    border: 1px solid var(--border-color);
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.72rem;
    color: var(--text-muted);
    pointer-events: none;
  }
</style>
