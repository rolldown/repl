import type { ChunkNode, ModuleNode } from './bundler'

/**
 * Generates Mermaid flowchart definition from module graph
 */
export function generateModuleGraphMermaid(modules: ModuleNode[]): string {
  if (!modules || modules.length === 0) {
    return 'graph TD\n  A[No modules]'
  }

  const lines: string[] = ['graph TD']

  // Create a safe ID for Mermaid
  const safeId = (id: string) => {
    return id.replaceAll(/[^a-z0-9]/gi, '_')
  }

  // Add nodes
  for (const module of modules) {
    const nodeId = safeId(module.id)
    const label = module.id.replace(/^\//, '') // Remove leading slash
    if (module.isEntry) {
      lines.push(
        `  ${nodeId}[["${label} (entry)"]]`,
        `  style ${nodeId} fill:#10b981,stroke:#059669,color:#fff`,
      )
    } else {
      lines.push(`  ${nodeId}["${label}"]`)
    }
  }

  // Add edges for imports
  for (const module of modules) {
    const nodeId = safeId(module.id)

    // Regular imports
    for (const imp of module.imports) {
      const impId = safeId(imp)
      lines.push(`  ${nodeId} --> ${impId}`)
    }

    // Dynamic imports
    for (const imp of module.dynamicImports) {
      const impId = safeId(imp)
      lines.push(`  ${nodeId} -.-> ${impId}`)
    }
  }

  // If no edges exist, add a note
  if (modules.length === 1 && modules[0].imports.length === 0) {
    lines.push(
      `  note["Single module, no imports"]`,
      `  style note fill:#f3f4f6,stroke:#d1d5db,shape:notch-rect`,
    )
  }

  return lines.join('\n')
}

/**
 * Generates Mermaid flowchart definition from chunk graph
 */
export function generateChunkGraphMermaid(chunks: ChunkNode[]): string {
  if (!chunks || chunks.length === 0) {
    return 'graph TD\n  A[No chunks]'
  }

  const lines: string[] = ['graph TD']

  // Create a safe ID for Mermaid
  const safeId = (id: string) => {
    return id.replaceAll(/[^a-z0-9]/gi, '_')
  }

  // Add chunk nodes
  for (const chunk of chunks) {
    const nodeId = safeId(chunk.fileName)
    const moduleCount = chunk.modules.length
    let label = chunk.fileName

    if (chunk.isEntry) {
      label += ' (entry)'
    }
    if (chunk.isDynamicEntry) {
      label += ' (dynamic)'
    }
    label += `<br/>${moduleCount} module${moduleCount === 1 ? '' : 's'}`

    if (chunk.isEntry) {
      lines.push(
        `  ${nodeId}[["${label}"]]`,
        `  style ${nodeId} fill:#10b981,stroke:#059669,color:#fff`,
      )
    } else if (chunk.isDynamicEntry) {
      lines.push(
        `  ${nodeId}["${label}"]`,
        `  style ${nodeId} fill:#f59e0b,stroke:#d97706,color:#fff`,
      )
    } else {
      lines.push(`  ${nodeId}["${label}"]`)
    }
  }

  // Add edges for chunk imports
  for (const chunk of chunks) {
    const nodeId = safeId(chunk.fileName)

    // Regular imports
    for (const imp of chunk.imports) {
      const impId = safeId(imp)
      lines.push(`  ${nodeId} --> ${impId}`)
    }

    // Dynamic imports
    for (const imp of chunk.dynamicImports) {
      const impId = safeId(imp)
      lines.push(`  ${nodeId} -.-> ${impId}`)
    }
  }

  // If no edges exist, add a note
  const hasEdges = chunks.some(
    (c) => c.imports.length > 0 || c.dynamicImports.length > 0,
  )
  if (!hasEdges && chunks.length === 1) {
    lines.push(
      `  note["Single chunk, no imports"]`,
      `  style note fill:#f3f4f6,stroke:#d1d5db,shape:notch-rect`,
    )
  }

  return lines.join('\n')
}
