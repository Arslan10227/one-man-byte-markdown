# OneManByte — Markdown ⚡

<p align="center">
  <img src="screenshots/main.png" alt="OneManByte Markdown – Main UI" width="100%"/>
</p>

<p align="center">
  A lightning‑fast, lightweight markdown viewer &amp; editor built with <strong>Tauri v2</strong>, <strong>Svelte 5</strong>, <strong>CodeMirror 6</strong>, and <strong>markdown‑it</strong>.<br/>
  Designed as a high‑performance alternative to heavy Electron‑based editors — <em>&lt;1s startup, &lt;100MB RAM, zero telemetry</em>.
</p>

<p align="center">
  <a href="https://github.com/Arslan10227/one-man-byte-markdown/releases"><img src="https://img.shields.io/github/v/release/Arslan10227/one-man-byte-markdown?label=release&style=flat-square" alt="Release"/></a>
  <a href="https://github.com/Arslan10227/one-man-byte-markdown/actions"><img src="https://img.shields.io/github/actions/workflow/status/Arslan10227/one-man-byte-markdown/build.yml?branch=main&style=flat-square&label=CI" alt="CI"/></a>
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue?style=flat-square" alt="Platforms"/>
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="MIT License"/>
</p>

---

## 🌟 Features

| Feature | Detail |
|---|---|
| ⚡ Near‑zero latency | CodeMirror 6 + Svelte 5 reactive engine |
| 🎨 Dark & Light themes | Glassmorphic dark slate + crisp light mode |
| 🔀 Synchronized scrolling | Proportional real‑time scroll sync |
| 📂 Workspace & multi‑tab | File tree sidebar, tab bar, recent files |
| 📑 Outline TOC | Auto‑generated, clickable table of contents |
| 🛠️ Formatting toolbar | Bold, italic, headings, code, tables, lists |
| ☑️ Interactive task lists | Checkboxes toggle in markdown source |
| 💻 Syntax highlighting | highlight.js with one‑click copy |
| 📊 Mermaid diagrams | Flowcharts & sequences open in zoom modal |
| 📐 KaTeX math | Inline and display math rendering |
| 📤 Export | Standalone HTML, PDF print, clipboard HTML |
| 🔗 `.md` file association | Custom icon overlay, double‑click to open |
| 🧹 Clean uninstall | Removes registry entries & user data |
| 🔒 Offline‑first | Zero telemetry, no CDN dependencies |

---

## 📸 Screenshots

### Split View — Dark Mode
![Split View Dark Mode](screenshots/dark_mode.png)

### Split View — Light Mode
![Split View Light Mode](screenshots/light_mode.png)

### Outline / TOC Panel
![Outline TOC View](screenshots/outline_view.png)

### KaTeX Mathematical Formulas
![KaTeX Math Rendering](screenshots/math_formulas.png)

### Diagram Viewer Modal (Mermaid)
![Diagram Modal](screenshots/diagram_modal.png)

### Diagram Viewer — Zoomed In (156%)
![Diagram Zoomed](screenshots/diagram_zoomed.png)

### Preferences / Settings Panel
![Settings Panel with File Association](screenshots/settings.png)

---

## 🎬 Session Recordings

> These are real recordings captured during development and testing.

### Full App Demo
![App Demo Session](screenshots/demo_session.webp)

### Math Formulas Demo
![Math Demo](screenshots/math_demo.webp)

### Diagram Zoom Modal Demo
![Diagram Zoom Demo](screenshots/diagram_zoom_demo.webp)

### File Association Settings Demo
![Settings File Association Demo](screenshots/settings_demo.webp)

---

## 🛠️ Installation

