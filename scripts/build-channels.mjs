/**
 * build-channels.mjs
 * Fetches all IPTV playlists from GitHub, dedupes, categorizes,
 * and writes optimized JSON files for fast loading.
 *
 * Run: `npm run build-channels` (auto-runs on `npm install`)
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')
const GITHUB_RAW = 'https://raw.githubusercontent.com/SHAJON-404/iptv-playlist/main/app/data'

const SOURCES = [
  `${GITHUB_RAW}/sports.json`,
  `${GITHUB_RAW}/channels.json`,
  `${GITHUB_RAW}/bangla.json`,
  `${GITHUB_RAW}/fifa.json`,
]

async function fetchJSON(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'WatchFree-Build/1.0' } })
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`)
  return res.json()
}

function dedupe(channels) {
  const seen = new Set()
  return channels.filter((ch) => {
    if (!ch.url || !ch.name) return false
    const key = ch.url
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function categorize(channels) {
  const map = new Map()
  for (const ch of channels) {
    const g = ch.group || 'Uncategorized'
    if (!map.has(g)) map.set(g, [])
    map.get(g).push({ name: ch.name, logo: ch.logo || '', url: ch.url, group: g })
  }
  const groups = []
  for (const [name, chs] of map) {
    groups.push({ name, count: chs.length, channels: chs })
  }
  groups.sort((a, b) => b.count - a.count)
  return groups
}

async function main() {
  console.log('Building optimized channel index...\n')

  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })

  const allChannels = []
  for (const url of SOURCES) {
    try {
      const data = await fetchJSON(url)
      allChannels.push(...data)
      console.log(`  fetched ${url.split('/').pop()} (${data.length} channels)`)
    } catch (err) {
      console.error(`  failed ${url.split('/').pop()}: ${err.message}`)
    }
  }

  const deduped = dedupe(allChannels)
  console.log(`\n  raw: ${allChannels.length}, deduped: ${deduped.length}`)

  const groups = categorize(deduped)
  const categories = groups.map((g) => g.name)
  const total = deduped.length

  // Full index (categories only, no channel data for size)
  writeFileSync(
    join(DATA_DIR, 'channels-index.json'),
    JSON.stringify({ groups: groups.map(({ name, count }) => ({ name, count })), categories, total })
  )
  console.log(`  wrote channels-index.json (${groups.length} categories)`)

  // Flat all-channels array for fast "All" pagination
  writeFileSync(join(DATA_DIR, 'channels-all.json'), JSON.stringify(deduped))
  console.log(`  wrote channels-all.json (${deduped.length} channels)`)

  // Per-category files for fast drill-down
  for (const g of groups) {
    const key = g.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    writeFileSync(join(DATA_DIR, `cat_${key}.json`), JSON.stringify(g.channels))
  }
  console.log(`  wrote ${groups.length} category files`)

  console.log('\nDone.')
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
