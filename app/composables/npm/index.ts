import { installProgress } from '~/state/npm'
import { downloadAndExtract } from './download'
import { hoistDependencies } from './hoist'
import { resolveVersion } from './resolve'
import type { DependencyNode, NpmInstallResult } from './types'

const MAX_DEPTH = 10
const MAX_CONCURRENT = 6

let lastDepsHash = ''
let lastResult: NpmInstallResult | null = null

export async function installDependencies(
  deps: Record<string, string>,
): Promise<NpmInstallResult> {
  const depsHash = JSON.stringify(deps)
  if (depsHash === lastDepsHash && lastResult) return lastResult

  installProgress.value = {
    status: 'resolving',
    totalPackages: Object.keys(deps).length,
    downloadedPackages: 0,
    currentPackage: '',
  }

  try {
    const rootDeps = new Map<string, DependencyNode>()
    const visited = new Set<string>()

    const entries = Object.entries(deps)
    await processInBatches(entries, MAX_CONCURRENT, async ([name, spec]) => {
      installProgress.value = {
        ...installProgress.value,
        currentPackage: name,
      }
      const node = await resolveDependency(name, spec, visited, 0)
      if (node) rootDeps.set(name, node)
    })

    installProgress.value = { ...installProgress.value, status: 'installing' }
    const vfsFiles = hoistDependencies(rootDeps)

    const result: NpmInstallResult = { vfsFiles }
    lastDepsHash = depsHash
    lastResult = result

    installProgress.value = {
      status: 'done',
      totalPackages: installProgress.value.totalPackages,
      downloadedPackages: installProgress.value.downloadedPackages,
      currentPackage: '',
    }

    return result
  } catch (error: any) {
    installProgress.value = {
      status: 'error',
      totalPackages: 0,
      downloadedPackages: 0,
      currentPackage: '',
      error: error.message || String(error),
    }
    throw error
  }
}

async function resolveDependency(
  name: string,
  specifier: string,
  visited: Set<string>,
  depth: number,
): Promise<DependencyNode | null> {
  if (depth > MAX_DEPTH) return null

  try {
    const version = await resolveVersion(name, specifier)
    const key = `${name}@${version}`

    if (visited.has(key)) return null
    visited.add(key)

    installProgress.value = {
      ...installProgress.value,
      status: 'downloading',
      currentPackage: name,
    }

    const { files, packageJson } = await downloadAndExtract(name, version)
    installProgress.value = {
      ...installProgress.value,
      downloadedPackages: installProgress.value.downloadedPackages + 1,
      totalPackages: Math.max(
        installProgress.value.totalPackages,
        visited.size,
      ),
    }

    const node: DependencyNode = {
      name,
      version,
      dependencies: packageJson.dependencies || {},
      resolvedDeps: new Map(),
      files,
    }

    const subDeps = Object.entries(node.dependencies)
    if (subDeps.length > 0) {
      await processInBatches(
        subDeps,
        MAX_CONCURRENT,
        async ([depName, depSpec]) => {
          const child = await resolveDependency(
            depName,
            depSpec as string,
            visited,
            depth + 1,
          )
          if (child) node.resolvedDeps.set(depName, child)
        },
      )
    }

    return node
  } catch (error) {
    console.warn(`Failed to resolve ${name}@${specifier}:`, error)
    return null
  }
}

async function processInBatches<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let index = 0
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (index < items.length) {
        const i = index++
        await fn(items[i]!)
      }
    },
  )
  await Promise.all(workers)
}
