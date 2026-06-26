import { WatchParams } from './watch-utils'
import { getAllChannels } from './data'

export function hashUrl(url: string): string {
  let hash = 0
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

let store: Map<string, WatchParams> | null = null

function getStore(): Map<string, WatchParams> {
  if (store) return store
  store = new Map()
  const channels = getAllChannels()
  for (const ch of channels) {
    if (ch.url && ch.name) {
      const code = hashUrl(ch.url)
      if (!store.has(code)) {
        store.set(code, {
          url: ch.url,
          name: ch.name,
          logo: ch.logo || '',
          group: ch.group || '',
          useProxy: ch.useProxy,
        })
      }
    }
  }
  return store
}

export function getWatchParams(code: string): WatchParams | null {
  return getStore().get(code) || null
}

export function setWatchParams(code: string, params: WatchParams): void {
  getStore().set(code, params)
}
