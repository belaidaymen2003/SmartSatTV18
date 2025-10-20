'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Play, Volume2, VolumeX, Pause, Star, Zap } from 'lucide-react'

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.play().catch(() => setIsPlaying(false))
    } else {
      videoRef.current.pause()
    }
  }, [isPlaying])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

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
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="relative w-full h-[560px] md:h-[720px] bg-black overflow-hidden group"
      >
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-950" />

        {/* Animated gradient orb (follows mouse) */}
        <div
          className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 transition-all duration-300 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            left: `${mousePosition.x - 25}%`,
            top: `${mousePosition.y - 25}%`,
          }}
        />

        {/* Video Background */}
        {isPlaying ? (
          <video
            ref={videoRef}
            src={video.videoUrl}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
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
            className="object-cover brightness-40 group-hover:brightness-50 transition-all duration-700"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-slate-900" />
        )}

        {/* Premium Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

        {/* Animated Light Rays (on video play) */}
        {isPlaying && (
          <>
            <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-white/20 via-transparent to-transparent blur-xl opacity-30 animate-pulse" />
            <div className="absolute top-0 right-1/3 w-1 h-full bg-gradient-to-b from-purple-400/10 via-transparent to-transparent blur-xl opacity-20 animate-pulse" />
          </>
        )}

        {/* Content Container */}
        <div className="absolute inset-0 max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-end md:justify-center pb-16 md:pb-24">
          <div className="w-full md:w-3/5 lg:w-1/2 space-y-8 animate-slide-in">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 w-fit">
              <div className="glass px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-xl border border-white/20">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-xs font-bold text-white/90 uppercase tracking-wide">Premium Introduction</span>
              </div>
            </div>

            {/* Title with Gradient */}
            <div className="space-y-2">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight text-white drop-shadow-2xl">
                {video.title}
              </h1>
              <div className="h-1 w-24 bg-gradient-to-r from-purple-500 via-blue-500 to-transparent rounded-full" />
            </div>

            {/* Description */}
            {video.description && (
              <p className="text-lg md:text-xl text-white/85 max-w-2xl drop-shadow-lg leading-relaxed font-light tracking-wide">
                {video.description}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-6 flex-wrap">
              {/* Primary Button - Play */}
              <button
                onClick={handlePlayPause}
                className="group relative inline-flex items-center gap-3 px-8 md:px-10 py-4 md:py-5 rounded-full font-bold text-white text-base md:text-lg transition-all duration-300 overflow-hidden shadow-2xl hover:shadow-purple-500/50 hover:shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

                {/* Button content */}
                <div className="relative flex items-center gap-3">
                  <div className="p-1 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors">
                    {isPlaying ? (
                      <Pause className="w-5 h-5 md:w-6 md:h-6" />
                    ) : (
                      <Play className="w-5 h-5 md:w-6 md:h-6 ml-0.5" />
                    )}
                  </div>
                  <span className="font-bold tracking-wide">{isPlaying ? 'Pause' : 'Watch Now'}</span>
                </div>
              </button>

              {/* Secondary Button - Volume */}
              {isPlaying && (
                <button
                  onClick={handleMuteToggle}
                  className="group relative inline-flex items-center justify-center p-4 rounded-full transition-all duration-300 overflow-hidden backdrop-blur-xl border border-white/20 hover:border-white/40 hover:bg-white/10"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 md:w-6 md:h-6 text-white transition-transform group-hover:scale-110" />
                    ) : (
                      <Volume2 className="w-5 h-5 md:w-6 md:h-6 text-white transition-transform group-hover:scale-110" />
                    )}
                  </div>
                </button>
              )}
            </div>

            {/* Info Stats */}
            <div className="flex items-center gap-6 pt-6 flex-wrap text-sm">
              <div className="glass px-4 py-2.5 rounded-full backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all group/stat">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-white/90 font-semibold">4K Ultra HD</span>
                </div>
              </div>

              <div className="glass px-4 py-2.5 rounded-full backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all group/stat">
                <span className="text-white/90 font-semibold">Premium Quality</span>
              </div>

              <div className="glass px-4 py-2.5 rounded-full backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all group/stat">
                <span className="text-white/90 font-semibold">No Ads</span>
              </div>
            </div>
          </div>
        </div>

        {/* Playing Indicator */}
        {isPlaying && (
          <div className="absolute top-8 left-8 z-20 animate-slide-in">
            <div className="glass px-4 py-2.5 rounded-full flex items-center gap-2.5 backdrop-blur-xl border border-red-500/30 bg-red-500/10">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
              <span className="text-sm font-bold text-white uppercase tracking-wider">Now Playing</span>
            </div>
          </div>
        )}

        {/* Vignette effect */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>
    </section>
  )
}
