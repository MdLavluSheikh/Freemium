import { syncChannels } from './sync'

let timer: ReturnType<typeof setInterval> | null = null
let isRunning = false

const ONE_HOUR = 60 * 60 * 1000

export function startAutoSync() {
  if (timer) return // already running
  if (typeof window !== 'undefined') return // server only

  console.log('[Auto-Sync] Scheduler started — checking every hour')

  // Wait 30 seconds for server to stabilize, then first check
  setTimeout(runSync, 30_000)

  timer = setInterval(runSync, ONE_HOUR)
}

export function stopAutoSync() {
  if (timer) {
    clearInterval(timer)
    timer = null
    console.log('[Auto-Sync] Scheduler stopped')
  }
}

async function runSync() {
  if (isRunning) {
    console.log('[Auto-Sync] Previous sync still running, skipping...')
    return
  }

  isRunning = true
  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Dhaka' })
  console.log(`[Auto-Sync] ${now} — Checking for updates...`)

  try {
    const result = await syncChannels()
    if (result.success) {
      console.log(`[Auto-Sync] ✓ Synced ${result.totalChannels} channels (${result.results.length} files)`)
    } else {
      console.error(`[Auto-Sync] ✗ Sync failed: ${result.error}`)
    }
  } catch (err) {
    console.error('[Auto-Sync] ✗ Unexpected error:', err)
  } finally {
    isRunning = false
  }
}
