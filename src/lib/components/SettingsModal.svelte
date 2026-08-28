<script lang="ts">
  import { onMount } from 'svelte';
  import { settings, settingsModalOpen, editorActions } from '../stores/editorStore';
  import { themeStore } from '../stores/themeStore';
  import { toastStore } from '../stores/toastStore';
  import { checkFileAssociation, setFileAssociation, isTauri } from '../platform/fs';
  import type { ThemeMode } from '../types/editor';
  import { X, Moon, Sun, Monitor, Keyboard, Sliders, Type, FileText } from 'lucide-svelte';

  let activeTab: 'general' | 'editor' | 'shortcuts' = 'general';
  let isMdAssociated = false;
  let isCheckingAssociation = false;

  $: if ($settingsModalOpen && isTauri()) {
    checkAssociationStatus();
  }

  async function checkAssociationStatus() {
    isCheckingAssociation = true;
    try {
      isMdAssociated = await checkFileAssociation();
    } catch (e) {
      console.error(e);
    } finally {
      isCheckingAssociation = false;
    }
  }

  async function handleAssociationToggle(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    try {
      await setFileAssociation(checked);
      isMdAssociated = checked;
      if (checked) {
        toastStore.success('Registered OneManByte as default .md handler');
      } else {
        toastStore.info('Unregistered .md file association');
      }
    } catch (err) {
      toastStore.error('Failed to update file association: ' + err);
      // Revert checkbox
      checkAssociationStatus();
    }
  }

  function handleThemeChange(t: ThemeMode) {
    themeStore.setTheme(t);
    editorActions.updateSettings({ theme: t });
  }

  const shortcuts = [
    { key: 'Ctrl + N', desc: 'Create New Document' },
    { key: 'Ctrl + O', desc: 'Open Document' },
    { key: 'Ctrl + S', desc: 'Save Document' },
    { key: 'Ctrl + Shift + S', desc: 'Save As' },
    { key: 'Ctrl + B', desc: 'Bold / Toggle Sidebar' },
    { key: 'Ctrl + I', desc: 'Italic' },
    { key: 'Ctrl + K', desc: 'Insert Link' },
    { key: 'Ctrl + F', desc: 'Find & Replace' },
    { key: 'Ctrl + Z', desc: 'Undo' },
    { key: 'Ctrl + Y / Ctrl + Shift + Z', desc: 'Redo' },
  ];
</script>

