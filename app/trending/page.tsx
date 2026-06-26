'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import ChannelCard from '@/components/channel-card'
import { Channel } from '@/lib/channel-service'

export default function TrendingPage() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/channels?category=All&limit=50')
      .then(r => r.json())
      .then(data => setChannels(data.channels || []))
      .catch(() => setChannels([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen px-4 lg:px-8 py-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Trending</h1>
          <p className="text-zinc-400 text-sm">Popular channels</p>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {channels.map((ch, i) => <ChannelCard key={`${ch.url}-${i}`} channel={ch} index={i} />)}
        </div>
      )}
    </div>
  )
}
