'use client'

import { motion } from 'framer-motion'
import { Heart, Tv } from 'lucide-react'
import Link from 'next/link'
import { Channel } from '@/lib/channel-service'
import { useAppStore } from '@/store/useStore'
import { cn } from '@/lib/utils'
import { hashChannelUrl } from '@/lib/watch-utils'

interface ChannelCardProps {
  channel: Channel
  index?: number
}

export default function ChannelCard({ channel, index = 0 }: ChannelCardProps) {
  const isFav = useAppStore((s) => s.isFavorite(channel.url))
  const toggleFav = useAppStore((s) => s.toggleFavorite)
  const name = channel.name || 'Unknown'
  const hasHD = /HD|FHD|4K|1080|720/i.test(name)
  const watchSlug = hashChannelUrl(channel.url)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index || 0) * 0.05, ease: 'easeOut', duration: 0.4 }}
      className="group shrink-0 w-44 sm:w-48"
    >
      <Link href={`/watch/${watchSlug}`}>
        <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-800/60 border border-white/[0.06] group-hover:border-red-500/30 transition-all duration-300">
          <div className="absolute inset-0 flex items-center justify-center p-4">
            {channel.logo ? (
              <img
                src={channel.logo}
                alt={name}
                className="w-3/4 h-3/4 object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                loading="lazy"
              />
            ) : (
              <Tv className="w-10 h-10 text-zinc-600" />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-red-500 text-white text-[9px] font-bold uppercase tracking-wider shadow-lg">
              <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
              Live
            </span>
            {hasHD && (
              <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-zinc-300 text-[9px] font-bold uppercase backdrop-blur-sm">
                HD
              </span>
            )}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); toggleFav(channel.url) }}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500/20"
          >
            <Heart className={cn('w-3.5 h-3.5 transition-colors', isFav ? 'text-red-500 fill-red-500' : 'text-white/70')} />
          </button>
        </div>
      </Link>
      <div className="mt-2 px-0.5">
          <Link href={`/watch/${watchSlug}`}>
          <p className="text-sm font-medium text-zinc-200 truncate group-hover:text-white transition-colors">{name}</p>
        </Link>
        <p className="text-[11px] text-zinc-500 truncate">{channel.group}</p>
      </div>
    </motion.div>
  )
}
