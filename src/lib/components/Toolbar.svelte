<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { searchBarOpen } from '../stores/editorStore';
  import {
    Bold,
    Italic,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    Quote,
    Code,
    Terminal,
    List,
    ListOrdered,
    ListTodo,
    Link,
    Image,
    Table,
    Minus,
    Search,
    Sigma,
    GitFork,
    PieChart,
  } from 'lucide-svelte';

  const dispatch = createEventDispatcher<{
    format: { action: string; payload?: any };
  }>();

  function applyFormat(action: string, payload?: any) {
    dispatch('format', { action, payload });
  }
</script>

<div class="toolbar">
  <div class="tool-group">
    <button class="tool-btn" title="Bold (Ctrl+B)" on:click={() => applyFormat('bold')}>
      <Bold size={14} />
    </button>
    <button class="tool-btn" title="Italic (Ctrl+I)" on:click={() => applyFormat('italic')}>
      <Italic size={14} />
    </button>
    <button class="tool-btn" title="Strikethrough" on:click={() => applyFormat('strikethrough')}>
      <Strikethrough size={14} />
    </button>
  </div>

  <div class="tool-divider"></div>

  <div class="tool-group">
    <button class="tool-btn" title="Heading 1" on:click={() => applyFormat('h1')}>
      <Heading1 size={14} />
    </button>
    <button class="tool-btn" title="Heading 2" on:click={() => applyFormat('h2')}>
      <Heading2 size={14} />
    </button>
    <button class="tool-btn" title="Heading 3" on:click={() => applyFormat('h3')}>
      <Heading3 size={14} />
    </button>
  </div>

  <div class="tool-divider"></div>

  <div class="tool-group">
    <button class="tool-btn" title="Inline Code" on:click={() => applyFormat('inline-code')}>
      <Code size={14} />
    </button>
    <button class="tool-btn" title="Code Block" on:click={() => applyFormat('code-block')}>
      <Terminal size={14} />
    </button>
    <button class="tool-btn" title="Blockquote" on:click={() => applyFormat('quote')}>
      <Quote size={14} />
    </button>
  </div>

  <div class="tool-divider"></div>

  <div class="tool-group">
    <button class="tool-btn" title="Bullet List" on:click={() => applyFormat('bullet-list')}>
      <List size={14} />
    </button>
    <button class="tool-btn" title="Numbered List" on:click={() => applyFormat('ordered-list')}>
      <ListOrdered size={14} />
    </button>
    <button class="tool-btn" title="Task List" on:click={() => applyFormat('task-list')}>
      <ListTodo size={14} />
    </button>
  </div>

  <div class="tool-divider"></div>

  <div class="tool-group">
    <button class="tool-btn" title="Insert Link (Ctrl+K)" on:click={() => applyFormat('link')}>
      <Link size={14} />
    </button>
    <button class="tool-btn" title="Insert Image" on:click={() => applyFormat('image')}>
      <Image size={14} />
    </button>
    <button class="tool-btn" title="Insert Table" on:click={() => applyFormat('table')}>
      <Table size={14} />
    </button>
    <button class="tool-btn" title="Horizontal Divider" on:click={() => applyFormat('hr')}>
      <Minus size={14} />
    </button>
  </div>

  <div class="tool-divider"></div>

  <div class="tool-group">
    <button class="tool-btn" title="Insert Math Formula (KaTeX)" on:click={() => applyFormat('math-block')}>
      <Sigma size={14} />
      <span class="btn-text">Math</span>
    </button>
    <button class="tool-btn" title="Insert Flowchart Diagram (Mermaid)" on:click={() => applyFormat('diagram-flowchart')}>
      <GitFork size={14} />
      <span class="btn-text">Flowchart</span>
    </button>
    <button class="tool-btn" title="Insert Pie / Chart Diagram (Mermaid)" on:click={() => applyFormat('diagram-pie')}>
      <PieChart size={14} />
      <span class="btn-text">Chart</span>
    </button>
  </div>

  <div class="tool-spacer"></div>

  <div class="tool-group">
    <button
      class="tool-btn"
      class:active={$searchBarOpen}
      title="Find & Replace (Ctrl+F)"
      on:click={() => searchBarOpen.update((v) => !v)}
    >
      <Search size={14} />
      <span class="btn-text">Find</span>
    </button>
  </div>
</div>

<style>
  .toolbar {
    height: var(--toolbar-height);
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    padding: 0 10px;
    gap: 4px;
    user-select: none;
    overflow-x: auto;
  }

  .tool-group {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .tool-divider {
    width: 1px;
    height: 16px;
    background: var(--border-color);
    margin: 0 4px;
  }

  .tool-spacer {
    flex: 1;
  }

  .tool-btn {
    height: 26px;
    padding: 0 6px;
    border-radius: 4px;
    color: var(--text-secondary);
    font-size: 0.75rem;
    gap: 4px;
  }

  .tool-btn:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .tool-btn.active {
    background: var(--brand-glow);
    color: var(--brand-primary);
  }

  .btn-text {
    font-size: 0.72rem;
    font-weight: 500;
  }
</style>
