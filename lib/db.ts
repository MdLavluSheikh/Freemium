import { join } from 'path'
import Database from 'better-sqlite3'
import { WatchParams } from './watch-utils'

let db: Database.Database | null = null

function isCloudflare() {
  return typeof (globalThis as any).navigator !== 'undefined' && 
    ((globalThis as any).navigator.userAgent?.includes('Cloudflare') ||
     typeof caches !== 'undefined')
}

export function getDb(): Database.Database | null {
  if (isCloudflare()) return null
  if (db) return db
  try {
    const dbPath = join(process.cwd(), 'data', 'channels.db')
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    db.pragma('cache_size = -8000')
    db.pragma('synchronous = NORMAL')

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
  } catch {
    return null
  }
}

export function importAllChannels(): void { /* Data now comes from static JSON imports in lib/data.ts */ }

export { getChannelsPaginated, getChannelByUrl, getWatchByCode } from './data'
