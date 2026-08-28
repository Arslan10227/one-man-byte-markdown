<script lang="ts">
  import { savePromptModal } from '../stores/editorStore';
  import { AlertCircle, Save, Trash2, X } from 'lucide-svelte';

  function handleKeydown(e: KeyboardEvent) {
    if (!$savePromptModal.isOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      $savePromptModal.onCancel();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      $savePromptModal.onSave();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if $savePromptModal.isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="modal-backdrop" on:click={$savePromptModal.onCancel}>
    <div class="modal-card" on:click|stopPropagation>
      <div class="modal-header">
        <div class="header-icon">
          <AlertCircle size={22} />
        </div>
        <div class="header-text">
          <h3>Unsaved Changes</h3>
          <p>Do you want to save the changes made to <strong>{$savePromptModal.fileName}</strong>?</p>
        </div>
        <button class="close-btn" title="Cancel" on:click={$savePromptModal.onCancel}>
          <X size={16} />
        </button>
      </div>

      <div class="modal-body">
        <p class="subtext">
          Your changes will be permanently lost if you close without saving.
        </p>
      </div>

      <div class="modal-actions">
        <button class="btn btn-secondary" on:click={$savePromptModal.onCancel}>
          Cancel
        </button>
        <button class="btn btn-danger" on:click={$savePromptModal.onDiscard}>
          <Trash2 size={14} />
          <span>Don't Save</span>
        </button>
        <button class="btn btn-primary" on:click={$savePromptModal.onSave}>
          <Save size={14} />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 16px;
    animation: fadeIn 0.15s ease-out;
  }

  .modal-card {
    background: var(--bg-surface-elevated, #18191e);
    border: 1px solid var(--border-color, #2a2d36);
    border-radius: 12px;
    width: 100%;
    max-width: 480px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: scaleUp 0.15s ease-out;
  }

  .modal-header {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 20px 20px 14px 20px;
  }

  .header-icon {
    color: #f59e0b;
    flex-shrink: 0;
    margin-top: 2px;
    background: rgba(245, 158, 11, 0.12);
    padding: 8px;
    border-radius: 8px;
  }

  .header-text {
    flex: 1;
  }

  .header-text h3 {
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--text-primary, #f3f4f6);
    margin: 0 0 4px 0;
  }

  .header-text p {
    font-size: 0.85rem;
    color: var(--text-secondary, #9ca3af);
    margin: 0;
    line-height: 1.4;
  }

  .header-text strong {
    color: var(--brand-primary, #60a5fa);
  }

  .close-btn {
    color: var(--text-muted, #6b7280);
    padding: 4px;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    border: none;
  }

  .close-btn:hover {
    color: var(--text-primary, #f3f4f6);
    background: var(--bg-hover, rgba(255, 255, 255, 0.08));
  }

  .modal-body {
    padding: 0 20px 16px 20px;
  }

  .subtext {
    font-size: 0.78rem;
    color: var(--text-muted, #9ca3af);
    margin: 0;
  }

  .modal-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    padding: 14px 20px;
    background: rgba(0, 0, 0, 0.15);
    border-top: 1px solid var(--border-color, #2a2d36);
  }

  .btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: 6px;
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.15s ease;
  }

  .btn-secondary {
    background: var(--bg-hover, rgba(255, 255, 255, 0.06));
    color: var(--text-secondary, #d1d5db);
    border-color: var(--border-color, #374151);
  }

  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
  }

  .btn-danger {
    background: rgba(239, 68, 68, 0.12);
    color: #f87171;
    border-color: rgba(239, 68, 68, 0.3);
  }

  .btn-danger:hover {
    background: #ef4444;
    color: #fff;
  }

  .btn-primary {
    background: var(--brand-primary, #3b82f6);
    color: #fff;
  }

  .btn-primary:hover {
    background: #2563eb;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scaleUp {
    from { opacity: 0; transform: scale(0.96); }
    to { opacity: 1; transform: scale(1); }
  }
</style>
