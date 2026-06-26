import { existsSync, readFileSync, readdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import Database from 'better-sqlite3'
import { WatchParams } from './watch-utils'
import { startAutoSync } from './sync-scheduler'

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (db) return db
  const dbPath = join(process.cwd(), 'data', 'channels.db')
  db = new Database(dbPath)

  // Enable WAL mode for faster reads
  db.pragma('journal_mode = WAL')
  db.pragma('cache_size = -8000') // 8MB cache
  db.pragma('synchronous = NORMAL')

  // Create tables if not exist
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
    CREATE INDEX IF NOT EXISTS idx_channels_category ON channels(category);
    CREATE INDEX IF NOT EXISTS idx_channels_name ON channels(name);
  `)

  return db
}

export function importAllChannels(): void {
  const db = getDb()
  const dataDir = join(process.cwd(), 'data')

  // Check if already populated
  const count = db.prepare('SELECT COUNT(*) as c FROM channels').get() as { c: number }
  if (count.c > 0) return

  console.log('Populating database with channels...')

  const insert = db.prepare(`
    INSERT OR IGNORE INTO channels (name, url, logo, group_name, category)
    VALUES (?, ?, ?, ?, ?)
  `)

  const transaction = db.transaction(() => {
    // First try channels-all.json
    const allPath = join(dataDir, 'channels-all.json')
    if (existsSync(allPath)) {
      const channels = JSON.parse(readFileSync(allPath, 'utf-8'))
      for (const ch of channels) {
        insert.run(ch.name, ch.url, ch.logo || '', ch.group || '', 'All')
      }
      console.log(`  Imported ${channels.length} channels from channels-all.json`)
    }

    // Also import from individual category files
    const files = readdirSync(dataDir).filter(f => f.startsWith('cat_') && f.endsWith('.json'))
    for (const file of files) {
      try {
        const category = file.replace(/^cat_/, '').replace(/\.json$/, '')
        const channels = JSON.parse(readFileSync(join(dataDir, file), 'utf-8'))
        let count = 0
        for (const ch of channels) {
          const r = insert.run(ch.name, ch.url, ch.logo || '', ch.group || '', category)
          if (r.changes > 0) count++
        }
        if (count > 0) console.log(`  Imported ${count} from ${file}`)
      } catch { /* skip */ }
    }

    // Also import from individual playlist files (fifa.json, bangla.json, etc.)
    // These contain channels not in channels-all.json
    const playlistFiles = ['fifa.json', 'bangla.json', 'sports.json', 'channels.json']
    for (const file of playlistFiles) {
      try {
        const filePath = join(dataDir, file)
        if (!existsSync(filePath)) continue
        const category = file.replace(/\.json$/, '')
        const channels = JSON.parse(readFileSync(filePath, 'utf-8'))
        let count = 0
        for (const ch of channels) {
          const r = insert.run(ch.name, ch.url, ch.logo || '', ch.group || '', category)
          if (r.changes > 0) {
            count++
            if (count <= 3) console.log(`    NEW: ${ch.name} (from ${file})`)
          }
        }
        if (count > 0) console.log(`  +${count} channels from ${file}`)
      } catch { /* skip */ }
    }
  })

  transaction()
  const total = db.prepare('SELECT COUNT(*) as c FROM channels').get() as { c: number }
  console.log(`Database ready: ${total.c} channels`)
}

export interface ChannelRow {
  id: number
  name: string
  url: string
  logo: string
  group_name: string
  category: string
}

export function getChannelsPaginated(category: string, page: number, pageSize: number, search: string): { channels: ChannelRow[], total: number } {
  const db = getDb()
  const offset = (page - 1) * pageSize

  let where = ''
  const params: any[] = []

  if (search) {
    where = 'WHERE (name LIKE ? OR group_name LIKE ?)'
    params.push(`%${search}%`, `%${search}%`)
  }

  // Count
  const countSql = `SELECT COUNT(*) as c FROM channels ${where}`
  const total = (db.prepare(countSql).get(...params) as { c: number }).c

  // Fetch
  const sql = `SELECT * FROM channels ${where} ORDER BY name LIMIT ? OFFSET ?`
  const channels = db.prepare(sql).all(...params, pageSize, offset) as ChannelRow[]

  return { channels, total }
}

export function getWatchByUrl(url: string): ChannelRow | null {
  const db = getDb()
  return db.prepare('SELECT * FROM channels WHERE url = ?').get(url) as ChannelRow | null
}

export function getWatchByCode(code: string): WatchParams | null {
  const db = getDb()
  const row = db.prepare('SELECT name, url, logo, group_name FROM channels WHERE url = ?').get(code) as ChannelRow | null
  if (!row) return null
  return { url: row.url, name: row.name, logo: row.logo, group: row.group_name }
}

// Initialize on server load
if (typeof window === 'undefined') {
  importAllChannels()
  startAutoSync()
}