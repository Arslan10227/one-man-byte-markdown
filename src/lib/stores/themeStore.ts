import { writable } from 'svelte/store';
import type { ThemeMode } from '../types/editor';

const storedTheme = (localStorage.getItem('onemanbyte_theme') as ThemeMode) || 'dark';

function createThemeStore() {
  const { subscribe, set } = writable<ThemeMode>(storedTheme);

  return {
    subscribe,
    setTheme: (theme: ThemeMode) => {
      localStorage.setItem('onemanbyte_theme', theme);
      set(theme);
      applyTheme(theme);
    },
    toggleTheme: () => {
      const current = (localStorage.getItem('onemanbyte_theme') as ThemeMode) || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem('onemanbyte_theme', next);
      set(next);
      applyTheme(next);
    }
  };
}

export function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  if (theme === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', isDark);
    root.classList.toggle('light', !isDark);
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  } else {
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    root.setAttribute('data-theme', theme);
  }
}

export const themeStore = createThemeStore();
