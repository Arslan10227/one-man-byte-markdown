import type { FileNode } from '../types/editor';

// Check if running inside Tauri runtime
export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export async function openFileDialog(): Promise<{ path: string; name: string; content: string } | null> {
  if (isTauri()) {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        multiple: false,
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'mdown', 'txt'] }],
      });
      if (!selected || typeof selected !== 'string') return null;
      const content = await readFileContent(selected);
      if (content === null) return null;
      const name = selected.split(/[\\/]/).pop() || 'Untitled.md';
      return { path: selected, name, content };
    } catch (e) {
      console.error('Tauri open file failed:', e);
      return null;
    }
  } else {
    // Browser fallback
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.md,.markdown,.txt,.text';
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return resolve(null);
        const content = await file.text();
        resolve({
          path: file.name,
          name: file.name,
          content,
        });
      };
      input.click();
    });
  }
}

export async function openFolderDialog(): Promise<{ path: string; name: string; tree: FileNode[] } | null> {
  if (isTauri()) {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const { readDir } = await import('@tauri-apps/plugin-fs');
      const selected = await open({
        directory: true,
        multiple: false,
      });
      if (!selected || typeof selected !== 'string') return null;
      const name = selected.split(/[\\/]/).pop() || 'Workspace';

      async function scanDir(dirPath: string): Promise<FileNode[]> {
        const entries = await readDir(dirPath);
        const nodes: FileNode[] = [];
        for (const entry of entries) {
          const fullPath = `${dirPath}/${entry.name}`.replace(/\/+/g, '/');
          if (entry.isDirectory) {
            nodes.push({
              name: entry.name,
              path: fullPath,
              isDirectory: true,
              children: await scanDir(fullPath),
            });
          } else if (/\.(md|markdown|mdown|txt)$/i.test(entry.name)) {
            nodes.push({
              name: entry.name,
              path: fullPath,
              isDirectory: false,
              extension: entry.name.split('.').pop(),
            });
          }
        }
        return nodes.sort((a, b) => {
          if (a.isDirectory && !b.isDirectory) return -1;
          if (!a.isDirectory && b.isDirectory) return 1;
          return a.name.localeCompare(b.name);
        });
      }

      const tree = await scanDir(selected);
      return { path: selected, name, tree };
    } catch (e) {
      console.error('Tauri open folder error:', e);
      return null;
    }
  } else {
    // Browser fallback
    const sampleTree: FileNode[] = [
      {
        name: 'Welcome.md',
        path: '/Welcome.md',
        isDirectory: false,
        extension: 'md',
      },
      {
        name: 'docs',
        path: '/docs',
        isDirectory: true,
        children: [
          { name: 'architecture.md', path: '/docs/architecture.md', isDirectory: false, extension: 'md' },
          { name: 'getting-started.md', path: '/docs/getting-started.md', isDirectory: false, extension: 'md' },
        ],
      },
      {
        name: 'notes',
        path: '/notes',
        isDirectory: true,
        children: [
          { name: 'todo.md', path: '/notes/todo.md', isDirectory: false, extension: 'md' },
        ],
      },
    ];
    return { path: 'Local Workspace', name: 'Local Workspace', tree: sampleTree };
  }
}

export async function saveFile(path: string | undefined, content: string): Promise<string | null> {
  if (isTauri()) {
    try {
      if (!path) {
        return saveFileAs(content);
      }
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('write_file_content', { path, content });
      return path;
    } catch (e) {
      console.error('Tauri saveFile error:', e);
      return null;
    }
  } else {
    // Browser fallback: download file
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = path || 'document.md';
    a.click();
    URL.revokeObjectURL(url);
    return path || 'document.md';
  }
}

export async function saveFileAs(content: string, defaultName: string = 'document.md'): Promise<string | null> {
  if (isTauri()) {
    try {
      const { save } = await import('@tauri-apps/plugin-dialog');
      const targetPath = await save({
        defaultPath: defaultName,
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown', 'txt'] }],
      });
      if (!targetPath) return null;
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('write_file_content', { path: targetPath, content });
      return targetPath;
    } catch (e) {
      console.error('Tauri saveFileAs error:', e);
      return null;
    }
  } else {
    return saveFile(defaultName, content);
  }
}

export async function readFileContent(filePath: string): Promise<string | null> {
  if (isTauri()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<string>('read_file_content', { path: filePath });
    } catch (e) {
      console.error('Read file content error:', e);
      return null;
    }
  }
  return null;
}

export async function getStartupArgs(): Promise<string[]> {
  if (isTauri()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<string[]>('get_startup_args');
    } catch (e) {
      console.error('getStartupArgs error:', e);
      return [];
    }
  }
  return [];
}

export async function checkFileAssociation(): Promise<boolean> {
  if (isTauri()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke<boolean>('check_file_association');
    } catch (e) {
      console.error('checkFileAssociation error:', e);
      return false;
    }
  }
  return false;
}

export async function setFileAssociation(enable: boolean): Promise<void> {
  if (isTauri()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('set_file_association', { enable });
    } catch (e) {
      console.error('setFileAssociation error:', e);
      throw e;
    }
  }
}

export async function minimizeWindow(): Promise<void> {
  if (isTauri()) {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('window_minimize');
  }
}

export async function maximizeWindow(): Promise<void> {
  if (isTauri()) {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('window_maximize');
  }
}

export async function closeWindow(): Promise<void> {
  if (isTauri()) {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('window_close');
  }
}

export async function listenToCliOpenFile(callback: (path: string) => void): Promise<(() => void) | null> {
  if (isTauri()) {
    try {
      const { listen } = await import('@tauri-apps/api/event');
      return await listen<string>('open-file-from-cli', (event) => {
        if (event.payload) {
          callback(event.payload);
        }
      });
    } catch (e) {
      console.error('listenToCliOpenFile error:', e);
      return null;
    }
  }
  return null;
}
