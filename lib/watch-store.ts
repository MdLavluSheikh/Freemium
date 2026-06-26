import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { WatchParams } from './watch-utils'

// Simple hash function that generates a short alphanumeric code
export function hashUrl(url: string): string {
  let hash = 0
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  // Convert to base36 (0-9a-z) and ensure positive
  return Math.abs(hash).toString(36)
}

const STORE_PATH = join(process.cwd(), 'data', 'watch-store.json')

// In-memory store
let store: Map<string, WatchParams> = new Map()
let loaded = false

function loadStore(): void {
  if (loaded) return
  loaded = true
  try {
    if (existsSync(STORE_PATH)) {
      const data = JSON.parse(readFileSync(STORE_PATH, 'utf-8'))
      store = new Map(Object.entries(data))
    }
  } catch {
    store = new Map()
  }
}

function saveStore(): void {
  try {
    const dir = dirname(STORE_PATH)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    const obj: Record<string, WatchParams> = {}
    store.forEach((v, k) => { obj[k] = v })
    writeFileSync(STORE_PATH, JSON.stringify(obj, null, 2))
  } catch {
    // Silently fail - in-memory store still works
  }
}

export function getWatchParams(code: string): WatchParams | null {
  loadStore()
  return store.get(code) || null
}

export function setWatchParams(code: string, params: WatchParams): void {
  loadStore()
  store.set(code, params)
  saveStore()
}

// Pre-populate store from all channel data files on server start
export function prePopulateStore(): void {
  loadStore()
  // Only pre-populate if store is empty
  if (store.size > 0) return

  const dataDir = join(process.cwd(), 'data')
  if (!existsSync(dataDir)) return

  const files = readdirSync(dataDir)
    .filter(f => f.startsWith('cat_') && f.endsWith('.json'))

  for (const file of files) {
    try {
      const channels = JSON.parse(readFileSync(join(dataDir, file), 'utf-8'))
      for (const ch of channels) {
        if (ch.url && ch.name) {
          const code = hashUrl(ch.url)
          if (!store.has(code)) {
            store.set(code, {
              url: ch.url,
              name: ch.name,
              logo: ch.logo || '',
              group: ch.group || '',
            })
          }
        }
      }
    } catch { /* skip */ }
  }
  saveStore()
}

// Initialize on server start
if (typeof window === 'undefined') {
  prePopulateStore()
}