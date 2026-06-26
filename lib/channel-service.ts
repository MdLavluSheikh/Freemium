import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export interface Channel {
  name: string
  logo: string
  url: string
  group: string
  useProxy?: boolean
  type?: string
  referer?: string
  origin?: string
}

export interface CategoryGroup {
  name: string
  count: number
}

const FEATURED = ['FIFA', 'Bangla', 'Bangla News', 'India', 'Sports', 'News', 'Entertainment', 'Movies', 'Music', 'Kids']

let indexCache: { groups: CategoryGroup[] } | null = null
let allCache: Channel[] | null = null
let groupChannelsCache = new Map<string, Channel[]>()

function readJSON<T>(relative: string): T | null {
  try {
    const p = join(process.cwd(), 'data', relative)
    if (!existsSync(p)) return null
    return JSON.parse(readFileSync(p, 'utf-8'))
  } catch { return null }
}

export function getAllChannels(): Channel[] {
  if (allCache) return allCache
  const data = readJSON<Channel[]>('channels-all.json')
  if (data) { allCache = data; return data }
  return []
}

export function getCategoryChannels(category: string): Channel[] {
  if (groupChannelsCache.has(category)) return groupChannelsCache.get(category)!

  const key = category.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  const lower = category.toLowerCase()
  const data = readJSON<Channel[]>(`cat_${key}.json`)
    || readJSON<Channel[]>(`${lower}.json`)
    || []
  groupChannelsCache.set(category, data)
  return data
}

export function getFeaturedCategories(): string[] {
  return FEATURED
}

export function getIndex(): { groups: CategoryGroup[] } | null {
  if (indexCache) return indexCache
  const data = readJSON<{ groups: CategoryGroup[] }>('channels-index.json')
  if (data) { indexCache = data; return data }
  return null
}

export function clearCache() {
  indexCache = null; allCache = null; groupChannelsCache.clear()
}

if (typeof window === 'undefined') {
  // Preload on server
  getAllChannels()
}
