<script lang="ts">
  import { activeFile, settings } from '../stores/editorStore';
  import { computeDocStats } from '../markdown/parser';

  export let cursorLine: number = 1;
  export let cursorCol: number = 1;

  $: stats = $activeFile ? computeDocStats($activeFile.content) : { words: 0, characters: 0, readingTimeMin: 0, lines: 0 };
</script>

<div class="statusbar">
  <div class="status-left">
    {#if $activeFile}
      <span class="status-item">
        <strong>{stats.words}</strong> words
      </span>
      <span class="status-item">
        <strong>{stats.characters}</strong> chars
      </span>
      <span class="status-item">
        ~<strong>{stats.readingTimeMin}</strong> min read
      </span>
    {:else}
      <span class="status-item">Ready</span>
    {/if}
  </div>

  <div class="status-right">
    {#if $activeFile}
      <span class="status-item">
        Ln {cursorLine}, Col {cursorCol}
      </span>
      <span class="status-item">
        {stats.lines} lines
      </span>
    {/if}
    <span class="status-item">UTF-8</span>
    <span class="status-item">Markdown</span>
    {#if $settings.syncScroll}
      <span class="status-badge" title="Synchronized scrolling active">Sync ON</span>
    {/if}
  </div>
</div>

<style>
  .statusbar {
    height: var(--statusbar-height);
    background: var(--bg-surface);
    border-top: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    font-size: 0.72rem;
    color: var(--text-secondary);
    user-select: none;
    z-index: 40;
  }

  .status-left, .status-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .status-item {
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }

  .status-item strong {
    color: var(--text-primary);
    font-weight: 600;
  }

  .status-badge {
    background: var(--brand-glow);
    color: var(--brand-primary);
    border: 1px solid var(--brand-primary);
    font-size: 0.65rem;
    font-weight: 700;
    padding: 1px 4px;
    border-radius: 3px;
  }
</style>
