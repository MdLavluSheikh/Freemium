'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Heart, Trash2, Grid3X3, List } from 'lucide-react'
import { useAppStore } from '@/store/useStore'
import { Channel } from '@/lib/channel-service'
import { cn } from '@/lib/utils'
import { hashChannelUrl } from '@/lib/watch-utils'

export default function FavoritesPage() {
  const favorites = useAppStore((s) => s.favorites)
  const toggleFavorite = useAppStore((s) => s.toggleFavorite)
  const [channels, setChannels] = useState<Channel[]>([])
  const [view, setView] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    if (favorites.length === 0) { setChannels([]); return }
    fetch(`/api/channels?category=All&limit=9999`)
      .then(r => r.json())
      .then(data => {
        const all = data.channels || []
        setChannels(all.filter((ch: Channel) => favorites.includes(ch.url)))
      })
      .catch(() => setChannels([]))
  }, [favorites])

  return (
    <div className="min-h-screen px-4 lg:px-8 py-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">My Favorites</h1>
          <p className="text-zinc-400 text-sm">{channels.length} saved channels</p>
        </div>
        <div className="flex items-center gap-1 glass rounded-xl p-1">
          <button onClick={() => setView('grid')} className={cn('p-2 rounded-lg transition-all', view === 'grid' ? 'bg-red-500 text-white' : 'text-zinc-400 hover:text-white')}>
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button onClick={() => setView('list')} className={cn('p-2 rounded-lg transition-all', view === 'list' ? 'bg-red-500 text-white' : 'text-zinc-400 hover:text-white')}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {channels.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400 text-lg font-medium">No favorites yet</p>
          <p className="text-zinc-600 text-sm mt-1">Start adding channels to your favorites</p>
          <Link href="/channels" className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all">
            Browse Channels
          </Link>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {channels.map((ch, i) => (
            <motion.div key={`${ch.url}-${i}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="group">
              <Link href={`/watch/${hashChannelUrl(ch.url)}`}>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-800/60 border border-white/[0.06] group-hover:border-red-500/30 transition-all">
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    {ch.logo ? <img src={ch.logo} alt="" className="w-3/4 h-3/4 object-contain opacity-80 group-hover:opacity-100 transition-opacity" /> : <span className="text-zinc-500 text-xs">{ch.name[0]}</span>}
                  </div>
                  <button onClick={(e) => { e.preventDefault(); toggleFavorite(ch.url) }} className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20">
                    <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                  </button>
                </div>
              </Link>
              <div className="mt-2 px-0.5">
                <p className="text-sm font-medium text-zinc-200 truncate">{ch.name}</p>
                <p className="text-[11px] text-zinc-500 truncate">{ch.group}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {channels.map((ch, i) => (
            <motion.div key={ch.url} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <Link href={`/watch/${hashChannelUrl(ch.url)}`}
                className="flex items-center gap-4 p-3 rounded-xl glass hover:bg-white/[0.08] transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                  {ch.logo ? <img src={ch.logo} alt="" className="w-10 h-10 object-contain" /> : <span className="text-zinc-500 text-sm">{ch.name[0]}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">{ch.name}</p>
                  <p className="text-xs text-zinc-500">{ch.group}</p>
                </div>
                <button onClick={(e) => { e.preventDefault(); toggleFavorite(ch.url) }} className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
