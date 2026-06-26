import Link from 'next/link'
import { Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-zinc-400 text-lg mb-8">Page not found</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold text-sm shadow-lg hover:shadow-red-500/25 transition-all"
        >
          <Home className="w-4 h-4" />
          Go Home
        </Link>
      </div>
    </div>
  )
}
