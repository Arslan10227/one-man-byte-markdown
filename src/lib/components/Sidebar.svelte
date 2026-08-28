<script lang="ts">
  import {
    sidebarOpen,
    sidebarTab,
    workspaceRoot,
    workspaceTree,
    activeToc,
    recentFiles,
    editorActions,
    activeFileId,
  } from '../stores/editorStore';
  import type { FileNode, TocHeading } from '../types/editor';
  import {
    Folder,
    FolderOpen,
    FileText,
    ListTree,
    Clock,
    FolderPlus,
    FilePlus,
    ChevronRight,
    ChevronDown,
    X,
  } from 'lucide-svelte';

  let collapsedFolders: Record<string, boolean> = {};

  function toggleFolder(path: string) {
    collapsedFolders[path] = !collapsedFolders[path];
  }

  function handleFileClick(node: FileNode) {
    if (node.isDirectory) {
      toggleFolder(node.path);
    } else {
      editorActions.openFileFromPath(node.path, node.name);
    }
  }

  function handleRecentClick(filePath: string) {
    const name = filePath.split(/[\\/]/).pop() || filePath;
    editorActions.openFileFromPath(filePath, name);
  }

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher<{
    tocJump: TocHeading;
  }>();

  function handleTocClick(heading: TocHeading) {
    dispatch('tocJump', heading);
  }
</script>

