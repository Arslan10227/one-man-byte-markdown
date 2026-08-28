<script lang="ts">
  import { files, activeFileId, editorActions } from '../stores/editorStore';
  import { Plus, X, FileText } from 'lucide-svelte';

  function handleSelect(id: string) {
    activeFileId.set(id);
  }

  function handleClose(e: MouseEvent, id: string) {
    e.stopPropagation();
    editorActions.closeTab(id);
  }
</script>

<div class="tabbar">
  <div class="tab-list">
    {#each $files as file (file.id)}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="tab-item"
        class:active={file.id === $activeFileId}
        on:click={() => handleSelect(file.id)}
      >
        <FileText size={13} class="tab-icon" />
        <span class="tab-title" title={file.path || file.name}>{file.name}</span>
        {#if file.isDirty}
          <span class="tab-dirty" title="Unsaved changes">●</span>
        {/if}
        <button
          class="tab-close"
          title="Close tab"
          on:click={(e) => handleClose(e, file.id)}
        >
          <X size={12} />
        </button>
      </div>
    {/each}
  </div>

  <button class="new-tab-btn" title="New Document" on:click={() => editorActions.createNewFile()}>
    <Plus size={14} />
  </button>
</div>

<style>
  .tabbar {
    height: var(--tabbar-height);
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    padding: 0 4px;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .tab-list {
    display: flex;
    align-items: center;
    height: 100%;
    gap: 2px;
  }

  .tab-item {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    padding: 0 10px;
    background: transparent;
    border-radius: 4px;
    font-size: 0.76rem;
    color: var(--text-secondary);
    cursor: pointer;
    max-width: 180px;
    border: 1px solid transparent;
    transition: all 0.15s ease;
  }

  .tab-item:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .tab-item.active {
    background: var(--bg-app);
    color: var(--text-primary);
    border-color: var(--border-color);
    box-shadow: var(--shadow-sm);
    font-weight: 500;
  }

  :global(.tab-icon) {
    color: var(--brand-primary);
    flex-shrink: 0;
  }

  .tab-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tab-dirty {
    color: var(--accent-warning);
    font-size: 0.65rem;
  }

  .tab-close {
    width: 16px;
    height: 16px;
    border-radius: 3px;
    opacity: 0.5;
    margin-left: 2px;
  }

  .tab-close:hover {
    opacity: 1;
    background: var(--bg-surface-elevated);
    color: var(--accent-danger);
  }

  .new-tab-btn {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    color: var(--text-muted);
    margin-left: 4px;
    flex-shrink: 0;
  }

  .new-tab-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
</style>
