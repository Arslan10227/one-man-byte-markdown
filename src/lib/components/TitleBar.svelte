<script lang="ts">
  import {
    activeFile,
    viewMode,
    sidebarOpen,
    settingsModalOpen,
    editorActions,
  } from '../stores/editorStore';
  import { themeStore } from '../stores/themeStore';
  import {
    Columns2,
    Code2,
    Eye,
    PanelLeft,
    Sun,
    Moon,
    Settings,
    FilePlus,
    FolderOpen,
    Save,
    Share2,
    Minus,
    Square,
    X,
  } from 'lucide-svelte';
  import { minimizeWindow, maximizeWindow, isTauri } from '../platform/fs';
  import { exportToHtml, copyHtmlToClipboard, printDocument } from '../markdown/exporter';

  let showExportDropdown = false;

  function toggleExportMenu() {
    showExportDropdown = !showExportDropdown;
  }

  async function handleMinimize() {
    if (isTauri()) {
      await minimizeWindow();
    }
  }

  async function handleMaximize() {
    if (isTauri()) {
      await maximizeWindow();
    }
  }

  async function handleClose() {
    if (isTauri()) {
      await editorActions.requestAppClose();
    }
  }
</script>

<div class="titlebar" data-tauri-drag-region>
  <div class="titlebar-left">
    <button
      class="icon-btn"
      title="Toggle Sidebar (Ctrl+B)"
      on:click={() => sidebarOpen.update((v) => !v)}
    >
      <PanelLeft size={16} />
    </button>

    <div class="app-branding">
      <span class="brand-badge">⚡ OMB</span>
      <span class="brand-title">OneManByte</span>
      <span class="brand-sub">Markdown</span>
    </div>

    <div class="file-actions">
      <button class="menu-btn" title="New File (Ctrl+N)" on:click={() => editorActions.createNewFile()}>
        <FilePlus size={14} />
        <span>New</span>
      </button>
      <button class="menu-btn" title="Open File (Ctrl+O)" on:click={() => editorActions.openFile()}>
        <FolderOpen size={14} />
        <span>Open</span>
      </button>
      <button class="menu-btn" title="Save (Ctrl+S)" on:click={() => editorActions.saveActiveFile()}>
        <Save size={14} />
        <span>Save</span>
      </button>
    </div>
  </div>

  <div class="titlebar-center">
    {#if $activeFile}
      <span class="doc-name">
        {$activeFile.name}
        {#if $activeFile.isDirty}
          <span class="dirty-dot" title="Unsaved changes">●</span>
        {/if}
      </span>
      {#if $activeFile.path}
        <span class="doc-path" title={$activeFile.path}>{$activeFile.path}</span>
      {/if}
    {:else}
      <span class="doc-name-empty">No file open</span>
    {/if}
  </div>

  <div class="titlebar-right">
    <!-- View Mode Switcher -->
    <div class="mode-switch">
      <button
        class="mode-btn"
        class:active={$viewMode === 'editor'}
        title="Editor Only"
        on:click={() => viewMode.set('editor')}
      >
        <Code2 size={14} />
      </button>
      <button
        class="mode-btn"
        class:active={$viewMode === 'split'}
        title="Split View"
        on:click={() => viewMode.set('split')}
      >
        <Columns2 size={14} />
      </button>
      <button
        class="mode-btn"
        class:active={$viewMode === 'preview'}
        title="Preview Only"
        on:click={() => viewMode.set('preview')}
      >
        <Eye size={14} />
      </button>
    </div>

    <!-- Export Menu -->
    <div class="export-container">
      <button
        class="icon-btn"
        title="Export options"
        on:click={toggleExportMenu}
      >
        <Share2 size={15} />
      </button>
      {#if showExportDropdown}
        <div class="dropdown-menu">
          <button
            class="dropdown-item"
            on:click={() => {
              showExportDropdown = false;
              if ($activeFile) exportToHtml($activeFile.name, $activeFile.content, $themeStore === 'dark');
            }}
          >
            Export as HTML
          </button>
          <button
            class="dropdown-item"
            on:click={() => {
              showExportDropdown = false;
              if ($activeFile) copyHtmlToClipboard($activeFile.content);
            }}
          >
            Copy HTML
          </button>
          <button
            class="dropdown-item"
            on:click={() => {
              showExportDropdown = false;
              printDocument();
            }}
          >
            Print / Save to PDF
          </button>
        </div>
      {/if}
    </div>

    <!-- Theme Toggle -->
    <button class="icon-btn" title="Toggle Dark/Light" on:click={() => themeStore.toggleTheme()}>
      {#if $themeStore === 'dark'}
        <Sun size={15} />
      {:else}
        <Moon size={15} />
      {/if}
    </button>

    <!-- Settings -->
    <button
      class="icon-btn"
      title="Settings (Ctrl+,)"
      on:click={() => settingsModalOpen.set(true)}
    >
      <Settings size={15} />
    </button>

    {#if isTauri()}
      <div class="window-controls">
        <button class="win-btn" on:click={handleMinimize}><Minus size={13} /></button>
        <button class="win-btn" on:click={handleMaximize}><Square size={11} /></button>
        <button class="win-btn win-close" on:click={handleClose}><X size={14} /></button>
      </div>
    {/if}
  </div>
</div>

<style>
  .titlebar {
    height: var(--titlebar-height);
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 8px;
    z-index: 50;
    user-select: none;
  }

  .titlebar-left, .titlebar-right {
    display: flex;
    align-items: center;
    gap: 6px;
    -webkit-app-region: no-drag;
  }

  .window-controls, .file-actions, .mode-switch, .export-container, button {
    -webkit-app-region: no-drag;
  }

  .app-branding {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-right: 8px;
    font-size: 0.82rem;
    font-weight: 700;
  }

  .brand-badge {
    background: var(--brand-glow);
    color: var(--brand-primary);
    border: 1px solid var(--brand-primary);
    font-size: 0.68rem;
    padding: 2px 5px;
    border-radius: 4px;
    font-weight: 800;
  }

  .brand-title {
    color: var(--text-primary);
  }

  .brand-sub {
    color: var(--text-muted);
    font-weight: 500;
  }

  .file-actions {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .menu-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.76rem;
    color: var(--text-secondary);
    padding: 4px 8px;
    border-radius: 4px;
  }

  .menu-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .titlebar-center {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.8rem;
    max-width: 40%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .doc-name {
    font-weight: 600;
    color: var(--text-primary);
  }

  .dirty-dot {
    color: var(--accent-warning);
    margin-left: 4px;
    font-size: 0.75rem;
  }

  .doc-path {
    font-size: 0.72rem;
    color: var(--text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .doc-name-empty {
    color: var(--text-muted);
    font-style: italic;
  }

  .icon-btn {
    width: 28px;
    height: 28px;
    border-radius: 4px;
    color: var(--text-secondary);
  }

  .icon-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .mode-switch {
    display: flex;
    background: var(--bg-app);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 2px;
    gap: 2px;
  }

  .mode-btn {
    width: 26px;
    height: 22px;
    border-radius: 4px;
    color: var(--text-muted);
  }

  .mode-btn:hover {
    color: var(--text-primary);
  }

  .mode-btn.active {
    background: var(--bg-surface-elevated);
    color: var(--brand-primary);
    box-shadow: var(--shadow-sm);
  }

  .export-container {
    position: relative;
  }

  .dropdown-menu {
    position: absolute;
    top: 32px;
    right: 0;
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    box-shadow: var(--shadow-lg);
    padding: 4px;
    z-index: 100;
    min-width: 160px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .dropdown-item {
    font-size: 0.78rem;
    padding: 6px 12px;
    justify-content: flex-start;
    color: var(--text-secondary);
    border-radius: 4px;
    width: 100%;
  }

  .dropdown-item:hover {
    background: var(--brand-primary);
    color: #fff;
  }

  .window-controls {
    display: flex;
    align-items: center;
    margin-left: 8px;
  }

  .win-btn {
    width: 32px;
    height: 28px;
    color: var(--text-secondary);
  }

  .win-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .win-close:hover {
    background: var(--accent-danger);
    color: #fff;
  }
</style>
