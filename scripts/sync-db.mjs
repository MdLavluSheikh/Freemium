#!/usr/bin/env node

/**
 * sync-db.mjs
 * Fetches the latest channel data from GitHub and rebuilds the SQLite database.
 * Run via: node scripts/sync-db.mjs
 * 
 * Can be scheduled with:
 * - Windows Task Scheduler (every hour)
 * - Or called via: npm run sync-db
 */

const BASE_URL = process.env.SYNC_URL || 'http://localhost:3000'

async function main() {
  console.log('Syncing channel database...\n')
  
  try {
    const res = await fetch(`${BASE_URL}/api/sync`)
    const data = await res.json()
    
    if (data.success) {
      console.log(`✓ Database updated: ${data.totalChannels} channels`)
      if (data.results?.length) {
        data.results.forEach(r => console.log(`  ${r}`))
      }
      console.log(`\n${data.message}`)
    } else {
      console.error(`✗ Sync failed: ${data.error}`)
      process.exit(1)
    }
  } catch (err) {
    console.error(`✗ Connection error: ${err.message}`)
    console.error(`  Make sure the server is running at ${BASE_URL}`)
    process.exit(1)
  }
}

main()