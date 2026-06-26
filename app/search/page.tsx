'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, X, Clock } from 'lucide-react'
import ChannelCard from '@/components/channel-card'
import { Channel } from '@/lib/channel-service'
import { useAppStore } from '@/store/useStore'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Channel[]>([])
  const [loading, setLoading] = useState(false)
  const searchHistory = useAppStore((s) => s.searchHistory)
  const addSearchHistory = useAppStore((s) => s.addSearchHistory)

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    setLoading(true)
    fetch(`/api/channels?search=${encodeURIComponent(query)}&limit=50`)
      .then(r => r.json())
      .then(data => setResults(data.channels || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) addSearchHistory(query.trim())
  }

  return (
    <div className="min-h-screen px-4 lg:px-8 py-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white mb-6">Search</h1>
        <form onSubmit={handleSearch} className="relative max-w-2xl mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search channels..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-base text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10 transition-all"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </form>
      </motion.div>

      {!query && searchHistory.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-zinc-500" />
            <h2 className="text-sm font-semibold text-zinc-300">Recent Searches</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((q, i) => (
              <button key={i} onClick={() => setQuery(q)}
                className="px-3 py-1.5 rounded-lg glass text-sm text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
              >{q}</button>
            ))}
          </div>
        </motion.div>
      )}

      {loading && (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && query && results.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-sm text-zinc-500 mb-4">{results.length} results</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.map((ch, i) => <ChannelCard key={`${ch.url}-${i}`} channel={ch} index={i} />)}
          </div>
        </motion.div>
      )}

      {!loading && query && results.length === 0 && (
        <div className="text-center py-20">
          <Search className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400 text-lg">No results found</p>
        </div>
      )}
    </div>
  )
}
