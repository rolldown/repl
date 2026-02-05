/**
 * Composable to use Mermaid for diagram rendering
 * Uses dynamic import to lazy load mermaid from npm package
 */
export function useMermaid() {
  const mermaidLoaded = ref(false)
  const mermaidError = ref<string | null>(null)
  let mermaidInstance: any = null

  // Initialize Mermaid with lazy loading
  async function loadMermaid() {
    if (mermaidLoaded.value) return true

    try {
      // Dynamically import mermaid only when needed
      const mermaidModule = await import('mermaid')
      mermaidInstance = mermaidModule.default

      // Initialize Mermaid with config
      mermaidInstance.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'ui-monospace, monospace',
      })
      mermaidLoaded.value = true
      return true
    } catch (error) {
      mermaidError.value =
        error instanceof Error ? error.message : 'Failed to initialize Mermaid'
      return false
    }
  }

  // Render a Mermaid diagram
  async function renderDiagram(
    definition: string,
    elementId: string,
  ): Promise<string | null> {
    if (!mermaidLoaded.value) {
      const loaded = await loadMermaid()
      if (!loaded) return null
    }

    try {
      const { svg } = await mermaidInstance.render(elementId, definition)
      return svg
    } catch (error) {
      mermaidError.value =
        error instanceof Error ? error.message : 'Failed to render diagram'
      return null
    }
  }

  return {
    mermaidLoaded,
    mermaidError,
    loadMermaid,
    renderDiagram,
  }
}
