'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  PictureInPicture2, Settings, Volume1,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import shaka from 'shaka-player'

interface PlayerProps {
  src: string
  poster?: string
  channelName?: string
  autoPlay?: boolean
  useProxy?: boolean
}

function getRefererForUrl(url: string): string | undefined {
  if (url.includes('gpcdn.net')) return 'https://www.goplay.com.bd/'
  if (url.includes('aynaott.com') || url.includes('trs1.aynaott.com')) return 'https://www.aynaott.com/'
  if (url.includes('matchtv.ru')) return 'https://matchtv.ru/'
  return undefined
}

export default function Player({ src, poster, channelName, autoPlay = true, useProxy = false }: PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const shakaRef = useRef<shaka.Player | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [volume, setVolume] = useState(1)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isPiP, setIsPiP] = useState(false)
  const [error, setError] = useState(false)
  const [errorDetail, setErrorDetail] = useState('')
  const hideTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    let cancelled = false
    let currentPlayer: shaka.Player | null = null
    setError(false)
    setErrorDetail('')
    setPlaying(false)

    if (shakaRef.current) {
      shakaRef.current.destroy()
      shakaRef.current = null
    }
    video.removeAttribute('src')

    shaka.polyfill.installAll()

    const player = new shaka.Player(video)
    currentPlayer = player

    const netEngine = player.getNetworkingEngine()
    if (netEngine) {
      netEngine.registerRequestFilter((_type: number, request: shaka.extern.Request) => {
        // Headers are handled by the server-side proxy
      })
    }

    player.configure({
      drm: {
        servers: {},
        retryParameters: { maxAttempts: 2, baseDelay: 1000, backoffFactor: 2 },
      },
      streaming: {
        rebufferingGoal: 10,
        bufferingGoal: 30,
        startAtSegmentBoundary: false,
      },
      manifest: {
        disableAudio: false,
        disableVideo: false,
      },
    })

    player.addEventListener('error', (event) => {
      if (cancelled) return
      const detail = (event as any).detail
      const code = detail?.code || 0
      if (detail?.severity === 2) {
        let msg = 'Playback error'
        if (code >= 4000 && code < 5000) msg = 'DRM / Content not supported'
        else if (code >= 3000 && code < 4000) msg = 'Streaming error'
        else if (code >= 2000 && code < 3000) msg = 'Invalid stream source'
        else if (code >= 1000 && code < 2000) msg = 'Network error'
        setError(true)
        setErrorDetail(`${msg} (${code})`)
      }
    })

    const sourceUrl = useProxy
      ? `/api/proxy/stream.m3u8?url=${encodeURIComponent(src)}`
      : src

    player.load(sourceUrl).then(() => {
      if (cancelled) { player.destroy(); return }
      shakaRef.current = player
      if (autoPlay) {
        video.play().then(() => {
          video.muted = false
          setMuted(false)
        }).catch(() => setPlaying(false))
      }
    }).catch((err: any) => {
      if (!cancelled) {
        video.removeAttribute('src')
        setError(true)
        setErrorDetail(err.message || 'Failed to load stream')
        player.destroy()
        currentPlayer = null
      }
    })

    return () => {
      cancelled = true
      if (ctxRef.current) {
        ctxRef.current.close()
        ctxRef.current = null
        gainRef.current = null
      }
      if (currentPlayer) {
        currentPlayer.destroy()
      }
      shakaRef.current = null
      video.removeAttribute('src')
    }
  }, [src, autoPlay])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().catch(() => setPlaying(false))
    } else {
      video.pause()
      setPlaying(false)
    }
  }, [])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }, [])

  const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value)
    const video = videoRef.current
    if (!video) return

    if (v <= 1) {
      video.volume = v
      if (ctxRef.current) {
        ctxRef.current.close()
        ctxRef.current = null
        gainRef.current = null
      }
    } else {
      video.volume = 1
      try {
        if (!ctxRef.current) {
          const ctx = new AudioContext()
          const source = ctx.createMediaElementSource(video)
          const gain = ctx.createGain()
          source.connect(gain)
          gain.connect(ctx.destination)
          ctxRef.current = ctx
          gainRef.current = gain
        }
        if (gainRef.current) {
          gainRef.current.gain.value = v
        }
      } catch {
        // AudioContext not supported
      }
    }

    setVolume(v)
    setMuted(v === 0)
  }, [])

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    setCurrentTime(video.currentTime)
    setProgress((video.currentTime / (video.duration || 1)) * 100)
    setDuration(video.duration)
  }, [])

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    video.currentTime = pos * video.duration
  }, [])

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    if (!document.fullscreenElement) {
      container.requestFullscreen({ navigationUI: 'hide' })
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) setIsFullscreen(false)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  const togglePiP = useCallback(async () => {
    const video = videoRef.current
    if (!video) return
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
        setIsPiP(false)
      } else {
        await video.requestPictureInPicture()
        setIsPiP(true)
      }
    } catch {
      /* PiP not supported */
    }
  }, [])

  const handleMouseMove = useCallback(() => {
    setShowControls(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => {
      if (playing) setShowControls(false)
    }, 3000)
  }, [playing])

  const handleContainerClick = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.muted) {
      video.muted = false
      setMuted(false)
    }
  }, [])

  const formatTime = (s: number) => {
    if (!s || !isFinite(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [])

  if (error) return (
    <div className="flex items-center justify-center bg-zinc-900/80 rounded-xl aspect-video">
      <div className="text-center">
        <p className="text-zinc-400 text-sm font-medium">Stream unavailable</p>
        <p className="text-zinc-600 text-xs mt-1">{errorDetail || 'The source could not be loaded'}</p>
      </div>
    </div>
  )

  if (!src) return (
    <div className="flex items-center justify-center bg-zinc-900/80 rounded-xl aspect-video">
      <div className="text-center">
        <Play className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
        <p className="text-zinc-500 text-sm font-medium">No stream selected</p>
      </div>
    </div>
  )

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-black rounded-xl overflow-hidden aspect-video group',
        isFullscreen && '!rounded-none'
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
      onClick={handleContainerClick}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        poster={poster}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => {
          setPlaying(true)
          const video = videoRef.current
          if (video?.muted) {
            video.muted = false
            setMuted(false)
          }
        }}
        onPause={() => setPlaying(false)}
        playsInline
        autoPlay={autoPlay}
        muted={muted}
      />

      <div className={cn(
        'absolute inset-0 flex flex-col justify-between transition-opacity duration-300',
        showControls ? 'opacity-100' : 'opacity-0 pointer-events-none',
      )}>
        <div className="p-4 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-600 text-white text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
            {channelName && <span className="text-white/80 text-sm font-medium truncate">{channelName}</span>}
          </div>
        </div>

        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center" onClick={togglePlay}>
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all hover:scale-110">
              <Play className="w-7 h-7 text-white ml-1" />
            </div>
          </div>
        )}

        {muted && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <VolumeX className="w-8 h-8 text-white/40" />
          </div>
        )}

        <div className="p-3 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
          <div className="w-full h-1 bg-white/10 rounded-full cursor-pointer mb-3" onClick={handleSeek}>
            <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={togglePlay} className="p-1.5 rounded-lg text-white hover:bg-white/10 transition-all">
                {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-1">
                <button onClick={toggleMute} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all">
                  {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : volume < 0.5 ? <Volume1 className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <div className="relative group/vol">
                  <input
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.05"
                    value={muted ? 0 : volume}
                    onChange={handleVolume}
                    className="w-16 h-1 accent-red-500 cursor-pointer"
                  />
                  {volume > 1 && (
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-red-400 whitespace-nowrap">
                      Boost {Math.round((volume - 1) * 100)}%
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs text-zinc-400 font-mono ml-1">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={togglePiP} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all" title="Picture in Picture">
                <PictureInPicture2 className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all" title="Settings">
                <Settings className="w-4 h-4" />
              </button>
              <button onClick={toggleFullscreen} className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all" title="Fullscreen">
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}