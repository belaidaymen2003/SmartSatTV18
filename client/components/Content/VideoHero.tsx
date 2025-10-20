'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Play, Volume2, VolumeX, Pause } from 'lucide-react'

interface VideoHeroProps {
  video: {
    id: number
    title: string
    description?: string
    thumbnail?: string
    videoUrl: string
    price: number
  } | null
}

export default function VideoHero({ video }: VideoHeroProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.play().catch(() => setIsPlaying(false))
    } else {
      videoRef.current.pause()
    }
  }, [isPlaying])

  if (!video) {
    return null
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
    }
  }

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative w-full h-[560px] md:h-[720px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Video Background */}
        {isPlaying ? (
          <video
            ref={videoRef}
            src={video.videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            muted={isMuted}
            autoPlay
            playsInline
          />
        ) : video.thumbnail ? (
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            sizes="(max-width: 768px) 100vw, 1600px"
            className="object-cover brightness-50"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10" />
        )}

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

        {/* Content Container */}
        <div className="absolute inset-0 max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-end md:justify-center pb-12 md:pb-20">
          <div className="w-full md:w-2/3 lg:w-3/5 space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-white drop-shadow-2xl">
                {video.title}
              </h1>
            </div>

            {/* Description */}
            {video.description && (
              <p className="text-lg md:text-xl text-white/80 max-w-2xl drop-shadow-lg leading-relaxed">
                {video.description}
              </p>
            )}

            {/* Controls */}
            <div className="flex items-center gap-4 pt-4 flex-wrap">
              {/* Play Button */}
              <button
                onClick={handlePlayPause}
                className="group relative inline-flex items-center gap-3 px-7 md:px-9 py-3 md:py-4 rounded-full font-semibold text-white transition-all duration-300 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <div className="relative flex items-center gap-3">
                  {isPlaying ? (
                    <Pause className="w-5 h-5 md:w-6 md:h-6" />
                  ) : (
                    <Play className="w-5 h-5 md:w-6 md:h-6 ml-1" />
                  )}
                  <span className="text-base md:text-lg">{isPlaying ? 'Pause' : 'Watch Now'}</span>
                </div>
              </button>

              {/* Volume Toggle */}
              {isPlaying && (
                <button
                  onClick={handleMuteToggle}
                  className="glass group p-3 md:p-4 rounded-full transition-all duration-300 hover:bg-white/20 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/20 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    )}
                  </div>
                </button>
              )}
            </div>

            {/* Info Pills */}
            <div className="flex items-center gap-2 pt-4 flex-wrap">
              <div className="glass px-4 py-2 rounded-full text-sm font-medium text-white/90 backdrop-blur-xl">
                Premium Quality
              </div>
              <div className="glass px-4 py-2 rounded-full text-sm font-medium text-white/90 backdrop-blur-xl">
                4K Ready
              </div>
              <div className="glass px-4 py-2 rounded-full text-sm font-medium text-white/90 backdrop-blur-xl">
                No Ads
              </div>
            </div>
          </div>
        </div>

        {/* Playing Indicator */}
        {isPlaying && (
          <div className="absolute top-8 left-8 z-20">
            <div className="glass px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-xl">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-white">Now Playing</span>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
