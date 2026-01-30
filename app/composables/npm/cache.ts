const DB_NAME = 'rolldown-repl'
const STORE_NAME = 'npm-cache'

const memoryCache = new Map<string, Record<string, string>>()
let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME)
    }
    request.addEventListener('success', () => resolve(request.result))
    request.addEventListener('error', () => reject(request.error))
  })
  return dbPromise
}

export async function getCachedPackage(
  key: string,
): Promise<Record<string, string> | null> {
  const mem = memoryCache.get(key)
  if (mem) return mem

  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(key)
      req.addEventListener('success', () => {
        const result = req.result ?? null
        if (result) memoryCache.set(key, result)
        resolve(result)
      })
      req.addEventListener('error', () => resolve(null))
    })
  } catch {
    return null
  }
}

export async function setCachedPackage(
  key: string,
  files: Record<string, string>,
): Promise<void> {
  memoryCache.set(key, files)

  try {
    const db = await openDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(files, key)
  } catch {
    // Memory cache still works
  }
}
