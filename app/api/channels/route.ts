import { NextRequest, NextResponse } from 'next/server'
import { getChannelsPaginated } from '@/lib/data'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category') || 'All'
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = parseInt(searchParams.get('limit') || '50', 10)

  const { channels, total } = getChannelsPaginated(category, page, pageSize, search)

  return NextResponse.json({
    channels: channels.map(ch => ({
      name: ch.name,
      url: ch.url,
      logo: ch.logo,
      group: ch.group,
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  })
}
