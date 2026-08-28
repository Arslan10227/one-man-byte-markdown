import { writable } from 'svelte/store';
import type { ToastMessage } from '../types/editor';

function createToastStore() {
  const { subscribe, update } = writable<ToastMessage[]>([]);

  function show(message: string, type: ToastMessage['type'] = 'info', duration: number = 3000) {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = { id, message, type, duration };
    update((toasts) => [...toasts, toast]);

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }
    return id;
  }

  function dismiss(id: string) {
    update((toasts) => toasts.filter((t) => t.id !== id));
  }

  return {
    subscribe,
    show,
    dismiss,
    success: (msg: string, dur?: number) => show(msg, 'success', dur),
    error: (msg: string, dur?: number) => show(msg, 'error', dur || 4000),
    warning: (msg: string, dur?: number) => show(msg, 'warning', dur),
    info: (msg: string, dur?: number) => show(msg, 'info', dur),
  };
}

export const toastStore = createToastStore();
