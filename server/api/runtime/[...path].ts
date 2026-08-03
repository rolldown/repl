// Serves `@napi-rs/wasm-runtime` source files with their bare imports
// rewritten, so the `@emnapi/*` copy it loads internally can be pinned (via
// the `core` and `runtime` query params) to the exact versions the requested
// `@rolldown/browser` build pairs with. The prebuilt CDN bundles cannot do
// this: jsdelivr resolves the wasm-runtime `@emnapi/*` peers on its own (the
// `^1.7.1 || ^2.0.0-alpha.3` range flip-flops between majors across bundle
// rebuilds), and esm.sh injects a `process` shim whose `versions.node` makes
// emnapi take Node-only code paths in the browser.
const VERSION_RE = /^[\w.^~-]+$/

function pinned(name: string, version: unknown): string {
  return typeof version === 'string' && VERSION_RE.test(version)
    ? jsdelivrEsm(`${name}@${version}`)
    : jsdelivrEsm(name)
}

export default eventHandler(async (evt) => {
  const path = getRouterParam(evt, 'path')!
  if (path.includes('..')) {
    return new Response('Invalid path', { status: 400 })
  }

  const response = await fetch(`${CDN_URL}@napi-rs/wasm-runtime${path}`, {
    headers: { 'User-Agent': 'Rolldown Browser Proxy' },
  })
  if (response.status !== 200) {
    return new Response(`Failed to fetch ${path}: ${response.statusText}`, {
      status: response.status,
    })
  }

  const query = getQuery(evt)
  const rewrites = new Map([
    ['@tybys/wasm-util', jsdelivrEsm('@tybys/wasm-util')],
    ['@emnapi/core', pinned('@emnapi/core', query.core)],
    ['@emnapi/runtime', pinned('@emnapi/runtime', query.runtime)],
  ])

  return new Response(rewriteBareImports(await response.text(), rewrites), {
    headers: { 'content-type': 'text/javascript; charset=utf-8' },
  })
})
