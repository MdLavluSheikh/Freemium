import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function getRefererForUrl(url: string): string | undefined {
  if (url.includes('gpcdn.net')) return 'https://www.goplay.com.bd/'
  if (url.includes('aynaott.com') || url.includes('trs1.aynaott.com')) return 'https://www.aynaott.com/'
  if (url.includes('matchtv.ru')) return 'https://matchtv.ru/'
  return undefined
}

function isUrl(str: string): boolean {
  return /^https?:\/\//i.test(str)
}

function rewriteManifest(body: string, baseUrl: string, referer?: string, origin?: string): string {
  const lines = body.split('\n')
  return lines.map(line => {
    const trimmed = line.trim()
    if (trimmed.startsWith('#EXT-X-KEY:')) {
      const rewritten = trimmed.replace(/URI="([^"]+)"/g, (_match, uri: string) => {
        const resolved = isUrl(uri) ? uri : new URL(uri, baseUrl).href
        const p = new URLSearchParams()
        p.set('url', resolved)
        const ref = referer || getRefererForUrl(resolved)
        if (ref) p.set('referer', ref)
        if (origin) p.set('origin', origin)
        else if (ref) p.set('origin', new URL(ref).origin)
        return `URI="/api/proxy/stream.m3u8?${p.toString()}"`
      })
      return rewritten
    }
    if (trimmed.startsWith('#EXT-X-MAP:')) {
      const rewritten = trimmed.replace(/URI="([^"]+)"/g, (_match, uri: string) => {
        const resolved = isUrl(uri) ? uri : new URL(uri, baseUrl).href
        const p = new URLSearchParams()
        p.set('url', resolved)
        const ref = referer || getRefererForUrl(resolved)
        if (ref) p.set('referer', ref)
        if (origin) p.set('origin', origin)
        else if (ref) p.set('origin', new URL(ref).origin)
        return `URI="/api/proxy/stream.m3u8?${p.toString()}"`
      })
      return rewritten
    }
    if (!trimmed || trimmed.startsWith('#')) return line
    let resolved: string
    if (isUrl(trimmed)) {
      resolved = trimmed
    } else {
      try {
        resolved = new URL(trimmed, baseUrl).href
      } catch {
        return line
      }
    }
    const p = new URLSearchParams()
    p.set('url', resolved)
    const ref = referer || getRefererForUrl(resolved)
    if (ref) p.set('referer', ref)
    if (origin) p.set('origin', origin)
    else if (ref) p.set('origin', new URL(ref).origin)
    return `/api/proxy/stream.m3u8?${p.toString()}`
  }).join('\n')
}

export async function GET(req: NextRequest) {
  return handleRequest(req)
}

export async function HEAD(req: NextRequest) {
  return handleRequest(req)
}

async function handleRequest(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const url = searchParams.get('url')
    const referer = searchParams.get('referer') || undefined
    const originParam = searchParams.get('origin') || undefined

    if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': '*/*',
    }
    const finalReferer = referer || getRefererForUrl(url)
    if (finalReferer) headers['Referer'] = finalReferer
    if (originParam) headers['Origin'] = originParam
    else if (finalReferer) headers['Origin'] = new URL(finalReferer).origin

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20000)

    let res: Response
    try {
      res = await fetch(url, { headers, signal: controller.signal })
    } finally {
      clearTimeout(timeout)
    }

    if (!res.ok) return NextResponse.json({ error: `Upstream ${res.status}` }, { status: 502 })

    const contentType = res.headers.get('content-type') || ''
    const isM3u8 = contentType.includes('mpegurl') || contentType.includes('m3u8') || url.includes('.m3u8')
    const body = await res.arrayBuffer()

    if (isM3u8) {
      const text = new TextDecoder().decode(body)
      const rewritten = rewriteManifest(text, url, referer, originParam)
      return new NextResponse(rewritten, {
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache',
        },
      })
    }

    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 })
  }
}
