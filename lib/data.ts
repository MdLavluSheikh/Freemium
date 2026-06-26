import channelsAll from '@/data/channels-all.json'
import { WatchParams } from './watch-utils'

export interface Channel {
  name: string
  url: string
  logo: string
  group: string
}

const allChannels: Channel[] = (channelsAll as any[]).map(ch => ({
  name: ch.name,
  url: ch.url,
  logo: ch.logo || '',
  group: ch.group || '',
}))

export function getAllChannels(): Channel[] {
  return allChannels
}

export function searchChannels(query: string, limit = 500): Channel[] {
  const lower = query.toLowerCase()
  return allChannels
    .filter(ch => ch.name.toLowerCase().includes(lower) || ch.group.toLowerCase().includes(lower))
    .slice(0, limit)
}

export function getChannelsByGroup(group: string): Channel[] {
  return allChannels.filter(ch => ch.group === group)
}

export function getChannelsPaginated(category: string, page: number, pageSize: number, search: string): { channels: Channel[]; total: number } {
  let filtered = allChannels

  if (search) {
    const lower = search.toLowerCase()
    filtered = filtered.filter(ch => ch.name.toLowerCase().includes(lower) || ch.group.toLowerCase().includes(lower))
  }

  const total = filtered.length
  const offset = (page - 1) * pageSize
  const channels = filtered.slice(offset, offset + pageSize)

  return { channels, total }
}

export function getChannelByUrl(url: string): Channel | null {
  return allChannels.find(ch => ch.url === url) || null
}

export function getWatchByCode(code: string): WatchParams | null {
  const ch = allChannels.find(c => c.url === code)
  if (!ch) return null
  return { url: ch.url, name: ch.name, logo: ch.logo, group: ch.group }
}