{#if $sidebarOpen}
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="tab-triggers">
        <button
          class="tab-btn"
          class:active={$sidebarTab === 'files'}
          on:click={() => sidebarTab.set('files')}
          title="Explorer / Files"
        >
          <Folder size={14} />
          <span>Files</span>
        </button>
        <button
          class="tab-btn"
          class:active={$sidebarTab === 'toc'}
          on:click={() => sidebarTab.set('toc')}
          title="Outline / TOC"
        >
          <ListTree size={14} />
          <span>Outline</span>
        </button>
        <button
          class="tab-btn"
          class:active={$sidebarTab === 'recent'}
          on:click={() => sidebarTab.set('recent')}
          title="Recent Documents"
        >
          <Clock size={14} />
          <span>Recent</span>
        </button>
      </div>

      <button class="close-sidebar-btn" on:click={() => sidebarOpen.set(false)} title="Hide Sidebar">
        <X size={14} />
      </button>
    </div>

    <div class="sidebar-content">
      {#if $sidebarTab === 'files'}
        <div class="files-view">
          <div class="workspace-actions">
            {#if $workspaceRoot}
              <div class="workspace-title" title={$workspaceRoot}>
                <FolderOpen size={14} class="ws-icon" />
                <span class="ws-name">{$workspaceRoot.split(/[\\/]/).pop()}</span>
              </div>
            {:else}
              <button class="open-ws-btn" on:click={() => editorActions.openWorkspace()}>
                <FolderPlus size={14} />
                <span>Open Folder</span>
              </button>
            {/if}
            <button class="ws-action-btn" title="New File" on:click={() => editorActions.createNewFile()}>
              <FilePlus size={14} />
            </button>
          </div>

          <div class="tree-container">
            {#if $workspaceTree.length > 0}
              {#each $workspaceTree as node (node.path)}
                <!-- File Tree Recursive Node rendering -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <div
                  class="tree-node"
                  style="padding-left: 8px;"
                  on:click={() => handleFileClick(node)}
                >
                  {#if node.isDirectory}
                    <span class="node-arrow">
                      {#if collapsedFolders[node.path]}
                        <ChevronRight size={13} />
                      {:else}
                        <ChevronDown size={13} />
                      {/if}
                    </span>
                    <Folder size={14} class="folder-icon" />
                  {:else}
                    <span class="node-spacer"></span>
                    <FileText size={14} class="file-icon" />
                  {/if}
                  <span class="node-name">{node.name}</span>
                </div>

                {#if node.isDirectory && !collapsedFolders[node.path] && node.children}
                  {#each node.children as child (child.path)}
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <div
                      class="tree-node"
                      style="padding-left: 24px;"
                      on:click={() => handleFileClick(child)}
                    >
                      {#if child.isDirectory}
                        <span class="node-arrow">
                          {#if collapsedFolders[child.path]}
                            <ChevronRight size={13} />
                          {:else}
                            <ChevronDown size={13} />
                          {/if}
                        </span>
                        <Folder size={14} class="folder-icon" />
                      {:else}
                        <span class="node-spacer"></span>
                        <FileText size={14} class="file-icon" />
                      {/if}
                      <span class="node-name">{child.name}</span>
                    </div>
                  {/each}
                {/if}
              {/each}
            {:else if !$workspaceRoot}
              <div class="empty-hint">
                <p>No folder opened.</p>
                <button class="primary-btn" on:click={() => editorActions.openWorkspace()}>
                  Open Workspace
                </button>
              </div>
            {:else}
              <div class="empty-hint">
                <p>No markdown files found in this workspace.</p>
              </div>
            {/if}
          </div>
        </div>
      {:else if $sidebarTab === 'toc'}
        <div class="toc-view">
          {#if $activeToc.length > 0}
            <div class="toc-list">
              {#each $activeToc as heading}
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <div
                  class="toc-item level-{heading.level}"
                  on:click={() => handleTocClick(heading)}
                >
                  <span class="toc-bullet">H{heading.level}</span>
                  <span class="toc-text">{heading.text}</span>
                </div>
              {/each}
            </div>
          {:else}
            <div class="empty-hint">
              <p>No headings found in current document.</p>
            </div>
          {/if}
        </div>
      {:else if $sidebarTab === 'recent'}
        <div class="recent-view">
          {#if $recentFiles.length > 0}
            <div class="recent-list">
              {#each $recentFiles as path}
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <div class="recent-item" on:click={() => handleRecentClick(path)}>
                  <FileText size={14} class="file-icon" />
                  <div class="recent-meta">
                    <span class="recent-name">{path.split(/[\\/]/).pop()}</span>
                    <span class="recent-path" title={path}>{path}</span>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="empty-hint">
              <p>No recent files yet.</p>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .sidebar {
    width: 240px;
    height: 100%;
    background: var(--bg-surface);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    user-select: none;
  }

  .sidebar-header {
    height: var(--tabbar-height);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 6px;
    background: var(--bg-surface-elevated);
  }

  .tab-triggers {
    display: flex;
    gap: 2px;
  }

  .tab-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    font-size: 0.74rem;
    color: var(--text-muted);
    border-radius: 4px;
  }

  .tab-btn:hover {
    color: var(--text-primary);
  }

  .tab-btn.active {
    background: var(--bg-surface);
    color: var(--brand-primary);
    font-weight: 600;
  }

  .close-sidebar-btn {
    width: 22px;
    height: 22px;
    border-radius: 4px;
    color: var(--text-muted);
  }

  .close-sidebar-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: 6px 0;
  }

  .workspace-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    border-bottom: 1px solid var(--border-subtle);
  }

  .workspace-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--text-primary);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :global(.ws-icon) {
    color: var(--brand-primary);
  }

  .open-ws-btn, .ws-action-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.74rem;
    color: var(--text-secondary);
    padding: 4px 6px;
    border-radius: 4px;
  }

  .open-ws-btn:hover, .ws-action-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .tree-container {
    padding: 6px 0;
  }

  .tree-node {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 8px;
    font-size: 0.76rem;
    color: var(--text-secondary);
    cursor: pointer;
    border-radius: 4px;
    margin: 1px 4px;
  }

  .tree-node:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .node-arrow {
    width: 14px;
    display: flex;
    align-items: center;
    color: var(--text-muted);
  }

  .node-spacer {
    width: 14px;
  }

  :global(.folder-icon) {
    color: #f59e0b;
  }

  :global(.file-icon) {
    color: var(--brand-primary);
  }

  .node-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .toc-list, .recent-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 4px 6px;
  }

  .toc-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 8px;
    font-size: 0.75rem;
    color: var(--text-secondary);
    cursor: pointer;
    border-radius: 4px;
  }

  .toc-item:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .toc-item.level-1 { font-weight: 600; }
  .toc-item.level-2 { padding-left: 16px; }
  .toc-item.level-3 { padding-left: 24px; opacity: 0.9; }
  .toc-item.level-4 { padding-left: 32px; opacity: 0.8; }

  .toc-bullet {
    font-size: 0.65rem;
    background: var(--bg-surface-elevated);
    padding: 1px 4px;
    border-radius: 3px;
    color: var(--brand-primary);
  }

  .toc-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .recent-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 4px;
    cursor: pointer;
  }

  .recent-item:hover {
    background: var(--bg-hover);
  }

  .recent-meta {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .recent-name {
    font-size: 0.76rem;
    font-weight: 500;
    color: var(--text-primary);
  }

  .recent-path {
    font-size: 0.68rem;
    color: var(--text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .empty-hint {
    padding: 24px 16px;
    text-align: center;
    color: var(--text-muted);
    font-size: 0.78rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .primary-btn {
    background: var(--brand-primary);
    color: #fff;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 0.74rem;
    font-weight: 600;
  }

  .primary-btn:hover {
    background: var(--brand-primary-hover);
  }
</style>
