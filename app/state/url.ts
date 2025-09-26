import { currentVersion, defaultFiles, files } from './bundler'
import { STORAGE_PREFIX } from './constants'

const LAST_STATE_KEY = `${STORAGE_PREFIX}last-state`

function loadStateFromHash() {
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
  if (state?.v) {
    currentVersion.value = state.v
  }
}

export function initUrlState() {
  // Load initial state from hash or localStorage
  loadStateFromHash()

  // Listen for hash changes (browser back/forward)
  globalThis.addEventListener('hashchange', loadStateFromHash)

  // serialize state to url
  watchEffect(() => {
    const f = Object.fromEntries(files.value)
    const serialized = JSON.stringify({ f, v: currentVersion.value })
    location.hash = utoa(serialized)
    localStorage.setItem(LAST_STATE_KEY, serialized)
  })
}
