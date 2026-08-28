import MarkdownIt from 'markdown-it';
// @ts-ignore
import taskLists from 'markdown-it-task-lists';
import hljs from 'highlight.js';
import katex from 'katex';
import type { TocHeading } from '../types/editor';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight: function (str, lang) {
    if (lang === 'mermaid') {
      const encoded = encodeURIComponent(str.trim());
      return `<div class="mermaid-diagram-wrapper"><div class="mermaid-toolbar"><span class="mermaid-badge">Diagram</span><div class="mermaid-actions"><button class="expand-diagram-btn" title="Open in Interactive Zoom/Pan Modal">🔍 Expand & Zoom</button></div></div><div class="mermaid-block" data-mermaid="${encoded}"><pre class="mermaid-raw">${md.utils.escapeHtml(str)}</pre></div></div>`;
    }

    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
        return `<div class="code-block-wrapper"><div class="code-header"><span class="code-lang">${lang}</span><button class="copy-code-btn" data-code="${encodeURIComponent(str)}" title="Copy code">Copy</button></div><pre><code class="hljs language-${lang}">${highlighted}</code></pre></div>`;
      } catch (__) {}
    }
    const escaped = md.utils.escapeHtml(str);
    return `<div class="code-block-wrapper"><div class="code-header"><span class="code-lang">text</span><button class="copy-code-btn" data-code="${encodeURIComponent(str)}" title="Copy code">Copy</button></div><pre><code class="hljs">${escaped}</code></pre></div>`;
  },
});

md.use(taskLists, { enabled: true, label: true, labelAfter: true });

function renderKaTeX(tex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(tex.trim(), {
      displayMode,
      throwOnError: false,
      output: 'htmlAndMathml',
    });
  } catch (e) {
    return `<span class="katex-error">${e}</span>`;
  }
}

export function parseMarkdown(content: string): { html: string; frontmatter: string | null; toc: TocHeading[] } {
  let frontmatter: string | null = null;
  let markdownBody = content;

  // Detect YAML frontmatter: ^---\n(.*?)\n---
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/);
  if (fmMatch) {
    frontmatter = fmMatch[1];
    markdownBody = content.substring(fmMatch[0].length);
  }

  // Pre-process display math blocks: $$ math $$
  const mathPlaceholders: { placeholder: string; rendered: string }[] = [];
  let mathCounter = 0;

  // Replace block math $$ ... $$ with placeholder
  markdownBody = markdownBody.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    const placeholder = `%%OMB_MATH_BLOCK_${mathCounter++}%%`;
    const rendered = `<div class="katex-display">${renderKaTeX(math, true)}</div>`;
    mathPlaceholders.push({ placeholder, rendered });
    return placeholder;
  });

  // Replace inline math $ ... $ with placeholder (avoiding double $)
  markdownBody = markdownBody.replace(/(^|[^\\])\$([^\$\n]+?)\$/g, (_, prefix, math) => {
    const placeholder = `%%OMB_MATH_INLINE_${mathCounter++}%%`;
    const rendered = renderKaTeX(math, false);
    mathPlaceholders.push({ placeholder, rendered });
    return `${prefix}${placeholder}`;
  });

  // Render tokens
  const env = {};
  const tokens = md.parse(markdownBody, env);
  const toc: TocHeading[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === 'heading_open') {
      const level = parseInt(token.tag.replace('h', ''), 10);
      const nextToken = tokens[i + 1];
      if (nextToken && nextToken.type === 'inline') {
        const text = nextToken.content;
        const slug = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-');
        
        token.attrSet('id', slug);
        toc.push({
          level,
          text,
          slug,
          line: token.map ? token.map[0] + 1 : undefined,
        });
      }
    }
  }

  let html = md.renderer.render(tokens, md.options, env);

  // Restore KaTeX placeholders
  for (const { placeholder, rendered } of mathPlaceholders) {
    html = html.replace(placeholder, rendered);
  }

  if (frontmatter) {
    const fmHtml = `<div class="frontmatter-badge"><div class="frontmatter-title">YAML Frontmatter</div><pre><code>${md.utils.escapeHtml(frontmatter)}</code></pre></div>`;
    html = fmHtml + html;
  }

  return { html, frontmatter, toc };
}

export function computeDocStats(text: string) {
  const clean = text.replace(/^---[\s\S]*?---/, '').trim();
  const words = clean ? (clean.match(/\b[\w'-]+\b/g) || []).length : 0;
  const characters = clean.length;
  const readingTimeMin = Math.ceil(words / 200);
  const lines = text.split('\n').length;
  return { words, characters, readingTimeMin, lines };
}
