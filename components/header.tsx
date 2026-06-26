'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Bell, Heart, User, Menu, X, Home, Tv, LayoutGrid,
  Compass, TrendingUp, Monitor,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/channels', label: 'Live TV', icon: Tv },
]

export default function Header() {
  const pathname = usePathname()
  const [mobileMenu, setMobileMenu] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[#050816]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="flex items-center px-4 lg:px-6 h-16">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20">
            <Monitor className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight hidden sm:block">
            Freemium
          </span>
        </Link>

        <nav className="flex-1 flex items-center justify-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200',
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-white/10 rounded-lg"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/profile"
            className="p-1 rounded-lg hover:bg-white/5 transition-all"
            aria-label="Profile"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </Link>
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            aria-label="Menu"
          >
            {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/[0.06] overflow-hidden"
          >
            <nav className="px-4 py-3 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenu(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive ? 'text-white bg-white/10' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5',
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                )
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border-t border-white/[0.06] px-4 py-3"
          >
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search channels, categories..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all"
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
