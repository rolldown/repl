export default cachedEventHandler(
  async (evt) => {
    const path = getRouterParam(evt, 'path')
    const url = `https://cdn.jsdelivr.net/npm/@rolldown/browser${path}`
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Rolldown Browser Proxy',
        Accept: 'application/javascript, application/json, text/plain, */*',
      },
    })
    const contentType = response.headers.get('content-type')
    const isJS = contentType?.includes('javascript')

    let body: ReadableStream<Uint8Array> | null | string = response.body
    if (isJS) {
      body = await response.text()
      body = body
        .replaceAll(
          `from '@napi-rs/wasm-runtime'`,
          `from 'https://cdn.jsdelivr.net/npm/@napi-rs/wasm-runtime/+esm'`,
        )
        .replaceAll(
          `from '@napi-rs/wasm-runtime/fs'`,
          `from 'https://cdn.jsdelivr.net/npm/@napi-rs/wasm-runtime/fs/+esm'`,
        )
        .replaceAll(
          `import __wasmUrl from './rolldown-binding.wasm32-wasi.wasm?url'`,
          `const __wasmUrl = ${JSON.stringify(new URL('./rolldown-binding.wasm32-wasi.wasm', url).href)}`,
        )
        .replaceAll(
          `from "pathe"`,
          `from "https://cdn.jsdelivr.net/npm/pathe/+esm"`,
        )
        .replaceAll(
          `from "ansis"`,
          `from "https://cdn.jsdelivr.net/npm/ansis/+esm"`,
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
  },
  {
    maxAge: 60 * 60 * 24,
    shouldBypassCache(evt) {
      const path = getRouterParam(evt, 'path')
      if (
        path?.startsWith('@latest') ||
        path?.startsWith('@canary') ||
        path?.startsWith('@nightly')
      ) {
        return true
      }
      return import.meta.dev
    },
  },
)
