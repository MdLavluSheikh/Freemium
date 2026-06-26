import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Category mapping: maps group names to standard categories
const CATEGORY_RULES: { category: string; keywords: string[]; priority: number }[] = [
  { category: 'FIFA', keywords: ['fifa', 'world cup'], priority: 0 },
  { category: 'Sports', keywords: ['sports', 'sport'], priority: 1 },
  { category: 'Bangla', keywords: ['bangla', 'bangladesh'], priority: 2 },
  { category: 'Bangla News', keywords: ['bangla news', 'bangla_news'], priority: 3 },
  { category: 'India', keywords: ['india', 'indian'], priority: 4 },
  { category: 'Pakistan', keywords: ['pakistan', 'pakistani'], priority: 5 },
  { category: 'News', keywords: ['news', '24h', 'live news'], priority: 6 },
  { category: 'Movies', keywords: ['movies', 'film', 'cinema'], priority: 7 },
  { category: 'Music', keywords: ['music', 'song'], priority: 8 },
  { category: 'Entertainment', keywords: ['entertainment'], priority: 9 },
  { category: 'Kids', keywords: ['kids', 'children', 'animation', 'cartoon'], priority: 10 },
  { category: 'Religious', keywords: ['religious', 'islamic', 'islam', 'religion'], priority: 11 },
  { category: 'Documentary', keywords: ['documentary', 'docu'], priority: 12 },
  { category: 'Education', keywords: ['education', 'educational', 'learning'], priority: 13 },
  { category: 'Culture', keywords: ['culture', 'cultural'], priority: 14 },
  { category: 'Business', keywords: ['business'], priority: 15 },
  { category: 'Comedy', keywords: ['comedy'], priority: 16 },
  { category: 'Lifestyle', keywords: ['lifestyle', 'cooking', 'travel', 'shop'], priority: 17 },
  { category: 'Classic', keywords: ['classic'], priority: 18 },
  { category: 'Series', keywords: ['series'], priority: 19 },
  { category: 'International', keywords: ['international'], priority: 20 },
  { category: 'General', keywords: ['general', 'other', 'public'], priority: 21 },
  { category: 'English', keywords: ['english'], priority: 22 },
  { category: 'Italy', keywords: ['italy', 'italian'], priority: 23 },
  { category: 'Greece', keywords: ['greece', 'greek'], priority: 24 },
  { category: 'Hungary', keywords: ['hungary', 'hungarian'], priority: 25 },
  { category: 'Germany', keywords: ['germany', 'german'], priority: 26 },
  { category: 'Russia', keywords: ['russia', 'russian'], priority: 27 },
  { category: 'Ukraine', keywords: ['ukraine'], priority: 28 },
  { category: 'Turkey', keywords: ['turkey', 'turkish'], priority: 29 },
  { category: 'France', keywords: ['france', 'french'], priority: 30 },
  { category: 'UK', keywords: ['uk', 'united kingdom'], priority: 31 },
  { category: 'Korea', keywords: ['korea', 'korean'], priority: 32 },
  { category: 'China', keywords: ['china', 'chinese'], priority: 33 },
  { category: 'Japan', keywords: ['japan', 'japanese'], priority: 34 },
  { category: 'Legislative', keywords: ['legislative', 'parliament'], priority: 35 },
]

const DEFAULT_CATEGORY = 'Others'
const DEFAULT_PRIORITY = 99

function getCategory(group: string): { name: string; priority: number } {
  const lower = group.toLowerCase()
  for (const rule of CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) {
        return { name: rule.category, priority: rule.priority }
      }
    }
  }
  return { name: DEFAULT_CATEGORY, priority: DEFAULT_PRIORITY }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const groupFilter = searchParams.get('group') || ''
  const limit = parseInt(searchParams.get('limit') || '500', 10)

  const db = getDb()
  let rows: any[]

  if (groupFilter) {
    // Filter by exact group (used on watch page sidebar to show only channels from that exact group)
    rows = db.prepare(`
      SELECT * FROM channels 
      WHERE group_name = ?
      ORDER BY name 
    `).all(groupFilter)
  } else if (search) {
    rows = db.prepare(`
      SELECT * FROM channels 
      WHERE name LIKE ? OR group_name LIKE ? 
      ORDER BY name 
      LIMIT ?
    `).all(`%${search}%`, `%${search}%`, limit)
  } else {
    rows = db.prepare('SELECT * FROM channels LIMIT ?').all(limit)
  }

  // Group channels by category
  const grouped: Record<string, any[]> = {}
  for (const ch of rows) {
    const { name } = getCategory(ch.group_name)
    if (!grouped[name]) grouped[name] = []
    grouped[name].push({
      name: ch.name,
      url: ch.url,
      logo: ch.logo,
      group: ch.group_name,
    })
  }

  // Sort channels alphabetically within each category
  for (const cat of Object.keys(grouped)) {
    grouped[cat].sort((a: any, b: any) => a.name.localeCompare(b.name))
  }

  // Build ordered result: categories sorted by priority
  const categoryOrder = CATEGORY_RULES.map(r => r.category).concat([DEFAULT_CATEGORY])
  const ordered: { category: string; channels: any[]; count: number }[] = []
  const seen = new Set<string>()

  for (const cat of categoryOrder) {
    if (grouped[cat] && !seen.has(cat)) {
      seen.add(cat)
      ordered.push({ category: cat, channels: grouped[cat], count: grouped[cat].length })
    }
  }

  // Add any remaining categories
  for (const cat of Object.keys(grouped)) {
    if (!seen.has(cat)) {
      ordered.push({ category: cat, channels: grouped[cat], count: grouped[cat].length })
    }
  }

  return NextResponse.json({ categories: ordered, total: rows.length })
}