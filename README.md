# OneManByte - Markdown ⚡

A blazing-fast, lightweight markdown viewer & editor desktop application built with **Tauri v2**, **Svelte 5**, **CodeMirror 6**, and **markdown-it**.

Designed as a high-performance alternative to heavy electron-based editors, optimized for near-instant startup (<1s), low memory usage (<100MB), and responsive editing of large documents.

---

## ✨ Features

- ⚡ **Near-Zero Latency:** Built with Svelte 5 and modular CodeMirror 6.
- 🎨 **Sleek Themes:** Custom dark slate and crisp light modes with glassmorphic accents.
- 🔀 **Synchronized Scrolling:** Proportional real-time scroll sync between editor and preview.
- 📂 **Multi-Document Workspace:** Tab bar, file tree sidebar, recent files, and folder workspaces.
- 📑 **Outline TOC:** Auto-generated table of contents from document headings with instant jump.
- 🛠️ **Formatting Toolbar & Shortcuts:** One-click formatting for bold, italic, headings, code, blockquotes, lists, and tables.
- ☑️ **Interactive Task Lists:** Checkboxes in preview dynamically toggle in markdown source.
- 💻 **Syntax Highlighting:** Fast code block highlighting with one-click copy.
- 📤 **Instant Export:** Standalone HTML export (with inlined CSS), PDF print, and clipboard HTML copy.
- 🔒 **Offline-First:** Zero telemetry, no external runtime CDN dependencies.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+) & npm
- Rust & Cargo (for native desktop build)

### Running in Dev Mode
```bash
# Start frontend web dev server
npm run dev

# Or run desktop app via Tauri
npm run tauri dev
```

### Production Build
```bash
# Build web bundle
npm run build

# Build Windows desktop installer (.exe / .msi)
npm run tauri build
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + N` | New Markdown Document |
| `Ctrl + O` | Open File Dialog |
| `Ctrl + S` | Save File |
| `Ctrl + Shift + S` | Save As |
| `Ctrl + B` | Toggle Sidebar / Bold |
| `Ctrl + I` | Italic |
| `Ctrl + K` | Insert Link |
| `Ctrl + F` | Find & Replace |
| `Ctrl + ,` | Preferences / Settings |

---

## 📄 License
MIT © OneManByte
