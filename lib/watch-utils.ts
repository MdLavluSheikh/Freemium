export interface WatchParams {
  url: string
  name: string
  logo: string
  group: string
}

// Deterministic hash function - generates short alphanumeric codes (client & server compatible)
// Same input URL always gives the same short code
export function hashChannelUrl(url: string): string {
  let hash = 0
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}