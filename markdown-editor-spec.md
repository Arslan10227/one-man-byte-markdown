# Project Spec: Lightweight Markdown Viewer/Editor for Windows

**Project name (working title):** MarkLite
**Target platform:** Windows 10/11 (x64)
**Type:** Desktop application
**Goal:** A fast, lightweight, native-feeling markdown file viewer and editor — a leaner alternative to Typora/Obsidian/Mark Text, optimized for startup speed, low memory footprint, and smooth editing of large files.

---

## 1. Tech Stack (Decided)

| Layer | Choice | Reason |
|---|---|---|
| App shell | **Tauri v2** (Rust + WebView2) | Native WebView, no bundled Chromium, small binary (~5-10MB), low RAM |
| Frontend framework | **Svelte + SvelteKit (SPA mode)** | Compiles to minimal JS, no virtual DOM overhead, ideal for "lightweight" goal |
| Editor component | **CodeMirror 6** | Modular, fast, great markdown mode, handles large documents well |
| Markdown parser | **markdown-it** | Fast, plugin ecosystem, CommonMark + GFM support |
| Syntax highlighting (code blocks) | **highlight.js** | Faster and lighter than Shiki; acceptable visual quality |
| Styling | **Tailwind CSS** (or plain CSS with CSS variables for theming) | Utility-first, keeps CSS bundle small when purged |
| State/config storage | Tauri `fs` plugin + local JSON config file | No need for a database |
| Build tooling | Vite (via SvelteKit) | Fast dev/build cycle |

Do not substitute Electron, Monaco, or a heavy WYSIWYG framework (ProseMirror/Tiptap) unless a later phase explicitly calls for a WYSIWYG mode — the priority is speed and low resource usage.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────┐
│                Tauri Shell (Rust)            │
│  - Window management                         │
│  - Native file dialogs                       │
│  - File system read/write                    │
│  - File watcher (detect external changes)    │
│  - App menu / tray / shortcuts               │
│  - Config persistence (JSON in app data dir) │
└───────────────────┬───────────────────────────┘
                    │ IPC (Tauri commands/events)
