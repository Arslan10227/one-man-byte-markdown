import { writable, derived, get } from 'svelte/store';
import type { OpenFile, EditorSettings, ViewMode, FileNode, TocHeading } from '../types/editor';
import { openFileDialog, openFolderDialog, saveFile as apiSaveFile, saveFileAs as apiSaveFileAs, readFileContent } from '../platform/fs';
import { toastStore } from './toastStore';
import { parseMarkdown } from '../markdown/parser';

const DEFAULT_SETTINGS: EditorSettings = {
  theme: 'dark',
  editorFontSize: 15,
  previewFontSize: 15,
  fontFamily: "'Fira Code', Consolas, Monaco, monospace",
  previewFontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  tabSize: 2,
  wordWrap: true,
  lineNumbers: true,
  syncScroll: true,
  autoSave: false,
  autoSaveDelay: 2000,
  highlightActiveLine: true,
};

const SAMPLE_MARKDOWN = `# Welcome to OneManByte - Markdown 🚀

A lightning-fast, lightweight markdown viewer & editor built for speed, elegance, and focus.

---

## ✨ Core Highlights

- ⚡ **Near-Zero Latency:** Ultra-responsive editing powered by CodeMirror 6.
- 🎨 **Sleek Theming:** Tailored dark and light aesthetics with glassmorphic accents.
- 🔀 **Live Synchronized Scrolling:** Seamless real-time preview alongside raw markdown.
- 📂 **Workspace & Tabs:** Open folders, multi-tab editing, and instant file tree navigation.
- 📋 **Outline TOC Jump:** Headings automatically map into a clickable table of contents.
- 📤 **Instant Export:** Export to standalone HTML, PDF, or copy rendered markup.

---

## 🛠️ Formatting & GFM Features

### Task Checklist
- [x] High-performance Svelte architecture
- [x] CodeMirror 6 modular engine
- [x] Custom syntax highlighted code blocks
- [ ] Write my next great documentation or notes!

### Code Block with Syntax Highlighting

\`\`\`rust
fn main() {
    let app_name = "OneManByte - Markdown";
    println!("Launching {} with blazing speed!", app_name);
}
\`\`\`

\`\`\`typescript
interface Note {
  title: string;
  tags: string[];
  wordCount: number;
}

const note: Note = {
  title: "Fast Markdown Workflow",
  tags: ["markdown", "speed", "onemanbyte"],
  wordCount: 350
};
\`\`\`

### Markdown Table

| Feature | OneManByte - Markdown | Traditional Heavy Editors |
| :--- | :---: | :---: |
| **Startup Speed** | < 1s | 3 - 8s |
| **Memory Footprint** | Extremely Low (~50-100MB) | 400MB - 1GB+ |
| **Telemetry** | None (Offline-First) | Often Active |
| **Large File Support** | 50k+ lines smooth | Sluggish |

---

## 📐 Mathematical Formulas (KaTeX)

Inline equation: The mass-energy equivalence is defined by $E = mc^2$, and Euler's identity is $e^{i\\pi} + 1 = 0$.

Display equation:
$$
f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}
$$

$$
\\oint_C \\mathbf{B} \\cdot d\\boldsymbol{\\ell} = \\mu_0 \\left( I_{\\text{enc}} + \\varepsilon_0 \\frac{d\\Phi_E}{dt} \\right)
$$

---

## 📊 Interactive Diagrams & Charts (Mermaid)

### Architecture Flowchart
\`\`\`mermaid
graph TD
    A[User Markdown Input] --> B[CodeMirror 6 Editor]
    B -->|Fast Debounce| C[markdown-it Parser]
    C --> D[KaTeX Math Engine]
    C --> E[Mermaid Diagram Renderer]
    C --> F[highlight.js Code Styler]
    D & E & F --> G[Live Rendered Preview Pane]
\`\`\`

### Sequence Diagram
\`\`\`mermaid
sequenceDiagram
    autonumber
    actor User
    participant Editor as CodeMirror 6
    participant Preview as Svelte Preview
    participant OS as Native FS (Tauri)

    User->>Editor: Type / Edit Markdown
    Editor->>Preview: Stream Tokens (150ms debounce)
    Preview-->>User: Instant Rendered UI
    User->>Editor: Ctrl + S (Save)
    Editor->>OS: Write to Disk
    OS-->>User: Toast "Saved: document.md"
\`\`\`

### Pie Chart
\`\`\`mermaid
pie title Document Word Breakdown
    "Content" : 60
    "Code Blocks" : 20
    "Math & Formulas" : 12
    "Diagrams" : 8
\`\`\`

> *"Simplicity is the prerequisite for reliability."* — Edsger W. Dijkstra

---

Enjoy writing with **OneManByte - Markdown**!
`;

