// Bare specifiers that show up in `@rolldown/browser`'s published files. The
// browser cannot resolve them, so each one is pointed at its jsdelivr ESM build.
//
// Keep these unversioned. `@napi-rs/wasm-runtime`'s jsdelivr build resolves its
// own `@emnapi/*` peers to the latest 1.x, and pairing an emnapi 2.x runtime
// with a 1.x core breaks wasm instantiation.
const CDN_MODULES = new Set([
  '@napi-rs/wasm-runtime',
  '@napi-rs/wasm-runtime/fs',
  '@emnapi/core',
  '@emnapi/runtime',
  'ansis',
  'pathe',
])

function rewriteBareImports(code: string): string {
  return code.replaceAll(
    /\bfrom\s*(['"])([^'"]+)\1/g,
    (match, quote: string, specifier: string) =>
      CDN_MODULES.has(specifier)
        ? `from ${quote}https://cdn.jsdelivr.net/npm/${specifier}/+esm${quote}`
        : match,
  )
}

export default eventHandler(async (evt) => {
  let path = getRouterParam(evt, 'path')!
  const isGit = path.startsWith('@git')
  if (isGit) {
    path = path.slice(4)
  }

  const url = isGit
    ? `https://esm.sh/pr/@rolldown/browser${path}?raw`
    : `https://cdn.jsdelivr.net/npm/@rolldown/browser${path}`

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Rolldown Browser Proxy',
      Accept: 'application/javascript, application/json, text/plain, */*',
    },
  })

  if (response.status !== 200) {
    return new Response(`Failed to fetch ${url}: ${response.statusText}`, {
      status: response.status,
    })
  }

  const contentType = response.headers.get('content-type')

  const allowMine =
    contentType?.includes('application/javascript') ||
    contentType?.includes('text/javascript') ||
    contentType?.includes('application/node') ||
    contentType?.includes('application/json')
  if (!allowMine) {
    return new Response(`Unsupported content type: ${contentType}`, {
      status: 400,
    })
  }

  let body: ReadableStream<Uint8Array> | null | string = response.body
  if (allowMine) {
    body = rewriteBareImports(await response.text())
      .replaceAll(
        `import __wasmUrl from './rolldown-binding.wasm32-wasi.wasm?url'`,
        `const __wasmUrl = ${JSON.stringify(new URL('rolldown-binding.wasm32-wasi.wasm', url).href)}`,
      )
      .replaceAll(
        `const __wasmUrl = new URL('./rolldown-binding.wasm32-wasi.wasm', ${'import.meta'}.url).href`,
        `const __wasmUrl = ${JSON.stringify(new URL('rolldown-binding.wasm32-wasi.wasm', url).href)}`,
      )
  }
  const newResponse = new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      'content-type': contentType!,
    },
  })
  return newResponse
})
