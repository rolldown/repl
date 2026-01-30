import type { DependencyNode } from './types'

export function hoistDependencies(
  rootDeps: Map<string, DependencyNode>,
): Record<string, string> {
  const vfsFiles: Record<string, string> = {}

  // Count version frequency per package name
  const versionCounts = new Map<string, Map<string, number>>()
  countVersions(rootDeps, versionCounts, new Set())

  // Most common version gets hoisted to top level
  const hoistedVersions = new Map<string, string>()
  for (const [name, counts] of versionCounts) {
    let maxCount = 0
    let hoisted = ''
    for (const [version, count] of counts) {
      if (count > maxCount) {
        maxCount = count
        hoisted = version
      }
    }
    hoistedVersions.set(name, hoisted)
  }

  writeToVfs(rootDeps, vfsFiles, hoistedVersions, '', new Set())
  return vfsFiles
}

function countVersions(
  deps: Map<string, DependencyNode>,
  counts: Map<string, Map<string, number>>,
  visited: Set<string>,
) {
  for (const [name, node] of deps) {
    const key = `${name}@${node.version}`
    if (visited.has(key)) continue
    visited.add(key)

    const nameMap = counts.get(name) || new Map()
    nameMap.set(node.version, (nameMap.get(node.version) || 0) + 1)
    counts.set(name, nameMap)

    countVersions(node.resolvedDeps, counts, visited)
  }
}

function writeToVfs(
  deps: Map<string, DependencyNode>,
  vfsFiles: Record<string, string>,
  hoistedVersions: Map<string, string>,
  parentPath: string,
  written: Set<string>,
) {
  for (const [name, node] of deps) {
    const isHoisted = hoistedVersions.get(name) === node.version
    const basePath =
      isHoisted && !parentPath
        ? `node_modules/${name}`
        : `${parentPath ? `${parentPath}/` : ''}node_modules/${name}`

    const writeKey = `${basePath}@${node.version}`
    if (written.has(writeKey)) continue
    written.add(writeKey)

    for (const [filePath, content] of Object.entries(node.files)) {
      vfsFiles[`${basePath}/${filePath}`] = content
    }

    writeToVfs(node.resolvedDeps, vfsFiles, hoistedVersions, basePath, written)
  }
}
