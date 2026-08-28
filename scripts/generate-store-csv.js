import fs from 'fs';
import path from 'path';

const templatePath = 'C:\\Users\\arsla\\Downloads\\listingData-9N3ZQ6115W98-1152921505701759119.csv';
const outputPath = 'C:\\Users\\arsla\\Downloads\\listingData-populated.csv';
const repoOutputPath = path.join(process.cwd(), 'store-listingData.csv');

const fullDescription = `OneManByte - Markdown Viewer & Editor is a blazing-fast, elegant, and lightweight markdown desktop application built with Tauri v2, Svelte 5, and CodeMirror 6.

Designed as a high-performance, modern alternative to heavy Electron-based editors, OneManByte delivers near-instant startup (<1s), minimal memory usage (<100MB RAM), and ultra-responsive editing even with large, multi-thousand-line documents.

KEY HIGHLIGHTS:

⚡ Ultra-Fast & Responsive
Powered by Svelte 5 and modular CodeMirror 6, experience zero-lag typing, instant token parsing, and smooth editing.

🔀 Real-Time Synchronized Scrolling
Seamlessly edit markdown while viewing live rendered HTML. Proportional scroll sync keeps both editor and preview perfectly aligned.

🎨 Sleek Dark & Light Themes
Tailored dark slate and crisp light aesthetics featuring modern glassmorphic accents, clean typography, and customizable font sizes.

📊 Interactive Diagram Viewer (Mermaid)
Render complex flowcharts, sequence diagrams, class diagrams, and pie charts directly in your notes. Click any diagram to open a dedicated pan-and-zoom modal with up to 300% zoom and SVG/PNG copy features.

📐 KaTeX Mathematical Formulas
Full inline and display math formula rendering using high-precision KaTeX. Ideal for academic notes, technical specifications, and research papers.

📂 Workspace & Multi-Document Tabs
Open individual markdown files, recent files, or entire folders into an interactive sidebar tree. Manage multiple documents with tabs and unsaved change protection.

📑 Outline Table of Contents
Headings are automatically mapped into an interactive outline panel for instant document navigation.

📤 Multi-Format Export
Export rendered documents as standalone HTML (with embedded CSS), print to PDF, or copy rich HTML directly to your clipboard.

🔒 100% Offline-First & Private
Zero telemetry, no background analytics, and zero external CDN dependencies. All parsing and rendering execute locally on your device.`;

