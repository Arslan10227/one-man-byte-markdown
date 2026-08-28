<script lang="ts">
  import { onMount } from 'svelte';
  import {
    files,
    activeFile,
    activeFileId,
    settings,
    sidebarOpen,
    editorActions,
    settingsModalOpen,
  } from './lib/stores/editorStore';
  import { themeStore, applyTheme } from './lib/stores/themeStore';
  import type { TocHeading } from './lib/types/editor';

  import TitleBar from './lib/components/TitleBar.svelte';
  import TabBar from './lib/components/TabBar.svelte';
  import Toolbar from './lib/components/Toolbar.svelte';
  import Sidebar from './lib/components/Sidebar.svelte';
  import SplitPane from './lib/components/SplitPane.svelte';
  import EditorPane from './lib/components/EditorPane.svelte';
  import PreviewPane from './lib/components/PreviewPane.svelte';
  import StatusBar from './lib/components/StatusBar.svelte';
  import SettingsModal from './lib/components/SettingsModal.svelte';
  import SaveConfirmationModal from './lib/components/SaveConfirmationModal.svelte';
  import ToastContainer from './lib/components/ToastContainer.svelte';
  import WelcomeScreen from './lib/components/WelcomeScreen.svelte';

  import { getStartupArgs, listenToCliOpenFile, isTauri } from './lib/platform/fs';

  let editorRef: EditorPane;
  let previewRef: PreviewPane;

  let cursorLine = 1;
  let cursorCol = 1;
  let isEditorScrolling = false;
  let isPreviewScrolling = false;

  onMount(() => {
    applyTheme($themeStore);

    // 1. Process startup arguments (e.g. double-clicked .md file or CLI args)
    getStartupArgs().then((args) => {
      if (args && args.length > 0) {
        for (const filePath of args) {
          if (filePath && !filePath.startsWith('-')) {
            editorActions.openFilePathDirectly(filePath);
          }
        }
      }
    });

    // 2. Listen to files forwarded from subsequent instances (single-instance)
    let unlistenCli: (() => void) | null = null;
    listenToCliOpenFile((filePath) => {
      if (filePath) {
        editorActions.openFilePathDirectly(filePath);
      }
    }).then((unlisten) => {
      unlistenCli = unlisten;
    });

    // 3. Disable browser right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    window.addEventListener('contextmenu', handleContextMenu);

    // 4. Drag and drop file support
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };
    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          const file = e.dataTransfer.files[i];
          const filePath = (file as any).path;
          if (filePath) {
            editorActions.openFilePathDirectly(filePath);
          } else {
            const content = await file.text();
            editorActions.addOrSwitchFile(file.name, content);
          }
        }
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    // 5. Global keyboard listener
    window.addEventListener('keydown', handleGlobalKeydown);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeydown);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('contextmenu', handleContextMenu);
      if (unlistenCli) unlistenCli();
    };
  });

  function handleGlobalKeydown(e: KeyboardEvent) {
    if (e.altKey && (e.key === 'F4' || e.key === 'f4')) {
      e.preventDefault();
      editorActions.requestAppClose();
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (e.shiftKey) {
          editorActions.saveActiveFileAs();
        } else {
          editorActions.saveActiveFile();
        }
      } else if (e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        editorActions.openFile();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        editorActions.createNewFile();
      } else if (e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        editorActions.requestAppClose();
      } else if (e.key === ',') {
        e.preventDefault();
        settingsModalOpen.update((v) => !v);
      }
    }
  }

  function handleToolbarFormat(e: CustomEvent<{ action: string; payload?: any }>) {
    if (editorRef) {
      editorRef.formatSelection(e.detail.action, e.detail.payload);
    }
  }

  function handleEditorScroll(e: CustomEvent<{ percentage: number }>) {
    if (!$settings.syncScroll || isPreviewScrolling || !previewRef) return;
    isEditorScrolling = true;
    previewRef.scrollToPercentage(e.detail.percentage);
    setTimeout(() => {
      isEditorScrolling = false;
    }, 50);
  }

  function handlePreviewScroll(e: CustomEvent<{ percentage: number }>) {
    if (!$settings.syncScroll || isEditorScrolling || !editorRef) return;
    isPreviewScrolling = true;
    editorRef.scrollToPercentage(e.detail.percentage);
    setTimeout(() => {
      isPreviewScrolling = false;
    }, 50);
  }

  function handleCursorChange(e: CustomEvent<{ line: number; col: number }>) {
    cursorLine = e.detail.line;
    cursorCol = e.detail.col;
  }

  function handleTocJump(e: CustomEvent<TocHeading>) {
    const heading = e.detail;
    if (heading.line && editorRef) {
      editorRef.scrollToLine(heading.line);
    }
    if (heading.slug && previewRef) {
      previewRef.scrollToSlug(heading.slug);
    }
  }
</script>

<div class="app-layout">
  <!-- TitleBar -->
  <TitleBar />

  {#if $files.length > 0}
    <!-- TabBar -->
    <TabBar />

    <!-- Toolbar -->
    <Toolbar on:format={handleToolbarFormat} />
  {/if}

  <!-- Main Work Area -->
  <div class="workspace-area">
    <Sidebar on:tocJump={handleTocJump} />

    <div class="editor-stage">
      {#if $activeFile}
        <SplitPane>
          <svelte:fragment slot="left">
            <EditorPane
              bind:this={editorRef}
              fileId={$activeFile.id}
              content={$activeFile.content}
              on:scroll={handleEditorScroll}
              on:cursor={handleCursorChange}
            />
          </svelte:fragment>
          <svelte:fragment slot="right">
            <PreviewPane
              bind:this={previewRef}
              content={$activeFile.content}
              on:scroll={handlePreviewScroll}
            />
          </svelte:fragment>
        </SplitPane>
      {:else}
        <WelcomeScreen />
      {/if}
    </div>
  </div>

  <!-- StatusBar -->
  <StatusBar {cursorLine} {cursorCol} />

  <!-- Overlays -->
  <SettingsModal />
  <SaveConfirmationModal />
  <ToastContainer />
</div>

<style>
  .app-layout {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--bg-app);
  }

  .workspace-area {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
  }

  .editor-stage {
    flex: 1;
    height: 100%;
    overflow: hidden;
    background: var(--bg-app);
  }
</style>
