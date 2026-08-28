<script lang="ts">
  import { toastStore } from '../stores/toastStore';
  import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-svelte';
</script>

<div class="toast-container">
  {#each $toastStore as toast (toast.id)}
    <div class="toast-item {toast.type}">
      {#if toast.type === 'success'}
        <CheckCircle2 size={16} class="toast-icon" />
      {:else if toast.type === 'error'}
        <AlertCircle size={16} class="toast-icon" />
      {:else if toast.type === 'warning'}
        <AlertTriangle size={16} class="toast-icon" />
      {:else}
        <Info size={16} class="toast-icon" />
      {/if}

      <span class="toast-text">{toast.message}</span>

      <button class="toast-dismiss" on:click={() => toastStore.dismiss(toast.id)}>
        <X size={13} />
      </button>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    bottom: 36px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 2000;
    pointer-events: none;
  }

  .toast-item {
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: var(--bg-surface-elevated);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: var(--shadow-lg);
    font-size: 0.8rem;
    color: var(--text-primary);
    min-width: 240px;
    max-width: 360px;
    animation: toast-in 0.2s ease-out;
  }

  @keyframes toast-in {
    from {
      transform: translateY(10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .toast-item.success {
    border-left: 4px solid var(--accent-success);
  }
  .toast-item.success :global(.toast-icon) {
    color: var(--accent-success);
  }

  .toast-item.error {
    border-left: 4px solid var(--accent-danger);
  }
  .toast-item.error :global(.toast-icon) {
    color: var(--accent-danger);
  }

  .toast-item.warning {
    border-left: 4px solid var(--accent-warning);
  }
  .toast-item.warning :global(.toast-icon) {
    color: var(--accent-warning);
  }

  .toast-item.info {
    border-left: 4px solid var(--brand-primary);
  }
  .toast-item.info :global(.toast-icon) {
    color: var(--brand-primary);
  }

  .toast-text {
    flex: 1;
    line-height: 1.4;
  }

  .toast-dismiss {
    width: 20px;
    height: 20px;
    color: var(--text-muted);
    border-radius: 4px;
  }

  .toast-dismiss:hover {
    color: var(--text-primary);
    background: var(--bg-hover);
  }
</style>
