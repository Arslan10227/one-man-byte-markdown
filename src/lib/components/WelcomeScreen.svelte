<script lang="ts">
  import { editorActions, recentFiles } from '../stores/editorStore';
  import { FilePlus, FolderOpen, FileText, Sparkles, BookOpen } from 'lucide-svelte';

  function handleRecentClick(filePath: string) {
    const name = filePath.split(/[\\/]/).pop() || filePath;
    editorActions.openFileFromPath(filePath, name);
  }
</script>

<div class="welcome-container">
  <div class="welcome-card">
    <div class="brand-hero">
      <div class="logo-circle">
        <Sparkles size={32} class="sparkle-icon" />
      </div>
      <h1>OneManByte <span class="accent-text">Markdown</span></h1>
      <p class="subtitle">Fast, lightweight, native-feeling markdown editing for Windows</p>
    </div>

    <div class="action-grid">
      <button class="hero-action-btn" on:click={() => editorActions.createNewFile()}>
        <FilePlus size={20} class="btn-icon" />
        <div class="btn-info">
          <span class="btn-title">New Document</span>
          <span class="btn-desc">Create a blank markdown file</span>
        </div>
      </button>

      <button class="hero-action-btn" on:click={() => editorActions.openFile()}>
        <FolderOpen size={20} class="btn-icon" />
        <div class="btn-info">
          <span class="btn-title">Open File</span>
          <span class="btn-desc">Open an existing .md file from disk</span>
        </div>
      </button>

      <button class="hero-action-btn" on:click={() => editorActions.openWorkspace()}>
        <BookOpen size={20} class="btn-icon" />
        <div class="btn-info">
          <span class="btn-title">Open Workspace</span>
          <span class="btn-desc">Open a project or folder</span>
        </div>
      </button>
    </div>

    {#if $recentFiles.length > 0}
      <div class="recent-section">
        <h3>Recent Documents</h3>
        <div class="recent-grid">
          {#each $recentFiles.slice(0, 5) as path}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="recent-chip" on:click={() => handleRecentClick(path)}>
              <FileText size={14} class="chip-icon" />
              <span class="chip-name">{path.split(/[\\/]/).pop()}</span>
              <span class="chip-path">{path}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .welcome-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-app);
    padding: 20px;
    overflow-y: auto;
  }

  .welcome-card {
    max-width: 620px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
  }

  .brand-hero {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .logo-circle {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background: var(--brand-glow);
    border: 1px solid var(--brand-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
  }

  :global(.sparkle-icon) {
    color: var(--brand-primary);
  }

  h1 {
    font-size: 1.8rem;
    font-weight: 800;
    color: var(--text-primary);
    letter-spacing: -0.02em;
  }

  .accent-text {
    color: var(--brand-primary);
  }

  .subtitle {
    font-size: 0.88rem;
    color: var(--text-secondary);
    max-width: 440px;
    line-height: 1.5;
  }

  .action-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    width: 100%;
  }

  .hero-action-btn {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    text-align: left;
    gap: 12px;
  }

  .hero-action-btn:hover {
    border-color: var(--brand-primary);
    background: var(--bg-surface-elevated);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  :global(.btn-icon) {
    color: var(--brand-primary);
  }

  .btn-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .btn-title {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .btn-desc {
    font-size: 0.72rem;
    color: var(--text-muted);
    line-height: 1.3;
  }

  .recent-section {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .recent-section h3 {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .recent-grid {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .recent-chip {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .recent-chip:hover {
    background: var(--bg-hover);
    border-color: var(--brand-primary);
  }

  :global(.chip-icon) {
    color: var(--brand-primary);
    flex-shrink: 0;
  }

  .chip-name {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
  }

  .chip-path {
    font-size: 0.72rem;
    color: var(--text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
