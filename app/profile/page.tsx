'use client'

import { motion } from 'framer-motion'
import { User, Mail, Calendar, Heart, Clock, Settings as SettingsIcon, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useAppStore } from '@/store/useStore'
import { formatNumber } from '@/lib/utils'

export default function ProfilePage() {
  const favorites = useAppStore((s) => s.favorites)
  const recentlyWatched = useAppStore((s) => s.recentlyWatched)

  const stats = [
    { label: 'Favorites', value: favorites.length, icon: Heart, color: 'text-red-400' },
    { label: 'Recently Watched', value: recentlyWatched.length, icon: Clock, color: 'text-blue-400' },
  ]

  return (
    <div className="min-h-screen px-4 lg:px-8 py-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        <div className="glass rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-xl shadow-red-500/20">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">Viewer</h1>
              <p className="text-zinc-400 text-sm flex items-center gap-2 mt-1">
                <Mail className="w-3.5 h-3.5" /> viewer@freemium.com
              </p>
              <p className="text-zinc-500 text-xs flex items-center gap-2 mt-1">
                <Calendar className="w-3.5 h-3.5" /> Joined January 2025
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            {stats.map((stat) => (
              <div key={stat.label} className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  <span className="text-xs text-zinc-500">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/favorites" className="glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/[0.08] transition-all group">
            <Heart className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-sm font-medium text-white">My Favorites</p>
              <p className="text-xs text-zinc-500">View saved channels</p>
            </div>
          </Link>
          <Link href="/settings" className="glass rounded-xl p-4 flex items-center gap-3 hover:bg-white/[0.08] transition-all group">
            <SettingsIcon className="w-5 h-5 text-zinc-400 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-sm font-medium text-white">Settings</p>
              <p className="text-xs text-zinc-500">Customize your experience</p>
            </div>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
