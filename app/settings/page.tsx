'use client'

import { motion } from 'framer-motion'
import { Moon, Bell, Globe, Monitor, Play, Shield, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/store/useStore'

const settingsGroups = [
  {
    title: 'Appearance',
    items: [
      { icon: Moon, label: 'Dark Mode', description: 'Dark theme is always enabled', type: 'toggle', key: 'theme' },
    ],
  },
  {
    title: 'Playback',
    items: [
      { icon: Play, label: 'Autoplay', description: 'Auto-play channels when loaded', type: 'toggle', key: 'autoplay' },
      { icon: Monitor, label: 'Default Quality', description: 'Auto (recommended)', type: 'select', key: 'defaultQuality' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: Bell, label: 'Notifications', description: 'Get notified about live events', type: 'toggle', key: 'notifications' },
      { icon: Globe, label: 'Language', description: 'English (US)', type: 'select', key: 'language' },
      { icon: Shield, label: 'Privacy', description: 'Manage your data', type: 'link', key: 'privacy' },
    ],
  },
]

export default function SettingsPage() {
  const settings = useAppStore((s) => s.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)

  return (
    <div className="min-h-screen px-4 lg:px-8 py-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

        <div className="space-y-6">
          {settingsGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 px-1">{group.title}</h2>
              <div className="glass rounded-2xl divide-y divide-white/[0.06]">
                {group.items.map((item) => (
                  <div key={item.key} className="flex items-center justify-between px-4 py-3.5 hover:bg-white/[0.02] transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-zinc-400" />
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{item.label}</p>
                        <p className="text-xs text-zinc-500">{item.description}</p>
                      </div>
                    </div>
                    {item.type === 'toggle' && (
                      <button
                        onClick={() => updateSettings({ [item.key]: !(settings as any)[item.key] })}
                        className={`w-10 h-6 rounded-full transition-all ${
                          (settings as any)[item.key] ? 'bg-red-500' : 'bg-zinc-700'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all mt-0.5 ${
                          (settings as any)[item.key] ? 'ml-5' : 'ml-1'
                        }`} />
                      </button>
                    )}
                    {item.type === 'select' && (
                      <ChevronRight className="w-4 h-4 text-zinc-500" />
                    )}
                    {item.type === 'link' && (
                      <ChevronRight className="w-4 h-4 text-zinc-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
