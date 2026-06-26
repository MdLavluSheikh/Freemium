'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { Channel } from '@/lib/channel-service'

const showTitles = ['Morning News', 'Live Sports', 'Movie Hour', 'Talk Show', 'Documentary', 'Kids Corner', 'Evening News', 'Prime Time']

export default function TVGuidePage() {
  const [channels, setChannels] = useState<Channel[]>([])

  useEffect(() => {
    fetch('/api/channels?category=All&limit=15')
      .then(r => r.json())
      .then(data => setChannels(data.channels || []))
      .catch(() => {})
  }, [])

  const hours = Array.from({ length: 8 }, (_, i) => {
    const d = new Date(); d.setHours(d.getHours() + i, 0, 0, 0); return d
  })

  const getEPG = (_channelId: string, _i: number) => {
    const now = Date.now()
    const hour = 3600000
    return showTitles.map((title, j) => {
      const start = new Date(now + j * hour + _i * 1000)
      const end = new Date(start.getTime() + hour)
      return { id: `epg-${_channelId}-${j}`, title, startTime: start.toISOString(), endTime: end.toISOString() }
    })
  }

  return (
    <div className="min-h-screen px-4 lg:px-8 py-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">TV Guide</h1>
          <p className="text-zinc-400 text-sm">Schedule & program information</p>
        </div>
      </motion.div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="flex border-b border-white/[0.06] mb-2">
            <div className="w-48 shrink-0 px-4 py-2">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Channel</span>
            </div>
            {hours.map((h, i) => (
              <div key={i} className="flex-1 min-w-[100px] px-2 py-2">
                <span className="text-xs font-semibold text-zinc-500">
                  {h.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-1">
            {channels.map((ch, i) => {
              const epg = getEPG(ch.name, i)
              return (
                <motion.div key={`${ch.url}-${i}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="flex group">
                  <div className="w-48 shrink-0 px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                      {ch.logo ? <img src={ch.logo} alt="" className="w-6 h-6 object-contain" /> : <span className="text-zinc-500 text-[10px]">{ch.name[0]}</span>}
                    </div>
                    <span className="text-sm font-medium text-zinc-200 truncate">{ch.name}</span>
                  </div>
                  <div className="flex-1 flex gap-1">
                    {epg.map((program, j) => {
                      const start = new Date(program.startTime)
                      const end = new Date(program.endTime)
                      const now = new Date()
                      const isCurrent = start <= now && end >= now
                      return (
                        <div key={program.id} className={`flex-1 min-w-[100px] px-2 py-2 rounded-lg transition-all ${isCurrent ? 'bg-red-500/10 border border-red-500/20' : 'hover:bg-white/[0.03]'}`}>
                          <p className={`text-xs truncate ${isCurrent ? 'text-white font-medium' : 'text-zinc-400'}`}>{program.title}</p>
                          <p className="text-[10px] text-zinc-600 mt-0.5">{start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
