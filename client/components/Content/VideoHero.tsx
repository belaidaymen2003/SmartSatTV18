'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Play, Volume2, VolumeX, X } from 'lucide-react'
import MagneticButton from '../UI/MagneticButton'

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

  const handleClose = () => {
    setIsPlaying(false)
  }

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative w-full h-[560px] md:h-[720px] bg-black/90">
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
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

        {/* Premium Badge */}
        <div className="absolute top-6 right-6 z-20">
          <span className="inline-block px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-full backdrop-blur-md">
            PREMIUM INTRODUCTION
          </span>
        </div>

        {/* Content */}
        <div className="absolute inset-0 max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-end justify-end md:justify-center">
          <div className="w-full md:w-2/3 lg:w-1/2 pb-12 md:pb-20">
            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-white drop-shadow-lg">
              {video.title}
            </h1>

            {/* Description */}
            {video.description && (
              <p className="mt-4 text-white/90 max-w-xl text-base md:text-lg drop-shadow-md">
                {video.description}
              </p>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex items-center gap-4 flex-wrap">
              <button
                onClick={handlePlayPause}
                className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 transition-colors px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold shadow-lg text-white hover:shadow-xl transform hover:scale-105 duration-200"
              >
                <Play className="w-5 h-5 md:w-6 md:h-6" />
                <span className="text-base md:text-lg">{isPlaying ? 'Pause' : 'Watch Now'}</span>
              </button>

              <button
                onClick={handleMuteToggle}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-3 rounded-full font-semibold shadow-lg text-white transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              {isPlaying && (
                <button
                  onClick={handleClose}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-3 rounded-full font-semibold shadow-lg text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Info Bar */}
            <div className="mt-8 flex items-center gap-4 text-sm text-white/70 flex-wrap">
              <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full">Premium Quality</div>
              <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full">4K Ready</div>
              <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full">No Ads</div>
            </div>
          </div>
        </div>

        {/* Video Playing Indicator */}
        {isPlaying && (
          <div className="absolute top-6 left-6 z-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/90 text-white text-sm font-semibold rounded-full backdrop-blur-md animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Now Playing
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
