import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync, unlinkSync } from 'fs'
import { join } from 'path'
import Database from 'better-sqlite3'

const GITHUB_RAW = 'https://raw.githubusercontent.com/SHAJON-404/iptv-playlist/main/app/data'
const DATA_DIR = join(process.cwd(), 'data')

const PLAYLISTS: Record<string, string> = {
  sports: `${GITHUB_RAW}/sports.json`,
  channels: `${GITHUB_RAW}/channels.json`,
  bangla: `${GITHUB_RAW}/bangla.json`,
  fifa: `${GITHUB_RAW}/fifa.json`,
}

async function fetchJSON(url: string) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Freemium/1.0' },
    next: { revalidate: 0 },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export interface SyncResult {
  success: boolean
  totalChannels: number
  results: string[]
  error?: string
}

export async function syncChannels(): Promise<SyncResult> {
  const results: string[] = []
  let totalChannels = 0

  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })

  // Fetch all playlists from GitHub
  for (const [name, url] of Object.entries(PLAYLISTS)) {
    try {
      const data = await fetchJSON(url)
      const filePath = join(DATA_DIR, `${name}.json`)
      writeFileSync(filePath, JSON.stringify(data, null, 2))
      results.push(`✓ ${name}.json (${data.length} channels)`)
      totalChannels += data.length
    } catch (err: any) {
      results.push(`✗ ${name}.json - ${err.message}`)
    }
  }

  // Also fetch channels-all.json
  try {
    const allUrl = `${GITHUB_RAW}/channels-all.json`
    const allData = await fetchJSON(allUrl)
    writeFileSync(join(DATA_DIR, 'channels-all.json'), JSON.stringify(allData, null, 2))
    results.push(`✓ channels-all.json (${allData.length} channels)`)
  } catch { /* optional */ }

  // Also fetch channels-index.json
  try {
    const indexUrl = `${GITHUB_RAW}/channels-index.json`
    const indexData = await fetchJSON(indexUrl)
    writeFileSync(join(DATA_DIR, 'channels-index.json'), JSON.stringify(indexData, null, 2))
    results.push(`✓ channels-index.json`)
  } catch { /* optional */ }

  // Rebuild SQLite database
  try {
    const dbPath = join(DATA_DIR, 'channels.db')
    if (existsSync(dbPath)) {
      unlinkSync(dbPath)
    }
    // Also clean up WAL/SHM files
    if (existsSync(dbPath + '-wal')) unlinkSync(dbPath + '-wal')
    if (existsSync(dbPath + '-shm')) unlinkSync(dbPath + '-shm')

    const db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    db.pragma('cache_size = -8000')

    db.exec(`
      CREATE TABLE IF NOT EXISTS channels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT NOT NULL UNIQUE,
        logo TEXT DEFAULT '',
        group_name TEXT DEFAULT '',
        category TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_channels_group ON channels(group_name);
      CREATE INDEX IF NOT EXISTS idx_channels_name ON channels(name);
    `)

    const insert = db.prepare(`
      INSERT OR IGNORE INTO channels (name, url, logo, group_name, category)
      VALUES (?, ?, ?, ?, ?)
    `)

    const transaction = db.transaction(() => {
      const allPath = join(DATA_DIR, 'channels-all.json')
      if (existsSync(allPath)) {
        const channels = JSON.parse(readFileSync(allPath, 'utf-8'))
        for (const ch of channels) {
          insert.run(ch.name, ch.url, ch.logo || '', ch.group || '', 'All')
        }
      }

      const files = readdirSync(DATA_DIR).filter(f => f.startsWith('cat_') && f.endsWith('.json'))
      for (const file of files) {
        try {
          const category = file.replace(/^cat_/, '').replace(/\.json$/, '')
          const channels = JSON.parse(readFileSync(join(DATA_DIR, file), 'utf-8'))
          for (const ch of channels) {
            insert.run(ch.name, ch.url, ch.logo || '', ch.group || '', category)
          }
        } catch { /* skip */ }
      }

      // Also import from individual playlist files
      const playlistFiles = ['fifa.json', 'bangla.json', 'sports.json', 'channels.json']
      for (const file of playlistFiles) {
        try {
          const filePath = join(DATA_DIR, file)
          if (!existsSync(filePath)) continue
          const category = file.replace(/\.json$/, '')
          const channels = JSON.parse(readFileSync(filePath, 'utf-8'))
          for (const ch of channels) {
            insert.run(ch.name, ch.url, ch.logo || '', ch.group || '', category)
          }
        } catch { /* skip */ }
      }
    })

    transaction()

    const count = db.prepare('SELECT COUNT(*) as c FROM channels').get() as { c: number }
    db.close()

    totalChannels = count.c
    results.push(`✓ Database: ${count.c} channels`)
  } catch (err: any) {
    results.push(`✗ Database rebuild failed: ${err.message}`)
    return { success: false, totalChannels: 0, results, error: err.message }
  }

  return { success: true, totalChannels, results }
}