{#if $settingsModalOpen}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="modal-backdrop" on:click={() => settingsModalOpen.set(false)}>
    <div class="modal-card" on:click|stopPropagation>
      <div class="modal-header">
        <div class="modal-title">
          <Sliders size={18} class="title-icon" />
          <span>Preferences</span>
        </div>
        <button class="close-btn" on:click={() => settingsModalOpen.set(false)}>
          <X size={16} />
        </button>
      </div>

      <div class="modal-body">
        <div class="modal-tabs">
          <button
            class="nav-item"
            class:active={activeTab === 'general'}
            on:click={() => (activeTab = 'general')}
          >
            <Sliders size={15} />
            <span>General</span>
          </button>
          <button
            class="nav-item"
            class:active={activeTab === 'editor'}
            on:click={() => (activeTab = 'editor')}
          >
            <Type size={15} />
            <span>Editor & Typography</span>
          </button>
          <button
            class="nav-item"
            class:active={activeTab === 'shortcuts'}
            on:click={() => (activeTab = 'shortcuts')}
          >
            <Keyboard size={15} />
            <span>Shortcuts</span>
          </button>
        </div>

        <div class="tab-content">
          {#if activeTab === 'general'}
            <div class="setting-group">
              <div class="setting-label">Appearance & Theme</div>
              <div class="theme-options">
                <button
                  class="theme-card"
                  class:selected={$themeStore === 'dark'}
                  on:click={() => handleThemeChange('dark')}
                >
                  <Moon size={18} />
                  <span>Dark Slate</span>
                </button>
                <button
                  class="theme-card"
                  class:selected={$themeStore === 'light'}
                  on:click={() => handleThemeChange('light')}
                >
                  <Sun size={18} />
                  <span>Crisp Light</span>
                </button>
                <button
                  class="theme-card"
                  class:selected={$themeStore === 'system'}
                  on:click={() => handleThemeChange('system')}
                >
                  <Monitor size={18} />
                  <span>System</span>
                </button>
              </div>
            </div>

            <div class="setting-group">
              <div class="setting-label">File Association</div>
              <div class="toggle-row">
                <div>
                  <div class="toggle-desc" style="color: var(--text-primary); font-weight: 500;">
                    Register as Default .md Editor
                  </div>
                  <div class="toggle-subdesc" style="font-size: 0.72rem; color: var(--text-muted);">
                    Opens markdown files directly with OneManByte on double-click in Windows Explorer
                  </div>
                </div>
                <input
                  type="checkbox"
                  class="toggle-checkbox"
                  checked={isMdAssociated}
                  disabled={isCheckingAssociation}
                  on:change={handleAssociationToggle}
                />
              </div>
            </div>

            <div class="setting-group">
              <div class="setting-label">Auto-Save</div>
              <div class="toggle-row">
                <span class="toggle-desc">Automatically save file changes periodically</span>
                <input
                  type="checkbox"
                  class="toggle-checkbox"
                  checked={$settings.autoSave}
                  on:change={(e) =>
                    editorActions.updateSettings({ autoSave: e.currentTarget.checked })}
                />
              </div>
            </div>

            <div class="setting-group">
              <div class="setting-label">Synchronized Scrolling</div>
              <div class="toggle-row">
                <span class="toggle-desc">Keep editor and live preview scrolling in sync</span>
                <input
                  type="checkbox"
                  class="toggle-checkbox"
                  checked={$settings.syncScroll}
                  on:change={(e) =>
                    editorActions.updateSettings({ syncScroll: e.currentTarget.checked })}
                />
              </div>
            </div>
          {:else if activeTab === 'editor'}
            <div class="setting-group">
              <label class="setting-label" for="editor-font-size">Editor Font Size: {$settings.editorFontSize}px</label>
              <input
                id="editor-font-size"
                type="range"
                min="12"
                max="28"
                step="1"
                class="range-slider"
                value={$settings.editorFontSize}
                on:input={(e) =>
                  editorActions.updateSettings({ editorFontSize: Number(e.currentTarget.value) })}
              />
            </div>

            <div class="setting-group">
              <label class="setting-label" for="preview-font-size">Preview Font Size: {$settings.previewFontSize}px</label>
              <input
                id="preview-font-size"
                type="range"
                min="12"
                max="28"
                step="1"
                class="range-slider"
                value={$settings.previewFontSize}
                on:input={(e) =>
                  editorActions.updateSettings({ previewFontSize: Number(e.currentTarget.value) })}
              />
            </div>

            <div class="setting-group">
              <div class="toggle-row">
                <span class="toggle-desc">Show Line Numbers</span>
                <input
                  type="checkbox"
                  class="toggle-checkbox"
                  checked={$settings.lineNumbers}
                  on:change={(e) =>
                    editorActions.updateSettings({ lineNumbers: e.currentTarget.checked })}
                />
              </div>
            </div>

            <div class="setting-group">
              <div class="toggle-row">
                <span class="toggle-desc">Word Wrap</span>
                <input
                  type="checkbox"
                  class="toggle-checkbox"
                  checked={$settings.wordWrap}
                  on:change={(e) =>
                    editorActions.updateSettings({ wordWrap: e.currentTarget.checked })}
                />
              </div>
            </div>

            <div class="setting-group">
              <div class="toggle-row">
                <span class="toggle-desc">Highlight Active Line</span>
                <input
                  type="checkbox"
                  class="toggle-checkbox"
                  checked={$settings.highlightActiveLine}
                  on:change={(e) =>
                    editorActions.updateSettings({ highlightActiveLine: e.currentTarget.checked })}
                />
              </div>
            </div>
          {:else if activeTab === 'shortcuts'}
            <div class="shortcuts-table">
              {#each shortcuts as item}
                <div class="shortcut-row">
                  <span class="sc-desc">{item.desc}</span>
                  <span class="sc-key">{item.key}</span>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-card {
    width: 600px;
    max-height: 80vh;
    background: var(--bg-surface);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    box-shadow: var(--shadow-lg);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .modal-header {
    height: 48px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    background: var(--bg-surface-elevated);
  }

  .modal-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  :global(.title-icon) {
    color: var(--brand-primary);
  }

  .close-btn {
    width: 28px;
    height: 28px;
    border-radius: 4px;
    color: var(--text-muted);
  }

  .close-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .modal-body {
    display: flex;
    flex: 1;
    min-height: 380px;
  }

  .modal-tabs {
    width: 170px;
    border-right: 1px solid var(--border-color);
    padding: 12px 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: var(--bg-app);
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.8rem;
    color: var(--text-secondary);
    width: 100%;
    justify-content: flex-start;
  }

  .nav-item:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .nav-item.active {
    background: var(--brand-primary);
    color: #fff;
    font-weight: 600;
  }

  .tab-content {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
  }

  .setting-group {
    margin-bottom: 20px;
  }

  .setting-label {
    display: block;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .theme-options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .theme-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 14px 8px;
    border-radius: 8px;
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    font-size: 0.75rem;
    font-weight: 500;
  }

  .theme-card:hover {
    border-color: var(--brand-primary);
    color: var(--text-primary);
  }

  .theme-card.selected {
    border-color: var(--brand-primary);
    background: var(--brand-glow);
    color: var(--brand-primary);
    font-weight: 600;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 0;
  }

  .toggle-desc {
    font-size: 0.8rem;
    color: var(--text-secondary);
  }

  .toggle-checkbox {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: var(--brand-primary);
  }

  .range-slider {
    width: 100%;
    accent-color: var(--brand-primary);
    cursor: pointer;
  }

  .shortcuts-table {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .shortcut-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: var(--bg-surface-elevated);
    border-radius: 6px;
    font-size: 0.78rem;
  }

  .sc-desc {
    color: var(--text-secondary);
  }

  .sc-key {
    font-family: var(--font-mono);
    background: var(--bg-app);
    border: 1px solid var(--border-color);
    padding: 2px 6px;
    border-radius: 4px;
    color: var(--brand-primary);
    font-size: 0.72rem;
    font-weight: 600;
  }
</style>
