import { currentVersion, defaultFiles, files } from './bundler'
import { STORAGE_PREFIX } from './constants'
import { urlStateError } from './url-error'

const LAST_STATE_KEY = `${STORAGE_PREFIX}last-state`

interface SerializedReplState {
  f?: Record<string, unknown>
  v?: string
}

function parseSerializedState(serialized: string): SerializedReplState | null {
  const state = JSON.parse(serialized) as SerializedReplState | null
  if (!state || typeof state !== 'object') {
    return null
  }
  return state
}

function loadStateFromHash() {
  let state: SerializedReplState | null = null
  const hash = location.hash.slice(1)

  if (hash) {
    try {
      state = parseSerializedState(atou(hash))
    } catch {
      urlStateError.value =
        'This shared Rolldown REPL link is invalid or incomplete. Open a fresh REPL to continue.'
      return
    }
  }
  urlStateError.value = null

  if (!state) {
    const serialized = localStorage.getItem(LAST_STATE_KEY)
    if (serialized) {
      try {
        state = parseSerializedState(serialized)
      } catch {
        localStorage.removeItem(LAST_STATE_KEY)
      }
    }
  }

  files.value = new Map(
    Object.entries(state?.f || {}).map(([k, v]) => [
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
    if (urlStateError.value) return
    const f = Object.fromEntries(files.value)
    const serialized = JSON.stringify({ f, v: currentVersion.value })
    history.replaceState(null, '', `#${utoa(serialized)}`)
    localStorage.setItem(LAST_STATE_KEY, serialized)
  })
}
