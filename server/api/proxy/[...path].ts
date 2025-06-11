export default eventHandler(async (evt) => {
  const path = getRouterParam(evt, 'path')
  const url = `https://cdn.jsdelivr.net/npm/@rolldown/browser${path}`
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
})
