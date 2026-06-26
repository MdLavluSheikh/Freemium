import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getRefererForUrl(url: string): string | undefined {
  // gpcdn.net streams require a proper Referer header
  if (url.includes('gpcdn.net')) {
    return 'https://www.goplay.com.bd/'
  }
  // aynaott.com streams require a proper Referer/Origin header
  if (url.includes('aynaott.com') || url.includes('trs1.aynaott.com')) {
    return 'https://www.aynaott.com/'
  }
  // Add more domains as needed
  return undefined
}

async function fetchWithHeaders(url: string, referer?: string, origin?: string, method = 'GET') {
  const headers: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  }
  const finalReferer = referer || getRefererForUrl(url)
  if (finalReferer) headers['Referer'] = finalReferer
  if (origin) headers['Origin'] = origin
  else if (finalReferer) headers['Origin'] = new URL(finalReferer).origin
  headers['Accept'] = '*/*'

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20000)

  try {
    const res = await fetch(url, { headers, method, signal: controller.signal })
    if (!res.ok) throw new Error(`Upstream ${res.status}`)
    const contentType = res.headers.get('content-type') || ''
    if (method === 'HEAD') {
      return { body: null, contentType }
    }
    const body = await res.arrayBuffer()
    return { body, contentType }
  } finally {
    clearTimeout(timeout)
  }
}

function isUrl(str: string): boolean {
  return /^https?:\/\//i.test(str)
}

function rewriteManifest(body: string, baseUrl: string, referer?: string, origin?: string): string {
  const lines = body.split('\n')
  return lines.map(line => {
    const trimmed = line.trim()

    // Rewrite URI inside EXT-X-KEY lines for AES-128 / DRM key requests
    if (trimmed.startsWith('#EXT-X-KEY:')) {
      const rewritten = trimmed.replace(/URI="([^"]+)"/g, (_match, uri: string) => {
        const resolved = isUrl(uri) ? uri : new URL(uri, baseUrl).href
        const p = new URLSearchParams()
        p.set('url', resolved)
        const ref = referer || getRefererForUrl(resolved)
        if (ref) p.set('referer', ref)
        if (origin) p.set('origin', origin)
        else if (ref) p.set('origin', new URL(ref).origin)
        return `URI="/api/proxy?${p.toString()}"`
      })
      return rewritten
    }

    // Rewrite EXT-X-MAP or other tag lines that have URI="..."
    if (trimmed.startsWith('#EXT-X-MAP:')) {
      const rewritten = trimmed.replace(/URI="([^"]+)"/g, (_match, uri: string) => {
        const resolved = isUrl(uri) ? uri : new URL(uri, baseUrl).href
        const p = new URLSearchParams()
        p.set('url', resolved)
        const ref = referer || getRefererForUrl(resolved)
        if (ref) p.set('referer', ref)
        if (origin) p.set('origin', origin)
        else if (ref) p.set('origin', new URL(ref).origin)
        return `URI="/api/proxy?${p.toString()}"`
      })
      return rewritten
    }

    // Skip other # lines (comments, tags without URLs)
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
    const finalReferer = referer || getRefererForUrl(resolved)
    if (finalReferer) p.set('referer', finalReferer)
    if (origin) p.set('origin', origin)
    else if (finalReferer) p.set('origin', new URL(finalReferer).origin)
    return `/api/proxy?${p.toString()}`
  }).join('\n')
}

export async function GET(req: NextRequest) {
  return handleRequest(req, 'GET')
}

export async function HEAD(req: NextRequest) {
  return handleRequest(req, 'HEAD')
}

async function handleRequest(req: NextRequest, method = 'GET') {
  try {
    const { searchParams } = new URL(req.url)
    const url = searchParams.get('url')
    const referer = searchParams.get('referer') || undefined
    const origin = searchParams.get('origin') || undefined

    if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

    // For HEAD requests, return OK with content-type hint
    if (method === 'HEAD') {
      const isM3u8 = url.includes('.m3u8')
      const isMpd = url.includes('.mpd')
      const ct = isM3u8 ? 'application/vnd.apple.mpegurl' : isMpd ? 'application/dash+xml' : 'application/octet-stream'
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Content-Type': ct,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Cache-Control': 'no-cache',
        },
      })
    }

    const { body, contentType } = await fetchWithHeaders(url, referer, origin, method)
    if (!body) return NextResponse.json({ error: 'Empty response' }, { status: 502 })

    if (contentType.includes('mpegurl') || contentType.includes('m3u8') || url.includes('.m3u8')) {
      const text = new TextDecoder().decode(body)
      const rewritten = rewriteManifest(text, url, referer, origin)
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
