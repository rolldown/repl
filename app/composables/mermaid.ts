/**
 * Composable to use Mermaid for diagram rendering
 * Loads Mermaid from CDN to avoid npm trust issues
 */
export function useMermaid() {
  const mermaidLoaded = ref(false)
  const mermaidError = ref<string | null>(null)

  // Load Mermaid from CDN
  async function loadMermaid() {
    if (mermaidLoaded.value) return true

    try {
      // Check if already loaded
      if (globalThis.mermaid) {
        mermaidLoaded.value = true
        return true
      }

      // Load from CDN
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'
      script.type = 'module'

      await new Promise<void>((resolve, reject) => {
        script.addEventListener('load', () => resolve())
        script.addEventListener('error', () =>
          reject(new Error('Failed to load Mermaid from CDN')),
        )
        document.head.append(script)
      })

      // Initialize Mermaid
      if (globalThis.mermaid) {
        globalThis.mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'ui-monospace, monospace',
        })
        mermaidLoaded.value = true
        return true
      }

      throw new Error('Mermaid not available after loading')
    } catch (error) {
      mermaidError.value =
        error instanceof Error ? error.message : 'Failed to load Mermaid'
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
      const { svg } = await globalThis.mermaid.render(elementId, definition)
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

// Extend Window interface for TypeScript
declare global {
  interface Window {
    mermaid?: {
      initialize: (config: any) => void
      render: (
        id: string,
        definition: string,
      ) => Promise<{ svg: string; bindFunctions?: (element: Element) => void }>
    }
  }
}
