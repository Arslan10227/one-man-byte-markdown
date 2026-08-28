<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';
  import { parseMarkdown } from '../markdown/parser';
  import { settings, activeFile, editorActions } from '../stores/editorStore';
  import { themeStore } from '../stores/themeStore';
  import { toastStore } from '../stores/toastStore';
  import mermaid from 'mermaid';
  import DiagramModal from './DiagramModal.svelte';

  export let content: string = '';

  const dispatch = createEventDispatcher<{
    scroll: { percentage: number };
  }>();

  let previewContainer: HTMLDivElement;
  let parsedHtml = '';
  let isInternalScroll = false;
  let renderCounter = 0;

  // Diagram Viewer Modal state
  let isDiagramModalOpen = false;
  let activeDiagramSvg = '';
  let activeDiagramTitle = 'Diagram Viewer';

  // Initialize mermaid configuration
  $: {
    const isDark = $themeStore === 'dark';
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'var(--font-sans)',
      themeVariables: isDark
        ? {
            darkMode: true,
            background: '#111827',
            primaryColor: '#3b82f6',
            primaryTextColor: '#f1f5f9',
            lineColor: '#60a5fa',
            secondaryColor: '#1e293b',
            tertiaryColor: '#162032',
          }
        : {
            darkMode: false,
            primaryColor: '#2563eb',
            lineColor: '#3b82f6',
          },
    });
  }

  $: {
    const { html } = parseMarkdown(content);
    parsedHtml = html;
    tick().then(() => {
      renderMermaidDiagrams();
    });
  }

  // Also re-render mermaid when theme toggles
  $: if ($themeStore) {
    tick().then(() => {
      renderMermaidDiagrams();
    });
  }

  async function renderMermaidDiagrams() {
    if (!previewContainer) return;
    const blocks = previewContainer.querySelectorAll<HTMLElement>('.mermaid-block');
    for (let i = 0; i < blocks.length; i++) {
      const el = blocks[i];
      const encoded = el.getAttribute('data-mermaid');
      if (!encoded) continue;
      const code = decodeURIComponent(encoded);
      const uniqueId = `mermaid-svg-${Date.now()}-${renderCounter++}-${i}`;
      try {
        const { svg } = await mermaid.render(uniqueId, code);
        el.innerHTML = svg;
      } catch (err) {
        el.innerHTML = `<div class="mermaid-error" style="color: var(--accent-danger); font-size: 0.8rem; padding: 8px;">Diagram Syntax Error: ${err}</div>`;
      }
    }
  }

  function openDiagramModalFromElement(wrapper: HTMLElement) {
    const svgEl = wrapper.querySelector('svg');
    if (svgEl) {
      activeDiagramSvg = svgEl.outerHTML;
      isDiagramModalOpen = true;
    }
  }

  function handleContainerClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Handle expand diagram button click
    const expandBtn = target.closest('.expand-diagram-btn');
    if (expandBtn) {
      const wrapper = expandBtn.closest('.mermaid-diagram-wrapper') as HTMLElement;
      if (wrapper) {
        openDiagramModalFromElement(wrapper);
        return;
      }
    }

    // Handle direct click on mermaid diagram block
    const mermaidBlock = target.closest('.mermaid-block') as HTMLElement;
    if (mermaidBlock) {
      const wrapper = mermaidBlock.closest('.mermaid-diagram-wrapper') as HTMLElement;
      if (wrapper) {
        openDiagramModalFromElement(wrapper);
        return;
      }
    }

    // Handle code block copy button
    if (target && target.classList.contains('copy-code-btn')) {
      const codeEncoded = target.getAttribute('data-code');
      if (codeEncoded) {
        const code = decodeURIComponent(codeEncoded);
        navigator.clipboard.writeText(code).then(() => {
          target.textContent = 'Copied!';
          setTimeout(() => {
            target.textContent = 'Copy';
          }, 2000);
          toastStore.success('Code copied to clipboard!');
        });
      }
    }

    // Handle interactive task list checkboxes
    if (target && target.classList.contains('task-list-item-checkbox')) {
      const checkbox = target as HTMLInputElement;
      const isChecked = checkbox.checked;
      
      const allCheckboxes = Array.from(
        previewContainer.querySelectorAll('.task-list-item-checkbox')
      );
      const index = allCheckboxes.indexOf(checkbox);

      if (index !== -1 && $activeFile) {
        let taskCount = 0;
        const updatedContent = $activeFile.content.replace(
          /([-*+]\s+\[)([ xX])(\])/g,
          (match, prefix, checkChar, suffix) => {
            if (taskCount === index) {
              taskCount++;
              return `${prefix}${isChecked ? 'x' : ' '}${suffix}`;
            }
            taskCount++;
            return match;
          }
        );
        editorActions.updateContent($activeFile.id, updatedContent);
      }
    }
  }

  function handleScroll() {
    if (!previewContainer || isInternalScroll) return;
    const maxScroll = previewContainer.scrollHeight - previewContainer.clientHeight;
    const percentage = maxScroll > 0 ? previewContainer.scrollTop / maxScroll : 0;
    dispatch('scroll', { percentage });
  }

  export function scrollToPercentage(percentage: number) {
    if (!previewContainer) return;
    isInternalScroll = true;
    const maxScroll = previewContainer.scrollHeight - previewContainer.clientHeight;
    previewContainer.scrollTop = percentage * maxScroll;
    setTimeout(() => {
      isInternalScroll = false;
    }, 50);
  }

  export function scrollToSlug(slug: string) {
    if (!previewContainer) return;
    const heading = previewContainer.querySelector(`#${slug}`);
    if (heading) {
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="preview-container"
  bind:this={previewContainer}
  on:scroll={handleScroll}
  on:click={handleContainerClick}
  style="font-size: {$settings.previewFontSize}px; font-family: {$settings.previewFontFamily};"
>
  <div class="markdown-body">
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html parsedHtml}
  </div>
</div>

<DiagramModal
  bind:isOpen={isDiagramModalOpen}
  svgContent={activeDiagramSvg}
  title={activeDiagramTitle}
/>

<style>
  .preview-container {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 24px 36px;
    background: var(--bg-surface);
    color: var(--text-primary);
  }

  .markdown-body {
    max-width: 860px;
    margin: 0 auto;
  }
</style>
