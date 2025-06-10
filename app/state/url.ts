import { defaultFiles, files } from './bundler'
import { STORAGE_PREFIX } from './constants'

const LAST_STATE_KEY = `${STORAGE_PREFIX}last-state`

export function initUrlState() {
  const serializedUrl = atou(location.hash!.slice(1))
  let state = serializedUrl && JSON.parse(serializedUrl)
  if (!state) {
    const serialized = localStorage.getItem(LAST_STATE_KEY)
    if (serialized) state = JSON.parse(serialized)
  }

  files.value = new Map(
    Object.entries((state?.f || {}) as SourceFileMap).map(([k, v]) => [
      k,
      useSourceFileFromJSON(v),
    ]),
  )
  if (files.value.size === 0) {
    files.value = new Map(defaultFiles())
  }

  // serialize state to url
  watchEffect(() => {
    const f = Object.fromEntries(files.value)
    const serialized = JSON.stringify({ f })
    location.hash = utoa(serialized)
    localStorage.setItem(LAST_STATE_KEY, serialized)
  })
}
