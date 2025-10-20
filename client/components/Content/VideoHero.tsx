'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Play, Pause, Volume2, VolumeX, X } from 'lucide-react'

interface Video {
  id: number
  title: string
  description: string | null
  thumbnail: string | null
  videoUrl: string
  price: number
  createdAt: string
}

interface VideoHeroProps {
  featured: Video | null
}

export default function VideoHero({ featured }: VideoHeroProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showVideo, setShowVideo] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.play().catch(() => {
        console.error('Failed to play video')
        setIsPlaying(false)
      })
    } else {
      videoRef.current.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted
    }
  }, [isMuted])

  const handlePlayClick = () => {
    setShowVideo(true)
    setIsPlaying(true)
  }

  const handleCloseVideo = () => {
    setShowVideo(false)
    setIsPlaying(false)
  }

  if (!featured) {
    return null
  }

  return (
    <>
      <section className="relative w-full h-[560px] md:h-[720px] overflow-hidden group">
        {/* Background with thumbnail */}
        {featured.thumbnail ? (
          <Image
            src={featured.thumbnail}
            alt={featured.title}
            fill
            sizes="(max-width: 768px) 100vw, 1600px"
            className="object-cover brightness-60 group-hover:brightness-50 transition-all duration-500"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black" />
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />

        {/* Animated gradient accent */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="absolute inset-0 max-w-7xl mx-auto px-6 md:px-12 flex items-end md:items-center">
          <div className="py-12 md:py-20 w-full md:w-3/5 lg:w-1/2 space-y-6">
            {/* Badge */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span className="text-xs md:text-sm font-semibold text-red-500 uppercase tracking-widest">
                Featured Introduction
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-5xl md:text-7xl font-black leading-[1.1] text-white drop-shadow-lg">
                {featured.title}
              </h1>
            </div>

            {/* Description */}
            {featured.description && (
              <p className="text-white/80 text-base md:text-lg max-w-2xl leading-relaxed drop-shadow">
                {featured.description}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={handlePlayClick}
                className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 active:bg-red-800 px-8 py-4 rounded-full font-bold text-white shadow-2xl transition-all duration-300 hover:shadow-red-600/50 hover:scale-105"
              >
                <Play className="w-6 h-6 fill-white" />
                Watch Now
              </button>

              <button
                onClick={handlePlayClick}
                className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-8 py-4 rounded-full font-semibold text-white border border-white/30 transition-all duration-300"
              >
                <span>Learn More</span>
              </button>
            </div>

            {/* Info Row */}
            <div className="flex items-center gap-6 text-sm text-white/70 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
                  <span className="text-red-500 font-bold">HD</span>
                </div>
                <span>Premium Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                  <span className="text-blue-500 font-bold">4K</span>
                </div>
                <span>Available in 4K</span>
              </div>
              <div className="px-3 py-1 bg-white/5 rounded-full text-white/60">
                {new Date(featured.createdAt).getFullYear()}
              </div>
            </div>
          </div>
        </div>

        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-red-600/10 to-transparent rounded-full blur-3xl" />
      </section>

      {/* Video Player Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-6xl aspect-video rounded-2xl overflow-hidden shadow-2xl">
            {/* Close Button */}
            <button
              onClick={handleCloseVideo}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors shadow-lg"
              aria-label="Close video"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black to-transparent p-6 flex items-center justify-between opacity-0 hover:opacity-100 transition-opacity duration-300 group/controls">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-white" />
                  ) : (
                    <Play className="w-6 h-6 fill-white" />
                  )}
                </button>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="text-white text-sm font-medium">
                {featured.title}
              </div>
            </div>

            {/* Video Element */}
            <video
              ref={videoRef}
              src={featured.videoUrl}
              className="w-full h-full object-cover bg-black"
              onEnded={() => setIsPlaying(false)}
              controlsList="nodownload"
            />
          </div>
        </div>
      )}
    </>
  )
}
