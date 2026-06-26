'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import Link from 'next/link'
import { useAppStore } from '@/store/useStore'
import { Channel } from '@/lib/channel-service'
import { hashChannelUrl } from '@/lib/watch-utils'

export default function RecentlyWatchedPage() {
  const recentlyWatched = useAppStore((s) => s.recentlyWatched)
  const [channels, setChannels] = useState<Channel[]>([])

  useEffect(() => {
    if (recentlyWatched.length === 0) { setChannels([]); return }
    fetch('/api/channels?category=All&limit=9999')
      .then(r => r.json())
      .then(data => {
        const all = data.channels || []
        setChannels(all.filter((ch: Channel) => recentlyWatched.includes(ch.url)))
      })
      .catch(() => setChannels([]))
  }, [recentlyWatched])

  return (
    <div className="min-h-screen px-4 lg:px-8 py-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Recently Watched</h1>
          <p className="text-zinc-400 text-sm">{channels.length} channels</p>
        </div>
      </motion.div>
      {channels.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">No watch history</div>
      ) : (
        <div className="space-y-2">
          {channels.map((ch, i) => (
            <motion.div key={`${ch.url}-${i}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
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
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
