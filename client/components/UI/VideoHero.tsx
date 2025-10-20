'use client'

import { useState, useRef } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'

interface Video {
  id: number
  title: string
  description?: string
  thumbnail?: string
  videoUrl: string
  price: number
  createdAt: string
  user?: {
    id: number
    name: string
    email: string
  }
}

interface VideoHeroProps {
  video: Video
  onPlay?: (videoId: number) => void
}

export default function VideoHero({ video, onPlay }: VideoHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isHovering, setIsHovering] = useState(false)

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
        onPlay?.(video.id)
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  return (
    <div
      className="relative w-full h-[560px] md:h-[720px] overflow-hidden group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={video.videoUrl}
        poster={video.thumbnail || undefined}
        className="w-full h-full object-cover"
        loop
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Controls Overlay - Show on hover or when not playing */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          isHovering || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          onClick={handlePlayPause}
          className="relative group/btn"
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
        >
          <div className="absolute inset-0 rounded-full bg-red-600/20 blur-2xl animate-pulse-custom" />
          <div className="relative w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all duration-300 transform hover:scale-110 shadow-2xl">
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white fill-white ml-1" />
            ) : (
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            )}
          </div>
        </button>
      </div>

      {/* Volume Control - Bottom right */}
      {isPlaying && isHovering && (
        <button
          onClick={handleMute}
          className="absolute bottom-6 right-6 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all duration-300 z-20"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
      )}

      {/* Content - Bottom left */}
      <div className="absolute inset-0 max-w-7xl mx-auto px-6 md:px-12 flex items-end">
        <div className="py-12 md:py-20 w-full md:w-2/3 lg:w-1/2">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">{video.title}</h1>
          {video.description && (
            <p className="mt-4 text-white/80 max-w-xl line-clamp-3">{video.description}</p>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={handlePlayPause}
              className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-full font-semibold shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              <Play className="w-5 h-5 fill-white" />
              {isPlaying ? 'Playing' : 'Watch Now'}
            </button>

            {video.price > 0 && (
              <div className="text-sm text-white/70 px-4 py-2 bg-white/5 rounded-full">
                {video.price} Credits
              </div>
            )}
          </div>

          {/* Info Tags */}
          <div className="mt-6 flex items-center gap-4 text-sm text-white/60 flex-wrap">
            <div className="px-3 py-1 bg-white/5 rounded-full">Introduction</div>
            <div className="px-3 py-1 bg-white/5 rounded-full">HD</div>
            {video.user && (
              <div className="px-3 py-1 bg-white/5 rounded-full">by {video.user.name}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
