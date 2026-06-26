import { Monitor, Globe, X, Mail, Heart } from 'lucide-react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#050816]/95 mt-auto">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20">
                <Monitor className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Freemium</span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed mb-4">
              Free live TV streaming from around the world. Watch your favorite channels anytime, anywhere.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all" aria-label="GitHub">
                <Globe className="w-4 h-4" />
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all" aria-label="X (Twitter)">
                <X className="w-4 h-4" />
              </a>
              <a href="mailto:support@freemium.com" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all" aria-label="Email">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Browse */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4">Browse</h3>
            <ul className="space-y-2.5">
              <li><Link href="/" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Home</Link></li>
              <li><Link href="/channels" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Live TV</Link></li>
              <li><Link href="/categories" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Categories</Link></li>
              <li><Link href="/search" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Search</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4">Account</h3>
            <ul className="space-y-2.5">
              <li><Link href="/profile" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Profile</Link></li>
              <li><Link href="/favorites" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Favorites</Link></li>
              <li><Link href="/settings" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Settings</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4">Support</h3>
            <ul className="space-y-2.5">
              <li><a href="mailto:support@freemium.com" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Contact</a></li>
              <li><span className="text-zinc-500 text-sm">FAQ</span></li>
              <li><span className="text-zinc-500 text-sm">Privacy Policy</span></li>
              <li><span className="text-zinc-500 text-sm">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/[0.06] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-600 text-xs">
            &copy; {new Date().getFullYear()} Freemium. All rights reserved.
          </p>
          <p className="text-zinc-600 text-xs flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500" /> for cord-cutters everywhere
          </p>
        </div>
      </div>
    </footer>
  )
}
