export interface PackageJson {
  name?: string
  version?: string
  main?: string
  module?: string
  exports?: any
  dependencies?: Record<string, string>
}

export interface DependencyNode {
  name: string
  version: string
  dependencies: Record<string, string>
  resolvedDeps: Map<string, DependencyNode>
  files: Record<string, string>
}

export interface InstallProgress {
  status: 'idle' | 'resolving' | 'downloading' | 'installing' | 'done' | 'error'
  totalPackages: number
  downloadedPackages: number
  currentPackage: string
  error?: string
}

export interface NpmInstallResult {
  vfsFiles: Record<string, string>
}
