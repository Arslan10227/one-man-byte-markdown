<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { EditorView, keymap, lineNumbers as cmLineNumbers, highlightActiveLine } from '@codemirror/view';
  import { EditorState, Compartment } from '@codemirror/state';
  import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
  import { markdown } from '@codemirror/lang-markdown';
  import { search, searchKeymap, openSearchPanel } from '@codemirror/search';
  import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
  import { settings, editorActions } from '../stores/editorStore';
  import { themeStore } from '../stores/themeStore';

  export let content: string = '';
  export let fileId: string = '';

  const dispatch = createEventDispatcher<{
    change: string;
    cursor: { line: number; col: number };
    scroll: { percentage: number; scrollTop: number; scrollHeight: number };
  }>();

  let editorContainer: HTMLDivElement;
  let view: EditorView | null = null;

  // Dynamic compartments for live settings update
  const lineNumbersCompartment = new Compartment();
  const wordWrapCompartment = new Compartment();
  const themeCompartment = new Compartment();
  const highlightActiveLineCompartment = new Compartment();

  function createCustomTheme(isDark: boolean, fontSize: number, fontFamily: string) {
    return EditorView.theme(
      {
        '&': {
          fontSize: `${fontSize}px`,
          fontFamily: fontFamily,
          height: '100%',
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
        },
        '.cm-content': {
          padding: '16px 20px',
          caretColor: 'var(--brand-primary)',
          fontFamily: 'inherit',
        },
        '.cm-line': {
          padding: '0 4px',
          lineHeight: '1.6',
        },
        '.cm-gutters': {
          backgroundColor: 'var(--bg-app)',
          color: 'var(--text-muted)',
          borderRight: '1px solid var(--border-color)',
          fontSize: '0.85em',
        },
        '.cm-lineNumbers .cm-gutterElement': {
          padding: '0 8px 0 12px',
        },
        '.cm-activeLine': {
          backgroundColor: 'var(--bg-hover)',
        },
        '.cm-activeLineGutter': {
          backgroundColor: 'var(--bg-hover)',
          color: 'var(--text-primary)',
        },
        '.cm-selectionBackground, ::selection': {
          backgroundColor: 'var(--brand-glow) !important',
        },
        '&.cm-focused .cm-cursor': {
          borderLeftColor: 'var(--brand-primary)',
          borderLeftWidth: '2px',
        },
        '.cm-panels': {
          backgroundColor: 'var(--bg-surface-elevated)',
          color: 'var(--text-primary)',
          borderBottom: '1px solid var(--border-color)',
        },
      },
      { dark: isDark }
    );
  }

  onMount(() => {
    const isDark = $themeStore === 'dark';
    const currentSettings = $settings;

    const startState = EditorState.create({
      doc: content,
      extensions: [
        lineNumbersCompartment.of(currentSettings.lineNumbers ? cmLineNumbers() : []),
        wordWrapCompartment.of(currentSettings.wordWrap ? EditorView.lineWrapping : []),
        highlightActiveLineCompartment.of(currentSettings.highlightActiveLine ? highlightActiveLine() : []),
        themeCompartment.of(createCustomTheme(isDark, currentSettings.editorFontSize, currentSettings.fontFamily)),
        history(),
        markdown(),
        search({ top: true }),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newDoc = update.state.doc.toString();
            dispatch('change', newDoc);
            editorActions.updateContent(fileId, newDoc);
          }
          if (update.selectionSet) {
            const head = update.state.selection.main.head;
            const line = update.state.doc.lineAt(head);
            dispatch('cursor', {
              line: line.number,
              col: head - line.from + 1,
            });
          }
        }),
        EditorView.domEventHandlers({
          scroll(event, view) {
            const dom = view.scrollDOM;
            const maxScroll = dom.scrollHeight - dom.clientHeight;
            const percentage = maxScroll > 0 ? dom.scrollTop / maxScroll : 0;
            dispatch('scroll', {
              percentage,
              scrollTop: dom.scrollTop,
              scrollHeight: dom.scrollHeight,
            });
          },
        }),
      ],
    });

    view = new EditorView({
      state: startState,
      parent: editorContainer,
    });
  });

  // Watch for external content update
  $: if (view && content !== view.state.doc.toString()) {
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: content },
    });
  }

  // React to theme and settings changes
  $: if (view && ($themeStore || $settings)) {
    const isDark = $themeStore === 'dark';
    view.dispatch({
      effects: [
        themeCompartment.reconfigure(createCustomTheme(isDark, $settings.editorFontSize, $settings.fontFamily)),
        lineNumbersCompartment.reconfigure($settings.lineNumbers ? cmLineNumbers() : []),
        wordWrapCompartment.reconfigure($settings.wordWrap ? EditorView.lineWrapping : []),
        highlightActiveLineCompartment.reconfigure($settings.highlightActiveLine ? highlightActiveLine() : []),
      ],
    });
  }

  // Export formatting execution function
  export function formatSelection(action: string, payload?: any) {
    if (!view) return;
    const { state } = view;
    const { from, to } = state.selection.main;
    const selected = state.sliceDoc(from, to);

    let insertText = '';
    let selectionOffsetStart = 0;
    let selectionOffsetEnd = 0;

    switch (action) {
      case 'bold':
        insertText = `**${selected || 'bold text'}**`;
        selectionOffsetStart = from + 2;
        selectionOffsetEnd = selectionOffsetStart + (selected ? selected.length : 9);
        break;
      case 'italic':
        insertText = `*${selected || 'italic text'}*`;
        selectionOffsetStart = from + 1;
        selectionOffsetEnd = selectionOffsetStart + (selected ? selected.length : 11);
        break;
      case 'strikethrough':
        insertText = `~~${selected || 'strikethrough text'}~~`;
        selectionOffsetStart = from + 2;
        selectionOffsetEnd = selectionOffsetStart + (selected ? selected.length : 18);
        break;
      case 'h1':
        insertText = `# ${selected || 'Heading 1'}\n`;
        break;
      case 'h2':
        insertText = `## ${selected || 'Heading 2'}\n`;
        break;
      case 'h3':
        insertText = `### ${selected || 'Heading 3'}\n`;
        break;
      case 'inline-code':
        insertText = `\`${selected || 'code'}\``;
        selectionOffsetStart = from + 1;
        selectionOffsetEnd = selectionOffsetStart + (selected ? selected.length : 4);
        break;
      case 'code-block':
        insertText = `\`\`\`${payload || 'javascript'}\n${selected || '// code here'}\n\`\`\`\n`;
        break;
      case 'quote':
        insertText = `> ${selected || 'Blockquote'}\n`;
        break;
      case 'bullet-list':
        insertText = `- ${selected || 'List item'}\n`;
        break;
      case 'ordered-list':
        insertText = `1. ${selected || 'First item'}\n`;
        break;
      case 'task-list':
        insertText = `- [ ] ${selected || 'Task item'}\n`;
        break;
      case 'link':
        insertText = `[${selected || 'link text'}](https://example.com)`;
        break;
      case 'image':
        insertText = `![${selected || 'Alt text'}](https://example.com/image.png)`;
        break;
      case 'table':
        insertText = `\n| Column 1 | Column 2 | Column 3 |\n| :--- | :--- | :--- |\n| Row 1 | Data | Data |\n| Row 2 | Data | Data |\n\n`;
        break;
      case 'math-block':
        insertText = `\n$$\n\\int_{a}^{b} f(x)\\,dx = F(b) - F(a)\n$$\n\n`;
        break;
      case 'math-inline':
        insertText = `$${selected || 'E = mc^2'}$`;
        selectionOffsetStart = from + 1;
        selectionOffsetEnd = selectionOffsetStart + (selected ? selected.length : 9);
        break;
      case 'diagram-flowchart':
        insertText = `\n\`\`\`mermaid\ngraph TD\n    A[Start] --> B{Process}\n    B -->|Success| C[Output]\n    B -->|Retry| A\n\`\`\`\n\n`;
        break;
      case 'diagram-sequence':
        insertText = `\n\`\`\`mermaid\nsequenceDiagram\n    autonumber\n    Client->>Server: Request Data\n    Server-->>Database: Query Records\n    Database-->>Server: Return Data\n    Server-->>Client: 200 OK (JSON)\n\`\`\`\n\n`;
        break;
      case 'diagram-pie':
        insertText = `\n\`\`\`mermaid\npie title Project Time Allocation\n    "Coding" : 50\n    "Testing" : 25\n    "Documentation" : 15\n    "Review" : 10\n\`\`\`\n\n`;
        break;
      case 'hr':
        insertText = `\n---\n\n`;
        break;
      default:
        return;
    }

    view.dispatch({
      changes: { from, to, insert: insertText },
      selection: selectionOffsetStart
        ? { anchor: selectionOffsetStart, head: selectionOffsetEnd }
        : { anchor: from + insertText.length },
    });
    view.focus();
  }

  export function scrollToLine(lineNum: number) {
    if (!view) return;
    const doc = view.state.doc;
    if (lineNum <= 0 || lineNum > doc.lines) return;
    const line = doc.line(lineNum);
    view.dispatch({
      selection: { anchor: line.from },
      scrollIntoView: true,
    });
    view.focus();
  }

  export function openSearch() {
    if (view) {
      openSearchPanel(view);
    }
  }

  export function scrollToPercentage(percentage: number) {
    if (!view) return;
    const dom = view.scrollDOM;
    const maxScroll = dom.scrollHeight - dom.clientHeight;
    dom.scrollTop = percentage * maxScroll;
  }

  onDestroy(() => {
    if (view) {
      view.destroy();
    }
  });
</script>

<div class="editor-pane-container" bind:this={editorContainer}></div>

<style>
  .editor-pane-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: var(--bg-app);
  }
</style>