const fieldValues = {
  'Description': fullDescription,
  'ReleaseNotes': 'Initial release 1.0.0 featuring real-time split view, live sync scroll, KaTeX math rendering, Mermaid diagram zoom modal, outline TOC, multi-tab workspace, and offline-first performance.',
  'Title': 'OneManByte - Markdown Viewer & Editor',
  'ShortTitle': 'OneManByte Markdown',
  'SortTitle': 'OneManByte Markdown',
  'VoiceTitle': 'OneManByte Markdown',
  'ShortDescription': 'Lightning-fast, lightweight markdown viewer & editor with live preview, KaTeX math, Mermaid diagrams, and offline-first focus.',
  'DevStudio': 'OneManByte',
  'CopyrightTrademarkInformation': '© 2026 OneManByte. All rights reserved.',
  'AdditionalLicenseTerms': 'MIT License (https://opensource.org/licenses/MIT)',

  // Screenshots (kept blank for CSV import so text/captions/features import cleanly without path errors; images are dragged into the UI)
  'DesktopScreenshot1': '',
  'DesktopScreenshot2': '',
  'DesktopScreenshot3': '',
  'DesktopScreenshot4': '',
  'DesktopScreenshot5': '',
  'DesktopScreenshot6': '',
  'DesktopScreenshot7': '',
  'DesktopScreenshot8': '',

  'DesktopScreenshotCaption1': 'Real-Time Synchronized Markdown Editor & Preview Pane',
  'DesktopScreenshotCaption2': 'Dark Slate Theme with Syntax-Highlighted Code Blocks',
  'DesktopScreenshotCaption3': 'Crisp Light Mode with Interactive Task Checklists',
  'DesktopScreenshotCaption4': 'Outline TOC Sidebar with Instant Heading Navigation',
  'DesktopScreenshotCaption5': 'KaTeX Mathematical Formula & Equation Rendering',
  'DesktopScreenshotCaption6': 'Interactive Mermaid Flowcharts & Sequence Diagrams',
  'DesktopScreenshotCaption7': 'Dedicated Diagram Viewer Modal with Pan & Zoom Controls',
  'DesktopScreenshotCaption8': 'Preferences & Native File Association Settings',

  // Logos
  'StoreLogo300x300': '',

  // Features
  'Feature1': '⚡ Ultra-Fast Performance: Near-instant startup (<1s) and minimal RAM footprint powered by Svelte 5.',
  'Feature2': '🔀 Live Synchronized Scrolling: Proportional real-time scroll sync between editor and preview.',
  'Feature3': '🎨 Dark & Light Modes: Tailored dark slate and crisp light themes with glassmorphic accents.',
  'Feature4': '📊 Interactive Diagrams: Full Mermaid support (flowcharts, sequence diagrams) with pan/zoom modal.',
  'Feature5': '📐 KaTeX Math Engine: Clean inline and display LaTeX formula rendering.',
  'Feature6': '📂 Multi-Tab Workspace: Document tabs, workspace folder tree, and recent files list.',
  'Feature7': '📑 Outline TOC: Auto-generated clickable table of contents from document headings.',
  'Feature8': '📤 Instant Export: Export to standalone HTML, PDF print, and rich clipboard HTML.',
  'Feature9': '☑️ Interactive Task Lists: Checkboxes in the preview dynamically toggle in markdown source.',
  'Feature10': '🔒 100% Offline-First: Zero telemetry, no trackers, fully private local editing.',

  // System Requirements
  'MinimumHardwareReq1': 'Windows 10 version 17763.0 or higher',
  'MinimumHardwareReq2': 'x64 or ARM64 architecture',
  'MinimumHardwareReq3': '512 MB RAM',
  'RecommendedHardwareReq1': 'Windows 11',
  'RecommendedHardwareReq2': '1 GB RAM or more',

  // Search Keywords (up to 7 terms)
  'SearchTerm1': 'markdown editor',
  'SearchTerm2': 'markdown viewer',
  'SearchTerm3': 'notes',
  'SearchTerm4': 'katex math',
  'SearchTerm5': 'mermaid diagram',
  'SearchTerm6': 'live preview',
  'SearchTerm7': 'offline editor'
};

function escapeCsvCell(text) {
  if (text === undefined || text === null) return '';
  const str = String(text);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

const templateRaw = fs.readFileSync(templatePath, 'utf8');
const lines = templateRaw.split(/\r?\n/);
const header = lines[0]; // Field,ID,Type (Type),default,en-us,en

const outputLines = [header];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) {
    outputLines.push(line);
    continue;
  }

  // Parse CSV line
  const parts = [];
  let inQuotes = false;
  let current = '';
  for (let c = 0; c < line.length; c++) {
    const char = line[c];
    if (char === '"') {
      if (inQuotes && line[c + 1] === '"') {
        current += '"';
        c++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current);

  const fieldName = parts[0];
  const id = parts[1];
  const type = parts[2];
  let defaultVal = parts[3] || '';
  let enUsVal = parts[4] || '';
  let enVal = parts[5] || '';

  if (fieldValues[fieldName] !== undefined) {
    const val = fieldValues[fieldName];
    enUsVal = val;
    enVal = val;
    if (!defaultVal) {
      defaultVal = val;
    }
  }

  const row = [
    escapeCsvCell(fieldName),
    escapeCsvCell(id),
    escapeCsvCell(type),
    escapeCsvCell(defaultVal),
    escapeCsvCell(enUsVal),
    escapeCsvCell(enVal)
  ].join(',');

  outputLines.push(row);
}

const finalCsv = outputLines.join('\r\n');
fs.writeFileSync(outputPath, finalCsv, 'utf8');
fs.writeFileSync(repoOutputPath, finalCsv, 'utf8');

console.log('✅ Successfully generated populated Store Listing CSV:');
console.log('📁 ' + outputPath);
console.log('📁 ' + repoOutputPath);
