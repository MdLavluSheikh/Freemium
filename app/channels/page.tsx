'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Loader2 } from 'lucide-react'
import ChannelCard from '@/components/channel-card'
import { cn } from '@/lib/utils'

interface Channel {
  name: string
  logo: string
  url: string
  group: string
}

interface CategoryGroup {
  category: string
  channels: Channel[]
  count: number
}

export default function ChannelsPage() {
  const [categories, setCategories] = useState<CategoryGroup[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/api/sidebar?limit=9999')
      .then(r => r.json())
      .then(data => {
        const cats = (data.categories || []) as CategoryGroup[]
        setCategories(cats)
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false))
  }, [])

  // Filter and group: only FIFA, Bangladehsi, Indian, Pakistani
  const allowedCategories = useMemo(() => {
    const groups: Record<string, CategoryGroup> = {
      FIFA: { category: 'FIFA', channels: [], count: 0 },
      Bangladehsi: { category: 'Bangladehsi', channels: [], count: 0 },
      Indian: { category: 'Indian', channels: [], count: 0 },
      Pakistani: { category: 'Pakistani', channels: [], count: 0 },
    }

    categories.forEach(cat => {
      const catLower = cat.category.toLowerCase()

      // Map categories to our 4 groups
      if (catLower.includes('fifa') || catLower.includes('world cup')) {
        groups.FIFA.channels.push(...cat.channels)
      } else if (catLower.includes('bangla') || catLower.includes('bangladesh')) {
        groups.Bangladehsi.channels.push(...cat.channels)
      } else if (catLower.includes('india') || catLower.includes('indian')) {
        groups.Indian.channels.push(...cat.channels)
      } else if (catLower.includes('pakistan') || catLower.includes('pakistani')) {
        groups.Pakistani.channels.push(...cat.channels)
      }
    })

    // Remove duplicates (by URL) and sort
    return Object.values(groups).map(group => {
      const seen = new Set<string>()
      const unique = group.channels.filter(ch => {
        if (seen.has(ch.url)) return false
        seen.add(ch.url)
        return true
      }).sort((a, b) => a.name.localeCompare(b.name))

      return {
        category: group.category,
        channels: unique,
        count: unique.length,
      }
    }).filter(g => g.count > 0)
  }, [categories])

  // Get channels based on selected category
  const sourceChannels = useMemo(() => {
    if (selectedCategory === 'All') {
      return allowedCategories.flatMap(c => c.channels)
    }
    const cat = allowedCategories.find(c => c.category === selectedCategory)
    return cat ? cat.channels : []
  }, [allowedCategories, selectedCategory])

  // Apply search filter
  const displayChannels = useMemo(() => {
    if (!search) return sourceChannels
    const lower = search.toLowerCase()
    return sourceChannels.filter(ch =>
      ch.name.toLowerCase().includes(lower) || ch.group.toLowerCase().includes(lower)
    )
  }, [sourceChannels, search])

  const totalChannels = allowedCategories.reduce((sum, c) => sum + c.count, 0)

  return (
    <div className="min-h-screen px-4 lg:px-8 py-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-1">Live TV</h1>
        <p className="text-zinc-400 text-sm">
          {loading ? 'Loading...' : `${totalChannels} channels in ${allowedCategories.length} categories`}
        </p>
      </motion.div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search channels..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
          />
        </div>
      </div>

      {/* category filter tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button
          onClick={() => { setSelectedCategory('All'); setSearch('') }}
          className={cn(
            'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
            selectedCategory === 'All' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
          )}
        >All</button>
        {allowedCategories.map(cat => (
          <button
            key={cat.category}
            onClick={() => { setSelectedCategory(cat.category); setSearch('') }}
            className={cn(
              'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
              selectedCategory === cat.category ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
            )}
          >
            {cat.category}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        </div>
      ) : displayChannels.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
        >
          {displayChannels.map((ch, i) => (
            <ChannelCard key={`${ch.url}-${i}`} channel={ch} index={i} />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-20">
          <p className="text-zinc-500 text-lg">No channels found</p>
          <p className="text-zinc-600 text-sm mt-1">Try a different search or category</p>
        </div>
      )}
    </div>
  )
}
