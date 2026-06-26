import { writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from 'fs'
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

// Only keep these 5 categories
const ALLOWED_GROUPS = [
  'fifa', 'world cup',
  'sports', 'sport',
  'bangla', 'bangladesh',
  'india', 'indian',
  'pakistan', 'pakistani',
]

function isAllowed(group) {
  const lower = (group || '').toLowerCase()
  return ALLOWED_GROUPS.some(kw => lower.includes(kw))
}

async function fetchJSON(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Freemium-Build/1.0' } })
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
  const filtered = deduped.filter(ch => isAllowed(ch.group))
  console.log(`\n  raw: ${allChannels.length}, deduped: ${deduped.length}, filtered: ${filtered.length}`)

  // Clean old files
  for (const f of readdirSync(DATA_DIR)) {
    if (f === 'channels.db' || f === 'channels.db-wal' || f === 'channels.db-shm' ||
        f.startsWith('cat_') || f === 'channels-index.json' || f === 'watch-store.json') {
      unlinkSync(join(DATA_DIR, f))
    }
  }

  // Write only channels-all.json
  writeFileSync(join(DATA_DIR, 'channels-all.json'), JSON.stringify(filtered))
  console.log(`  wrote channels-all.json (${filtered.length} channels)`)

  console.log('\nDone.')
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
