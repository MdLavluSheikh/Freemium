/**
 * fetch-channels.mjs
 * Fetches latest channel data from the IPTV playlist GitHub repo
 * and saves locally as JSON. Run via: node scripts/fetch-channels.mjs
 *
 * Auto-sync: the GitHub repo updates hourly via its own cron.
 * This script pulls the latest and can be called from a cron job
 * or system scheduler to keep local data in sync.
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')
const GITHUB_RAW = 'https://raw.githubusercontent.com/SHAJON-404/iptv-playlist/main/app/data'

const PLAYLISTS = {
  sports: `${GITHUB_RAW}/sports.json`,
  channels: `${GITHUB_RAW}/channels.json`,
  bangla: `${GITHUB_RAW}/bangla.json`,
  fifa: `${GITHUB_RAW}/fifa.json`,
}

async function fetchJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)
  return res.json()
}

async function main() {
  console.log('Fetching latest channels from IPTV playlist repo...\n')

  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })

  const results = await Promise.allSettled(
    Object.entries(PLAYLISTS).map(async ([name, url]) => {
      const data = await fetchJSON(url)
      const filePath = join(DATA_DIR, `${name}.json`)
      writeFileSync(filePath, JSON.stringify(data, null, 2))
      console.log(`  ✓ ${name}.json  (${data.length} channels)`)
      return { name, count: data.length }
    })
  )

  const total = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length

  console.log(`\nDone. ${total} playlists synced${failed > 0 ? `, ${failed} failed` : ''}.`)
  console.log(`Local data saved to: ${DATA_DIR}`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
