export const CDN_URL = 'https://cdn.jsdelivr.net/npm/'

export function jsdelivrEsm(spec: string): string {
  return `${CDN_URL}${spec}/+esm`
}

export function rewriteBareImports(
  code: string,
  rewrites: Map<string, string>,
): string {
  return code.replaceAll(
    /\bfrom\s*(['"])([^'"]+)\1/g,
    (match, quote: string, specifier: string) => {
      const target = rewrites.get(specifier)
      return target ? `from ${quote}${target}${quote}` : match
    },
  )
}
