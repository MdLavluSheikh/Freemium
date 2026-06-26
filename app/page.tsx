'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Heart, Flame, TrendingUp, Star, Tv, Music, Globe } from 'lucide-react'
import ChannelCard from '@/components/channel-card'
import SectionHeader from '@/components/section-header'
import { Channel } from '@/lib/channel-service'

export default function HomePage() {
  const [sections, setSections] = useState<{ title: string; data: Channel[]; icon: any }[]>([])
  const [hero, setHero] = useState<Channel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [allRes, sportsRes, newsRes, musicRes, entRes, intlRes] = await Promise.all([
          fetch('/api/channels?category=All&limit=10'),
          fetch('/api/channels?category=Sports&limit=10'),
          fetch('/api/channels?category=News&limit=10'),
          fetch('/api/channels?category=Music&limit=10'),
          fetch('/api/channels?category=Entertainment&limit=10'),
          fetch('/api/channels?category=International&limit=10'),
        ])
        const [all, sports, news, music, ent, intl] = await Promise.all([
          allRes.json(), sportsRes.json(), newsRes.json(),
          musicRes.json(), entRes.json(), intlRes.json(),
        ])
        const allCh = all.channels || []
        setHero(allCh[0] || null)
        setSections([
          { title: 'Trending Now', data: allCh.slice(0, 10), icon: Flame },
          { title: 'Sports', data: sports.channels || [], icon: TrendingUp },
          { title: 'Entertainment', data: ent.channels || [], icon: Star },
          { title: 'News', data: news.channels || [], icon: Tv },
          { title: 'Music', data: music.channels || [], icon: Music },
          { title: 'International', data: intl.channels || [], icon: Globe },
        ])
      } catch { /* ignore */ }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return null

  return (
    <div className="min-h-screen">
      {hero && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative h-[70vh] min-h-[500px] flex items-end"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/20 via-[#050816]/60 to-[#050816] z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050816] via-transparent to-transparent z-10" />
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <div className="w-96 h-96 rounded-full bg-red-500 blur-[120px]" />
          </div>

          <div className="relative z-20 w-full px-4 lg:px-8 pb-16">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-bold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Live
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3 leading-tight">
                {hero.name}
              </h1>
              <p className="text-base sm:text-lg text-zinc-400 mb-6 max-w-xl leading-relaxed">
                Watch {hero.name} live. 24/7 {hero.group} channel.
              </p>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold text-sm shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-shadow"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Watch Now
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl glass text-zinc-200 font-semibold text-sm hover:bg-white/10 transition-all"
                >
                  <Heart className="w-4 h-4" />
                  Add to Favorites
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.section>
      )}

      <div className="px-4 lg:px-8 pb-16 space-y-10 -mt-8 relative z-30">
        {sections.map((section) => (
          <section key={section.title}>
            <SectionHeader title={section.title} action={{ label: 'View All' }} />
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {section.data.map((ch, i) => (
                <ChannelCard key={`${ch.name}-${i}`} channel={ch} index={i} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
