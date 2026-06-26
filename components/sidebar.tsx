'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ChevronRight, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { Channel } from '@/lib/channel-service'
import { cn } from '@/lib/utils'
import { hashChannelUrl } from '@/lib/watch-utils'

interface SidebarProps {
  currentChannelUrl?: string
  currentCategory?: string
}

interface CategoryGroup {
  category: string
  channels: Channel[]
  count: number
}

export default function Sidebar({ currentChannelUrl, currentCategory }: SidebarProps) {
  const [search, setSearch] = useState('')
  const [categories, setCategories] = useState<CategoryGroup[]>([])
  const [collapsed, setCollapsed] = useState(false)
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // If currentCategory is provided (watch page), fetch all channels from that group
    // Otherwise fetch limited mixed categories
    const url = currentCategory 
      ? `/api/sidebar?group=${encodeURIComponent(currentCategory)}`
      : '/api/sidebar?limit=500'
    
    fetch(url)
      .then(r => r.json())
      .then(data => {
        const cats = (data.categories || []) as CategoryGroup[]
        setCategories(cats)
        // Auto-expand first 3 categories
        const exp: Record<string, boolean> = {}
        cats.slice(0, 3).forEach(c => { exp[c.category] = true })
        setExpandedCats(exp)
      })
      .catch(() => {})
  }, [currentCategory])

  const toggleCategory = (cat: string) => {
    setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }))
  }

  // When searching, flatten all channels from all categories, but filter by currentCategory if provided
  const allChannels = categories.flatMap(c => c.channels)
  const filtered = search
    ? allChannels.filter(ch => {
        if (currentCategory && ch.group !== currentCategory) return false
        return ch.name.toLowerCase().includes(search.toLowerCase())
      })
    : null

  // When currentCategory is provided, server already filtered by group
  // Show all returned categories (no client-side filtering needed)
  const displayCategories = categories

  return (
    <AnimatePresence>
      {!collapsed && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '100%', opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="flex flex-col min-h-0 flex-1"
        >
          <div className="flex items-center justify-between px-1 pb-2">
            <span className="text-sm font-semibold text-zinc-300">Channels</span>
            <button onClick={() => setCollapsed(true)} className="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-white/5 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/50 transition-all"
            />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"><X className="w-3 h-3" /></button>}
          </div>

          <div className="flex-1 space-y-1 overflow-y-auto min-h-0">
            {search && filtered ? (
              // Search results - flat list
              filtered.map((ch, i) => {
                const isActive = ch.url === currentChannelUrl
                const watchSlug = hashChannelUrl(ch.url)
                return (
                  <Link
                    key={`${ch.url}-${i}`}
                    href={`/watch/${watchSlug}`}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-all',
                      isActive ? 'bg-red-500/10 border border-red-500/20' : 'hover:bg-white/5 border border-transparent',
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                      {ch.logo ? <img src={ch.logo} alt="" className="w-6 h-6 object-contain" /> : <span className="text-zinc-500 text-[10px]">{ch.name[0]}</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn('text-sm truncate', isActive ? 'text-white font-medium' : 'text-zinc-300')}>{ch.name}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{ch.group}</p>
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                  </Link>
                )
              })
            ) : (
              // Category sections
              displayCategories.map((cat) => (
                <div key={cat.category}>
                  <button
                    onClick={() => toggleCategory(cat.category)}
                    className="flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <span>{cat.category}</span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-[10px] text-zinc-500">{cat.count}</span>
                      <ChevronDown className={cn('w-3 h-3 transition-transform', expandedCats[cat.category] && 'rotate-180')} />
                    </span>
                  </button>
                  {expandedCats[cat.category] && (
                    <div className="space-y-0.5 ml-1">
                      {cat.channels.map((ch, i) => {
                        const isActive = ch.url === currentChannelUrl
                        const watchSlug = hashChannelUrl(ch.url)
                        return (
                          <Link
                            key={`${ch.url}-${i}`}
                            href={`/watch/${watchSlug}`}
                            className={cn(
                              'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-xs',
                              isActive ? 'bg-red-500/10 border border-red-500/20' : 'hover:bg-white/5 border border-transparent',
                            )}
                          >
                            <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                              {ch.logo ? <img src={ch.logo} alt="" className="w-4 h-4 object-contain" /> : <span className="text-zinc-500 text-[8px]">{ch.name[0]}</span>}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={cn('truncate', isActive ? 'text-white font-medium' : 'text-zinc-400')}>{ch.name}</p>
                            </div>
                            <span className={cn('w-1 h-1 rounded-full shrink-0', isActive ? 'bg-red-500 animate-pulse' : 'bg-zinc-600')} />
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.aside>
      )}
      {collapsed && (
        <button onClick={() => setCollapsed(false)} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all self-start">
          <svg className="w-4 h-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      )}
    </AnimatePresence>
  )
}