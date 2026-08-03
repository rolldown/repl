// Bare specifiers that show up in `@rolldown/browser`'s published files. The
// browser cannot resolve them, so each one is pointed at a CDN ESM build.
//
// The emnapi stack must match the requested build. Since rolldown 1.2.1 the
// generated binding pairs `@emnapi/*` 2.0.0-alpha with `@napi-rs/wasm-runtime`
// 1.2.x, while older builds need the emnapi 1.x stack. Mixing the two majors
// crashes wasm init ("Cannot read properties of undefined (reading 'address')"),
// so the rewrites are pinned to the versions declared in the build's
// package.json instead of floating to the latest release. The 2.x builds load
// `@napi-rs/wasm-runtime` through /api/runtime, which also pins the emnapi
// copy that wasm-runtime pulls in internally (see that route for why the
// prebuilt CDN bundles cannot be used for this).
const CDN_MODULES = [
  '@napi-rs/wasm-runtime',
  '@napi-rs/wasm-runtime/fs',
  '@emnapi/core',
  '@emnapi/runtime',
  'ansis',
  'pathe',
]

// Last `@napi-rs/wasm-runtime` whose `@emnapi/*` peers stay on 1.x. Builds
// that predate the emnapi 2.x switch must not float past it.
const EMNAPI_1_WASM_RUNTIME = '1.1.6'

type RuntimeDeps = Record<string, string> | undefined

const getRuntimeDeps = defineCachedFunction(
  async (versionPrefix: string, isGit: boolean): Promise<RuntimeDeps> => {
    const url = isGit
      ? `https://esm.sh/pr/@rolldown/browser${versionPrefix}/package.json?raw`
      : `${CDN_URL}@rolldown/browser${versionPrefix}/package.json`
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Rolldown Browser Proxy' },
      })
      if (response.status !== 200) return undefined
      const pkg = await response.json()
      return pkg.dependencies
    } catch {
      return undefined
    }
  },
  {
    name: 'rolldown-browser-deps',
    maxAge: 60,
    getKey: (versionPrefix, isGit) =>
      `${isGit ? 'git' : 'npm'}:${versionPrefix}`,
  },
)

function cdnRewrites(deps: RuntimeDeps): Map<string, string> {
  const rewrites = new Map(CDN_MODULES.map((m) => [m, jsdelivrEsm(m)]))
  const emnapiRuntime = deps?.['@emnapi/runtime'] ?? ''
  if (emnapiRuntime && !/^[\^~]?[01]\./.test(emnapiRuntime)) {
    const emnapiCore = deps?.['@emnapi/core'] ?? emnapiRuntime
    const wasmRuntime = deps?.['@napi-rs/wasm-runtime'] ?? '^1.2.1'
    const pin = `?core=${emnapiCore}&runtime=${emnapiRuntime}`
    rewrites.set(
      '@napi-rs/wasm-runtime',
      `/api/runtime/@${wasmRuntime}/runtime.js${pin}`,
    )
    rewrites.set(
      '@napi-rs/wasm-runtime/fs',
      `/api/runtime/@${wasmRuntime}/dist/fs.js`,
    )
    rewrites.set('@emnapi/core', jsdelivrEsm(`@emnapi/core@${emnapiCore}`))
    rewrites.set(
      '@emnapi/runtime',
      jsdelivrEsm(`@emnapi/runtime@${emnapiRuntime}`),
    )
  } else {
    const spec = `@napi-rs/wasm-runtime@${EMNAPI_1_WASM_RUNTIME}`
    rewrites.set('@napi-rs/wasm-runtime', jsdelivrEsm(spec))
    rewrites.set('@napi-rs/wasm-runtime/fs', jsdelivrEsm(`${spec}/fs`))
  }
  return rewrites
}

export default eventHandler(async (evt) => {
  let path = getRouterParam(evt, 'path')!
  const isGit = path.startsWith('@git')
  if (isGit) {
    path = path.slice(4)
  }

  const url = isGit
    ? `https://esm.sh/pr/@rolldown/browser${path}?raw`
    : `${CDN_URL}@rolldown/browser${path}`

  const distIndex = path.indexOf('/dist/')
  const versionPrefix = distIndex === -1 ? undefined : path.slice(0, distIndex)

  const [response, runtimeDeps] = await Promise.all([
    fetch(url, {
      headers: {
        'User-Agent': 'Rolldown Browser Proxy',
        Accept: 'application/javascript, application/json, text/plain, */*',
      },
    }),
    versionPrefix ? getRuntimeDeps(versionPrefix, isGit) : undefined,
  ])

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

  const wasmUrl = JSON.stringify(
    new URL('rolldown-binding.wasm32-wasi.wasm', url).href,
  )
  const body = rewriteBareImports(
    await response.text(),
    cdnRewrites(runtimeDeps),
  )
    .replaceAll(
      `import __wasmUrl from './rolldown-binding.wasm32-wasi.wasm?url'`,
      `const __wasmUrl = ${wasmUrl}`,
    )
    .replaceAll(
      `const __wasmUrl = new URL('./rolldown-binding.wasm32-wasi.wasm', ${'import.meta'}.url).href`,
      `const __wasmUrl = ${wasmUrl}`,
    )

  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      'content-type': contentType!,
    },
  })
})
