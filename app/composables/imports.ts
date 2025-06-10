const JSDELIVR_PREFIX = 'https://cdn.jsdelivr.net/npm/'

export function getJsdelivrUrl(pkg: string, path: string = '/+esm'): string {
  return `${JSDELIVR_PREFIX}${pkg}${path || ''}`
}

export function importJsdelivr<T = any>(pkg: string, path: string): Promise<T> {
  return importUrl(getJsdelivrUrl(pkg, path))
}

export function importUrl<T = any>(url: string): Promise<T> {
  return import(/* @vite-ignore */ url)
}

export async function resolveDefault(p: Promise<any>) {
  return (await p).default
}
