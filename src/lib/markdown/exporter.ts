import { parseMarkdown } from './parser';
import { toastStore } from '../stores/toastStore';

export function exportToHtml(title: string, markdownContent: string, isDark: boolean = true): void {
  const { html } = parseMarkdown(markdownContent);
  const bgColor = isDark ? '#0f172a' : '#ffffff';
  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const borderColor = isDark ? '#334155' : '#e2e8f0';
  const codeBg = isDark ? '#1e293b' : '#f1f5f9';

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'Exported Document'}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-color: ${bgColor};
      --text-color: ${textColor};
      --border-color: ${borderColor};
      --code-bg: ${codeBg};
      --primary: #3b82f6;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 40px 20px;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--bg-color);
      color: var(--text-color);
      line-height: 1.7;
    }
    .markdown-container {
      max-width: 860px;
      margin: 0 auto;
    }
    h1, h2, h3, h4, h5, h6 {
      color: inherit;
      font-weight: 700;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      line-height: 1.3;
    }
    h1 { font-size: 2.25rem; border-bottom: 2px solid var(--border-color); padding-bottom: 0.3em; }
    h2 { font-size: 1.75rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.3em; }
    h3 { font-size: 1.35rem; }
    p, ul, ol, blockquote, table, pre { margin-bottom: 1.25em; }
    a { color: var(--primary); text-decoration: none; }
    a:hover { text-decoration: underline; }
    code {
      font-family: 'Fira Code', Consolas, Monaco, monospace;
      font-size: 0.9em;
      padding: 0.2em 0.4em;
      background: var(--code-bg);
      border-radius: 4px;
      border: 1px solid var(--border-color);
    }
    pre code {
      padding: 0;
      background: transparent;
      border: none;
    }
    .code-block-wrapper {
      background: var(--code-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      margin: 1.5em 0;
      overflow: hidden;
    }
    .code-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 14px;
      background: rgba(0, 0, 0, 0.15);
      border-bottom: 1px solid var(--border-color);
      font-size: 0.75rem;
      font-family: 'Fira Code', monospace;
      text-transform: uppercase;
      opacity: 0.8;
    }
    .copy-code-btn { display: none; }
    pre {
      padding: 14px;
      margin: 0;
      overflow-x: auto;
    }
    blockquote {
      border-left: 4px solid var(--primary);
      padding-left: 1rem;
      margin-left: 0;
      opacity: 0.85;
      font-style: italic;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5em 0;
    }
    th, td {
      border: 1px solid var(--border-color);
      padding: 10px 14px;
      text-align: left;
    }
    th { background: rgba(0, 0, 0, 0.1); font-weight: 600; }
    hr {
      border: none;
      border-top: 2px solid var(--border-color);
      margin: 2em 0;
    }
    img { max-width: 100%; height: auto; border-radius: 6px; }
    .contains-task-list { list-style: none; padding-left: 0; }
    .task-list-item { display: flex; align-items: center; gap: 8px; margin: 6px 0; }
    .task-list-item-checkbox { width: 16px; height: 16px; margin: 0; cursor: pointer; accent-color: var(--primary); }
    .frontmatter-badge {
      background: rgba(59, 130, 246, 0.08);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 24px;
      font-size: 0.85rem;
    }
    .frontmatter-title {
      font-weight: 600;
      color: var(--primary);
      margin-bottom: 6px;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }
  </style>
</head>
<body>
  <div class="markdown-container">
    ${html}
  </div>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/\.[^/.]+$/, '') || 'document'}.html`;
  a.click();
  URL.revokeObjectURL(url);
  toastStore.success('Document exported to HTML successfully!');
}

export function copyHtmlToClipboard(markdownContent: string): void {
  const { html } = parseMarkdown(markdownContent);
  navigator.clipboard.writeText(html).then(
    () => {
      toastStore.success('Rendered HTML copied to clipboard!');
    },
    (err) => {
      toastStore.error(`Failed to copy HTML: ${err}`);
    }
  );
}

export function printDocument(): void {
  window.print();
}
