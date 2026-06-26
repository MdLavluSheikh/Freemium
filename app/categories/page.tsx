'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Tv, Trophy, Film, Music, Sparkles, Globe, Newspaper, Languages, LucideIcon } from 'lucide-react'

const categories = [
  { id: 'news', name: 'News', icon: 'newspaper', slug: 'News' },
  { id: 'sports', name: 'Sports', icon: 'trophy', slug: 'Sports' },
  { id: 'entertainment', name: 'Entertainment', icon: 'tv', slug: 'Entertainment' },
  { id: 'movies', name: 'Movies', icon: 'film', slug: 'Movies' },
  { id: 'music', name: 'Music', icon: 'music', slug: 'Music' },
  { id: 'kids', name: 'Kids', icon: 'sparkles', slug: 'Kids' },
  { id: 'bangla', name: 'Bangla', icon: 'globe', slug: 'Bangla' },
  { id: 'india', name: 'India', icon: 'languages', slug: 'India' },
  { id: 'fifa', name: 'FIFA', icon: 'trophy', slug: 'FIFA' },
]

const iconMap: Record<string, LucideIcon> = {
  newspaper: Newspaper, trophy: Trophy, tv: Tv, film: Film,
  music: Music, sparkles: Sparkles, globe: Globe, languages: Languages,
}

export default function CategoriesPage() {
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    async function loadCounts() {
      const results: Record<string, number> = {}
      for (const cat of categories) {
        try {
          const res = await fetch(`/api/channels?category=${cat.slug}&limit=1`)
          const data = await res.json()
          results[cat.slug] = data.total || 0
        } catch { results[cat.slug] = 0 }
      }
      setCounts(results)
    }
    loadCounts()
  }, [])

  return (
    <div className="min-h-screen px-4 lg:px-8 py-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Categories</h1>
        <p className="text-zinc-400 text-sm">Browse channels by category</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, i) => {
          const Icon = iconMap[cat.icon] || Tv
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/channels?category=${cat.slug}`}
                className="group relative glass rounded-2xl p-6 block hover:bg-white/[0.08] transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/0 via-transparent to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mb-4 shadow-lg shadow-red-500/20">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{cat.name}</h3>
                  <p className="text-sm text-zinc-400">{counts[cat.slug] ?? '...'} channels</p>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
