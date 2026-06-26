import { NextRequest, NextResponse } from 'next/server'
import { getWatchParams, setWatchParams, hashUrl } from '@/lib/watch-store'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const url = searchParams.get('url')

  // If code is provided, return the watch params
  if (code) {
    const params = getWatchParams(code)
    if (!params) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(params)
  }

  // If url is provided, generate/return a code
  if (url) {
    const name = searchParams.get('name') || ''
    const logo = searchParams.get('logo') || ''
    const group = searchParams.get('group') || ''

    const code = hashUrl(url)
    const existing = getWatchParams(code)
    if (!existing) {
      setWatchParams(code, { url, name, logo, group })
    }
    return NextResponse.json({ code })
  }

  return NextResponse.json({ error: 'Missing code or url' }, { status: 400 })
}