┌───────────────────▼───────────────────────────┐
│              Frontend (Svelte SPA)            │
│  - CodeMirror 6 editor pane                  │
│  - Live preview pane (markdown-it → HTML)    │
│  - Sidebar (file tree / outline)             │
│  - Toolbar (formatting actions)              │
│  - Status bar (word count, cursor pos)       │
│  - Settings panel                            │
└─────────────────────────────────────────────┘
```

---

## 3. Full Feature List

### 3.1 Core (must exist before v1.0)
- Open a single `.md` file via native file dialog, drag-and-drop, or CLI arg / "Open with"
- Split-pane view: raw markdown editor (left) + live rendered preview (right)
- Toggle modes: Editor-only, Preview-only, Split view
- Synced scrolling between editor and preview
- Save / Save As (Ctrl+S / Ctrl+Shift+S)
- Unsaved changes indicator (dot/asterisk in title bar and tab)
- Undo/redo (native to CodeMirror)
- Find & Replace within the current document (Ctrl+F / Ctrl+H)
- Basic formatting shortcuts: bold, italic, strikethrough, headings (H1-H6), bullet list, numbered list, blockquote, inline code, code block, link, image
- Syntax highlighting for fenced code blocks (common languages)
- GitHub Flavored Markdown support: tables, task lists, strikethrough, autolinks
- Word count / character count / reading time in status bar
- Dark mode and light mode, theme toggle
- Adjustable editor font size and font family
- Window state persistence (remember size/position on relaunch)
- Recently opened files list

### 3.2 File/Project Management
- Open a folder as a "workspace" — sidebar shows a file tree of all `.md` files
- Create new file / new folder from sidebar (right-click context menu)
- Rename / delete / move files from sidebar
- Multi-tab support (open several files at once, tab bar at top)
- Detect external file changes (via file watcher) and prompt to reload or keep local version
- Auto-save with configurable debounce interval (default: off, opt-in)

### 3.3 Editing Quality-of-Life
- YAML frontmatter block: syntax-highlighted differently, optionally collapsible
- Table editing helper: format/align markdown tables on save or via command, add/remove rows/columns via toolbar or keyboard shortcut
- Paste image from clipboard → auto-save to a relative `./assets` or `./images` folder and insert markdown image link
- Paste a URL over selected text → auto-wrap as a markdown link
- Auto-continue lists (pressing Enter in a list continues the list/checkbox)
- Smart auto-pairing of `*`, `_`, backticks, brackets
- Outline/table-of-contents panel generated from headings, click to jump
- Line wrap toggle, line numbers toggle

### 3.4 Export / Conversion
- Export current document to HTML (standalone, styles inlined)
- Export current document to PDF (implementation note: bundle Pandoc as a Tauri "sidecar" binary, or use a JS-based print-to-PDF via WebView print API as a lighter fallback)
- Copy rendered preview as HTML to clipboard
- Print document

### 3.5 Settings
- Theme (light/dark/system)
- Editor font family/size, preview font family/size
- Tab width / spaces vs tabs
- Toggle: auto-save, spellcheck, line numbers, word wrap, sync scroll
- Keybinding reference panel (read-only list is fine for v1)

### 3.6 Nice-to-Have (post-v1, only if time allows)
- Math rendering (KaTeX) via markdown-it plugin
- Mermaid diagram rendering in preview
- Spellcheck (native WebView2 spellcheck, or a JS library)
- Multiple windows
- Command palette (Ctrl+Shift+P style fuzzy command search)
- Vim/Emacs keybinding modes in CodeMirror
- Simple plugin system for custom markdown-it plugins

**Explicitly out of scope for v1:** real-time collaboration, cloud sync, mobile version, full WYSIWYG rich-text mode.

---

## 4. Non-Functional Requirements

- **Startup time:** under 1 second cold start on typical hardware
- **Memory:** idle usage should stay well under 150MB with a single file open (this is the main reason Tauri was chosen over Electron)
- **Binary size:** target under 15MB installer
- **Large file handling:** editor must remain responsive (no typing lag) on markdown files up to ~5MB / ~50,000 lines — debounce preview re-render (150-300ms) rather than rendering on every keystroke
- **Offline-first:** the app must work with zero network access; no telemetry calls, no CDN dependencies at runtime (bundle all fonts/icons/libs locally)

---

## 5. Build Phases

### Phase 0 — Environment Setup
1. Install Rust toolchain, Node.js (LTS), and Tauri CLI prerequisites (WebView2 runtime is preinstalled on Windows 11, verify on Windows 10).
2. Scaffold project: `npm create tauri-app@latest` choosing SvelteKit + TypeScript template.
3. Confirm the dev build runs (`npm run tauri dev`) and produces a native window.
4. Set up ESLint/Prettier and a basic folder structure:
   ```
   src/            (Svelte frontend)
     lib/
       components/
       stores/
       markdown/
     routes/
   src-tauri/      (Rust backend)
     src/
       commands/
       main.rs
   ```
5. Set up Git repo with `.gitignore` for `node_modules`, `target`, `dist`.

**Deliverable:** empty Tauri+Svelte app that opens a native window with "Hello World."

---

### Phase 1 — Single-File Editor MVP
1. Integrate CodeMirror 6 into a Svelte component (`Editor.svelte`) with markdown language support (`@codemirror/lang-markdown`).
2. Integrate `markdown-it` and render its output into a `Preview.svelte` component.
3. Wire editor content → debounced markdown-it render → preview pane (one-way, live).
4. Build split-pane layout (editor left, preview right) with a draggable divider.
5. Implement Tauri commands (Rust) for: `open_file`, `save_file`, `save_file_as`, using native dialogs (`tauri-plugin-dialog`) and `tauri-plugin-fs`.
6. Wire "Open" (Ctrl+O) and "Save"/"Save As" (Ctrl+S/Ctrl+Shift+S) menu items and keyboard shortcuts to those commands.
7. Track dirty/unsaved state; show indicator in title bar.
8. Add basic app menu (File, Edit, View) using Tauri's menu API.

**Deliverable:** a working single-file markdown editor with live preview, open/save, and unsaved-state tracking.

---

### Phase 2 — Editing Features & Formatting
1. Add toolbar with formatting buttons (bold, italic, headers, lists, quote, code, link, image) that apply CodeMirror transactions to wrap/insert markdown syntax.
2. Add matching keyboard shortcuts for each formatting action.
3. Implement Find & Replace panel (CodeMirror's `@codemirror/search`).
4. Add syntax highlighting for fenced code blocks in the preview using highlight.js, auto-detecting language from the fence info string.
5. Add GFM extensions to markdown-it: tables, task lists (checkboxes), strikethrough, autolinks (`markdown-it-*` plugins).
6. Add synced scrolling between editor and preview (map scroll percentage or line-based mapping).
7. Add word count / character count / estimated reading time, shown in a status bar.
8. Add auto-pairing of brackets/quotes/emphasis characters and smart list continuation on Enter.

**Deliverable:** editor feels comparable to a real markdown tool — formatting shortcuts, search, GFM rendering, status bar.

---

### Phase 3 — Workspace / Multi-File Support
1. Add "Open Folder" command; read directory tree via Rust (`std::fs`) exposed as a Tauri command returning a nested JSON tree of `.md` files/folders.
2. Build a `Sidebar.svelte` file-tree component (expand/collapse folders, click to open file).
3. Add right-click context menu on tree items: new file, new folder, rename, delete, reveal in Explorer.
4. Implement tab bar (`Tabs.svelte`) supporting multiple open files, with dirty-state dot per tab and close (with unsaved-changes confirmation).
5. Implement a Rust file-watcher (using the `notify` crate or `tauri-plugin-fs` watch API) that emits an event to the frontend when the active file changes on disk externally; show a "file changed externally — reload / keep mine" prompt.
6. Persist last-opened workspace folder and open tabs in a local config JSON so the app restores session on relaunch.

**Deliverable:** app can be used as a folder-based notes/docs workspace, not just single files.

---

### Phase 4 — Quality-of-Life & Power Features
1. YAML frontmatter detection and distinct styling/collapsing in the editor.
2. Table formatting helper: command to auto-align a markdown table under the cursor; toolbar buttons to insert row/column.
3. Clipboard image paste: intercept paste event, if it contains image data, save to `./assets/<timestamp>.png` relative to the current file and insert `![](./assets/...)` at cursor.
4. URL-paste-over-selection → wrap selection as `[selection](url)`.
5. Outline/TOC panel: parse headings from the document (via markdown-it token stream), render as a clickable nested list, clicking scrolls editor+preview to that heading.
6. Settings panel (`Settings.svelte`): theme, font family/size (editor & preview separately), tab width, toggle auto-save/spellcheck/word-wrap/line-numbers/sync-scroll — persist to config JSON via Tauri fs.
7. Implement dark/light/system theme switching using CSS variables, verify contrast in both modes for editor, preview, and syntax highlighting theme.

**Deliverable:** app has the workflow conveniences that make people switch from Notepad/VS Code to a dedicated markdown tool.

---

### Phase 5 — Export & Polish
1. Implement "Export to HTML": wrap rendered preview HTML in a standalone document with inlined CSS (include the current theme's styles).
2. Implement "Export to PDF": start with the WebView `window.print()` → "Save as PDF" flow (works out of the box, no extra binary); optionally add a Pandoc sidecar binary later for higher-fidelity PDF/DOCX export.
3. Add "Copy rendered HTML" to clipboard.
4. Add recent files list (persisted, shown on a start/welcome screen when no file/folder is open).
5. Performance pass: profile with a large (~5MB) markdown file, ensure typing latency stays low; add virtualization or render-windowing to the preview if needed; verify debounce timing feels responsive but not wasteful.
6. Accessibility pass: keyboard navigation for menus/sidebar/tabs, sufficient color contrast, focus outlines.
7. Error handling pass: file permission errors, missing file on open, save failures — show non-blocking toast notifications rather than crashing.

**Deliverable:** feature-complete, polished v1.0 candidate.

---

### Phase 6 — Packaging & Distribution
1. Configure `tauri.conf.json`: app name, icon set (multiple resolutions), identifier, version.
2. Set up Windows code signing (optional but recommended — otherwise SmartScreen will warn users).
3. Build production installer via `npm run tauri build` (produces `.msi` and/or `.exe` NSIS installer for Windows).
4. Verify installer size and startup performance on a clean Windows VM (no dev tools installed) to confirm the WebView2 runtime dependency is handled (Tauri can bootstrap it automatically).
5. Write a short README/CHANGELOG; tag a v1.0.0 release.
6. (Optional) Set up GitHub Actions CI to build the Windows installer on tag push.

**Deliverable:** a distributable `.msi`/`.exe` installer, ready to share or publish.

---

## 6. Key Libraries/Crates Reference

**NPM packages (frontend):**
- `codemirror`, `@codemirror/lang-markdown`, `@codemirror/search`, `@codemirror/commands`, `@codemirror/view`, `@codemirror/state`
- `markdown-it`, `markdown-it-task-lists`, `markdown-it-footnote` (optional), `markdown-it-front-matter`
- `highlight.js`
- `@tauri-apps/api`, `@tauri-apps/plugin-dialog`, `@tauri-apps/plugin-fs`

**Rust crates (backend, `src-tauri/Cargo.toml`):**
- `tauri`
- `tauri-plugin-dialog`
- `tauri-plugin-fs`
- `notify` (file watching)
- `serde`, `serde_json` (config persistence)

---

## 7. Notes for the Building Agent

- Prioritize getting Phase 1 fully working end-to-end (open/edit/preview/save a single file) before adding any Phase 2+ feature — a working minimal loop beats a half-built feature-rich shell.
- Keep the Rust side thin: it should mostly be file I/O, dialogs, and the file watcher. All markdown parsing, rendering, and editing logic belongs in the frontend (Svelte/JS) so it stays easy to iterate on with normal web tooling.
- Debounce any expensive operation (preview render, auto-save, table reformat) — do not run these on every keystroke.
- Every new feature should be checked against the Non-Functional Requirements in Section 4 (startup time, memory, large-file responsiveness) before being considered "done."
- When in doubt between a simpler implementation and a more "complete" one, choose the simpler one first — this project's differentiator is speed/lightness, not feature parity with Obsidian.