function loadSavedSettings(): EditorSettings {
  try {
    const raw = localStorage.getItem('onemanbyte_settings');
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {}
  return DEFAULT_SETTINGS;
}

function loadSavedRecentFiles(): string[] {
  try {
    const raw = localStorage.getItem('onemanbyte_recent');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

export const files = writable<OpenFile[]>([
  {
    id: 'initial-sample',
    name: 'Welcome.md',
    content: SAMPLE_MARKDOWN,
    savedContent: SAMPLE_MARKDOWN,
    isDirty: false,
    isNew: false,
  },
]);

export const activeFileId = writable<string>('initial-sample');
export const viewMode = writable<ViewMode>('split');
export const settings = writable<EditorSettings>(loadSavedSettings());
export const workspaceRoot = writable<string | null>(null);
export const workspaceTree = writable<FileNode[]>([]);
export const recentFiles = writable<string[]>(loadSavedRecentFiles());
export const sidebarOpen = writable<boolean>(true);
export const sidebarTab = writable<'files' | 'toc' | 'recent'>('files');
export const searchBarOpen = writable<boolean>(false);
export const settingsModalOpen = writable<boolean>(false);

// Active file derived
export const activeFile = derived([files, activeFileId], ([$files, $activeFileId]) => {
  return $files.find((f) => f.id === $activeFileId) || null;
});

// Document outline TOC derived from active file
export const activeToc = derived(activeFile, ($activeFile) => {
  if (!$activeFile) return [];
  const { toc } = parseMarkdown($activeFile.content);
  return toc;
});

// Any dirty file
export const hasUnsavedChanges = derived(files, ($files) => {
  return $files.some((f) => f.isDirty);
});

// Save settings to localStorage
settings.subscribe((val) => {
  try {
    localStorage.setItem('onemanbyte_settings', JSON.stringify(val));
  } catch (e) {}
});

// Save recent files
recentFiles.subscribe((val) => {
  try {
    localStorage.setItem('onemanbyte_recent', JSON.stringify(val));
  } catch (e) {}
});

export interface SavePromptState {
  isOpen: boolean;
  fileId: string;
  fileName: string;
  isClosingApp: boolean;
  onSave: () => void | Promise<void>;
  onDiscard: () => void;
  onCancel: () => void;
}

export const savePromptModal = writable<SavePromptState>({
  isOpen: false,
  fileId: '',
  fileName: '',
  isClosingApp: false,
  onSave: () => {},
  onDiscard: () => {},
  onCancel: () => {},
});

export const editorActions = {
  createNewFile(name: string = 'Untitled.md', initialContent: string = '# Untitled\n\n') {
    const id = 'file-' + Date.now();
    const newFile: OpenFile = {
      id,
      name,
      content: initialContent,
      savedContent: '',
      isDirty: true,
      isNew: true,
    };
    files.update((f) => [...f, newFile]);
    activeFileId.set(id);
    return id;
  },

  async openFile() {
    const res = await openFileDialog();
    if (!res) return;
    this.addOrSwitchFile(res.name, res.content, res.path);
  },

  async openWorkspace() {
    const res = await openFolderDialog();
    if (!res) return;
    workspaceRoot.set(res.path);
    workspaceTree.set(res.tree);
    sidebarOpen.set(true);
    sidebarTab.set('files');
    toastStore.info(`Workspace opened: ${res.name}`);
  },

  async openFileFromPath(path: string, name: string) {
    const content = await readFileContent(path);
    if (content !== null) {
      this.addOrSwitchFile(name, content, path);
    } else {
      toastStore.error(`Could not read file: ${name}`);
    }
  },

  async openFilePathDirectly(filePath: string) {
    if (!filePath) return;
    const cleanPath = filePath.trim().replace(/^["']|["']$/g, '');
    if (!cleanPath) return;
    const name = cleanPath.split(/[\\/]/).pop() || 'Document.md';
    const content = await readFileContent(cleanPath);
    if (content !== null) {
      // Check if only the initial sample file is open and untouched
      const currentFiles = get(files);
      if (currentFiles.length === 1 && currentFiles[0].id === 'initial-sample' && !currentFiles[0].isDirty) {
        files.set([]);
      }
      this.addOrSwitchFile(name, content, cleanPath);
      toastStore.info(`Opened: ${name}`);
    } else {
      toastStore.error(`Could not open file: ${name}`);
    }
  },

  addOrSwitchFile(name: string, content: string, path?: string) {
    const currentFiles = get(files);
    const existing = currentFiles.find((f) => (path && f.path === path) || (!path && f.name === name));
    if (existing) {
      activeFileId.set(existing.id);
      return existing.id;
    }

    const id = 'file-' + Date.now();
    const newFile: OpenFile = {
      id,
      name,
      path,
      content,
      savedContent: content,
      isDirty: false,
      isNew: false,
    };

    files.update((f) => [...f, newFile]);
    activeFileId.set(id);

    if (path) {
      recentFiles.update((recents) => {
        const filtered = recents.filter((r) => r.path !== path);
        return [{ path, name, lastOpened: Date.now() }, ...filtered.slice(0, 9)];
      });
    }

    return id;
  },

  updateContent(id: string, content: string) {
    files.update((list) =>
      list.map((f) => {
        if (f.id === id) {
          const isDirty = content !== f.savedContent;
          return { ...f, content, isDirty };
        }
        return f;
      })
    );
  },

  async saveFileById(id: string): Promise<boolean> {
    const currentFiles = get(files);
    const target = currentFiles.find((f) => f.id === id);
    if (!target) return false;

    if (!target.path) {
      const savedPath = await apiSaveFileAs(target.content, target.name);
      if (savedPath) {
        const name = savedPath.split(/[\\/]/).pop() || target.name;
        files.update((list) =>
          list.map((f) => (f.id === id ? { ...f, name, path: savedPath, savedContent: f.content, isDirty: false, isNew: false } : f))
        );
        toastStore.success(`Saved: ${name}`);
        return true;
      }
      return false;
    } else {
      const savedPath = await apiSaveFile(target.path, target.content);
      if (savedPath) {
        files.update((list) =>
          list.map((f) => (f.id === id ? { ...f, savedContent: f.content, isDirty: false, isNew: false } : f))
        );
        toastStore.success(`Saved: ${target.name}`);
        return true;
      }
      return false;
    }
  },

  async saveActiveFile() {
    const active = get(activeFile);
    if (!active) return;
    return this.saveFileById(active.id);
  },

  async saveActiveFileAs() {
    const active = get(activeFile);
    if (!active) return;

    const savedPath = await apiSaveFileAs(active.content, active.name);
    if (savedPath) {
      const name = savedPath.split(/[\\/]/).pop() || active.name;
      files.update((list) =>
        list.map((f) => {
          if (f.id === active.id) {
            return { ...f, name, path: savedPath, savedContent: f.content, isDirty: false, isNew: false };
          }
          return f;
        })
      );
      toastStore.success(`Saved as: ${name}`);
    }
  },

  closeTab(id: string) {
    const currentFiles = get(files);
    const target = currentFiles.find((f) => f.id === id);
    if (!target) return;

    if (target.isDirty) {
      savePromptModal.set({
        isOpen: true,
        fileId: target.id,
        fileName: target.name,
        isClosingApp: false,
        onSave: async () => {
          const ok = await editorActions.saveFileById(target.id);
          if (ok) {
            editorActions.forceCloseTab(target.id);
            savePromptModal.update((s) => ({ ...s, isOpen: false }));
          }
        },
        onDiscard: () => {
          editorActions.forceCloseTab(target.id);
          savePromptModal.update((s) => ({ ...s, isOpen: false }));
        },
        onCancel: () => {
          savePromptModal.update((s) => ({ ...s, isOpen: false }));
        },
      });
      return;
    }

    this.forceCloseTab(id);
  },

  forceCloseTab(id: string) {
    const currentFiles = get(files);
    const remaining = currentFiles.filter((f) => f.id !== id);
    files.set(remaining);

    if (get(activeFileId) === id) {
      if (remaining.length > 0) {
        activeFileId.set(remaining[remaining.length - 1].id);
      } else {
        activeFileId.set('');
      }
    }
  },

  closeAllTabs() {
    const currentFiles = get(files);
    const hasDirty = currentFiles.some((f) => f.isDirty);
    if (hasDirty) {
      this.requestAppClose();
      return;
    }
    files.set([]);
    activeFileId.set('');
  },

  async requestAppClose(onCompleteClose?: () => void) {
    const currentFiles = get(files);
    const dirtyFiles = currentFiles.filter((f) => f.isDirty);

    if (dirtyFiles.length === 0) {
      if (onCompleteClose) {
        onCompleteClose();
      } else {
        const { closeWindow } = await import('../platform/fs');
        await closeWindow();
      }
      return;
    }

    const target = dirtyFiles[0];
    savePromptModal.set({
      isOpen: true,
      fileId: target.id,
      fileName: target.name,
      isClosingApp: true,
      onSave: async () => {
        const ok = await editorActions.saveFileById(target.id);
        if (ok) {
          editorActions.forceCloseTab(target.id);
          const remainingDirty = get(files).filter((f) => f.isDirty);
          if (remainingDirty.length > 0) {
            editorActions.requestAppClose(onCompleteClose);
          } else {
            savePromptModal.update((s) => ({ ...s, isOpen: false }));
            if (onCompleteClose) {
              onCompleteClose();
            } else {
              const { closeWindow } = await import('../platform/fs');
              await closeWindow();
            }
          }
        }
      },
      onDiscard: async () => {
        editorActions.forceCloseTab(target.id);
        const remainingDirty = get(files).filter((f) => f.isDirty);
        if (remainingDirty.length > 0) {
          editorActions.requestAppClose(onCompleteClose);
        } else {
          savePromptModal.update((s) => ({ ...s, isOpen: false }));
          if (onCompleteClose) {
            onCompleteClose();
          } else {
            const { closeWindow } = await import('../platform/fs');
            await closeWindow();
          }
        }
      },
      onCancel: () => {
        savePromptModal.update((s) => ({ ...s, isOpen: false }));
      },
    });
  },

  updateSettings(newSettings: Partial<EditorSettings>) {
    settings.update((s) => ({ ...s, ...newSettings }));
  },
};
