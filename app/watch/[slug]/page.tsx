'use client'

import { use, useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Player from '@/components/player'
import Sidebar from '@/components/sidebar'
import { WatchParams } from '@/lib/watch-utils'

function WatchContent({ slug }: { slug: string }) {
  const [params, setParams] = useState<WatchParams | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/resolve?code=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(data => {
        if (data.url) {
          setParams(data as WatchParams)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#050816]">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!params) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#050816]">
        <div className="text-center">
          <p className="text-zinc-400 text-lg font-medium">Channel not found</p>
          <p className="text-zinc-600 text-sm mt-1">Please try selecting the channel again</p>
        </div>
      </div>
    )
  }

  const { url, name, logo, group } = params

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] bg-[#050816] overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 p-6 lg:p-8 flex justify-center">
          <div className="w-full max-w-[1440px] relative">
            <Link href="/channels" className="absolute top-3 left-3 z-10 p-2 rounded-lg bg-black/40 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/60 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Player src={url} channelName={name} autoPlay />
          </div>
        </div>

        {name && (
          <div className="flex justify-center px-6 lg:px-8 pb-4">
            <div className="w-full max-w-[1440px]">
              <div className="glass rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  {logo && (
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 border border-zinc-700">
                      <img src={logo} alt="" className="w-8 h-8 object-contain" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="text-white font-semibold text-base truncate">{name}</h2>
                    <p className="text-xs text-zinc-400 truncate">{group}</p>
                  </div>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600/90 text-white text-[11px] font-bold uppercase tracking-wider shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Live
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-full lg:w-[280px] shrink-0 flex flex-col gap-4 pt-6 lg:pt-8 px-3 lg:px-4 pb-0 border-l border-white/[0.06] sticky top-16 self-start h-[calc(100vh-64px)]">
        <Sidebar currentChannelUrl={url} currentCategory={group} />
      </div>
    </div>
  )
}

export default function WatchSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolved = use(params)
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-[#050816]">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <WatchContent slug={resolved.slug} />
    </Suspense>
  )
}