### Windows
1. Download `OneManByte-Setup-1.0.0.exe` from [Releases](https://github.com/Arslan10227/one-man-byte-markdown/releases).
2. Run the installer — no console window appears.
3. Double‑click any `.md` file to open it directly (if file association is enabled in Settings).

### macOS (Universal — x86_64 & arm64)
1. Download the `.dmg` from the Releases page.
2. Drag the app to `/Applications`.

### Linux
1. Download `OneManByte-1.0.0-x86_64.AppImage`.
2. `chmod +x OneManByte-1.0.0-x86_64.AppImage && ./OneManByte-1.0.0-x86_64.AppImage`

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + N` | New Markdown Document |
| `Ctrl + O` | Open File |
| `Ctrl + S` | Save |
| `Ctrl + Shift + S` | Save As |
| `Ctrl + B` | Toggle Sidebar / Bold |
| `Ctrl + I` | Italic |
| `Ctrl + K` | Insert Link |
| `Ctrl + F` | Find & Replace |
| `Ctrl + ,` | Preferences / Settings |
| `Escape` | Close Diagram Modal |

---

## 📂 File Association

OneManByte registers itself as the default handler for `.md`, `.markdown`, `.mkd`, and `.mdown` files.

- The file icon shows a custom **`.MD` overlay badge**.
- Toggle association from **Settings → General → Register as Default .md Editor**.
- The toggle takes effect immediately without restarting.

---

## 🚀 Development

```bash
# Install dependencies
npm ci

# Run dev server (web preview)
npm run dev

# Run desktop app in dev mode (Tauri hot‑reload)
npm run tauri dev

# Production build
npm run tauri build
```

**Prerequisites:** Node.js 18+, Rust (stable), Cargo.

---

## 🧹 Clean Uninstall

The uninstall process removes **everything**:

- ✅ Registry entries for `.md` file association (`HKCU\Software\Classes\.md` and `OneManByte.Markdown`)
- ✅ App data directory (`%APPDATA%\OneManByte` on Windows / `$HOME/.config/OneManByte` on macOS/Linux)
- ✅ Shortcut/launcher files

To uninstall on Windows, use **"Apps & features"** → *OneManByte - Markdown* → Uninstall.

---

## 📦 CI/CD — GitHub Actions

The workflow (`.github/workflows/build.yml`) builds and publishes cross‑platform releases:

| Platform | Target | Artifact |
|---|---|---|
| Windows | `x86_64-pc-windows-msvc` | `.exe` installer, `.msi` |
| macOS | Universal (`x86_64` + `arm64`) | `.dmg` |
| Linux | `x86_64-unknown-linux-gnu` | `.AppImage` |

Trigger a manual build from the **Actions** tab → **Build and Release** → **Run workflow**.

---

## 🏗️ Architecture

```
OneManByte - Markdown
├── src/                        # Svelte 5 frontend
│   ├── App.svelte              # Root component, global events
│   ├── lib/
│   │   ├── components/         # UI components (TitleBar, TabBar, ...)
│   │   ├── markdown/           # parser.ts (markdown-it + KaTeX + Mermaid)
│   │   ├── platform/           # fs.ts — Tauri <-> frontend bridge
│   │   └── stores/             # editorStore.ts, themeStore.ts
│   └── main.ts
├── src-tauri/                  # Rust backend
│   ├── src/
│   │   ├── lib.rs              # Tauri commands (file I/O, association, window)
│   │   └── main.rs             # Entry point
│   ├── icons/                  # App icons (all sizes + md_association_icon.ico)
│   └── tauri.conf.json
└── .github/workflows/
    └── build.yml               # Cross‑platform CI/CD
```

---

## 📜 License

MIT © OneManByte

A lightning‑fast, lightweight markdown viewer & editor built with **Tauri v2**, **Svelte 5**, **CodeMirror 6**, and **markdown‑it**.

## 🌟 Features
- Near‑zero latency editing
- Dark / Light themes with glassmorphic UI
- Synchronized scrolling between editor and preview
- Workspace and tab management
- Outline table of contents
- Formatting toolbar and keyboard shortcuts
- Export to HTML / PDF / clipboard
- Flowchart & sequence diagram support via Mermaid (opens in a modal with zoom in/out)
- File association for `.md` files with custom icon (".MD" overlay)
- Clean uninstall removes association and user data

## 📸 Screenshots
![Main UI](https://raw.githubusercontent.com/Arslan10227/one-man-byte-markdown/main/screenshots/main.png)
![Diagram Modal](https://raw.githubusercontent.com/Arslan10227/one-man-byte-markdown/main/screenshots/diagram_modal.png)

## 🛠️ Installation
### Windows
- Download the latest `OneManByte-Setup-1.0.0.exe` from the [Releases](https://github.com/Arslan10227/one-man-byte-markdown/releases).
- Run the installer (no console window appears).

### macOS (Universal – x86_64 & arm64)
- Download the `.dmg` from the releases page.
- Drag the app to `/Applications`.

### Linux
- Download the AppImage (`OneManByte-1.0.0-x86_64.AppImage`).
- Make it executable: `chmod +x OneManByte-1.0.0-x86_64.AppImage && ./OneManByte-1.0.0-x86_64.AppImage`.

## 📂 File Association
The app registers itself as the default handler for `.md` files. The associated icon shows a small `.MD` overlay (see the icon in the repo). To unregister, run the app's **Uninstall** option in Settings or remove it via the Windows "Apps & features" panel.

## 🚀 Development
```bash
# Install dependencies
npm ci

# Run dev server (web)
npm run dev

# Run desktop dev (Tauri)
npm run tauri dev

# Build for all platforms (requires Rust & appropriate toolchains)
npm run tauri build
```

The CI workflow (`.github/workflows/build.yml`) automatically builds Windows, macOS, and Linux binaries on every push to `main` and publishes them as a draft release `v1.0.0`.

## 🧹 Clean Uninstall
The **Settings → Uninstall** button removes:
- Registry entries for `.md` association (Windows).
- The hidden data directory (`%APPDATA%/OneManByte` or `$HOME/.config/OneManByte`).
- Shortcut files created during install.

## 📦 CI/CD – GitHub Actions
A GitHub Actions workflow creates cross‑platform releases:
- **Windows**: `x86_64-pc-windows-msvc` – installer `.exe` & `.msi`
- **macOS**: universal binary (`x86_64` + `arm64`) – `.dmg`
- **Linux**: AppImage – `.AppImage`

The workflow is manually triggerable via the **Run workflow** button on the Actions tab and also runs on each push.

## 📚 Documentation & SEO
The repository includes:
- Detailed README (this file) with screenshots and video demos.
- `docs/` folder with usage guides.
- SEO tags in the repository description: "markdown editor, tauri, svelte, cross‑platform, fast startup, file association".
- Topics: `markdown`, `tauri`, `svelte`, `cross‑platform`, `desktop-app`.

## 🏷️ Tags & Description
**Description:** OneManByte – a high‑performance, cross‑platform markdown editor with native file association and diagram support.
**Topics:** `markdown`, `editor`, `tauri`, `svelte`, `cross-platform`, `desktop`, `github-actions`.

## 📜 License
MIT © OneManByte

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
