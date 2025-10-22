'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Play, Volume2, VolumeX, Pause, Star, Zap } from 'lucide-react'

interface Video {
  id: number
  title: string
  description?: string
  thumbnail?: string
  videoUrl: string
  price: number
}

interface VideoHeroProps {
  videos: Video[]
}

export default function VideoHero({ videos }: VideoHeroProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(videos?.[0] || null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
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

  if (!videos || videos.length === 0) {
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

  const thumbnailVideos = videos.slice(1, 6)
  const remainingVideos = videos.slice(1)

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative w-full min-h-[600px] md:min-h-[720px] bg-gradient-to-br from-slate-950 via-purple-950/30 to-slate-900 overflow-hidden">
        {/* Main Featured Video Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-24 relative z-10">
          {/* Large Featured Video */}
          <div className="lg:col-span-2 flex flex-col justify-center space-y-8 animate-fade-in">
            {/* Featured Video Container */}
            <div
              ref={containerRef}
              className="relative w-full h-[320px] md:h-[480px] rounded-2xl overflow-hidden group border border-white/20 shadow-2xl"
            >
              {/* Video/Thumbnail Background */}
              {isPlaying && selectedVideo ? (
                <video
                  ref={videoRef}
                  src={selectedVideo.videoUrl}
                  className="absolute inset-0 w-full h-full object-cover"
                  muted={isMuted}
                  autoPlay
                  playsInline
                />
              ) : selectedVideo?.thumbnail ? (
                <Image
                  src={selectedVideo.thumbnail}
                  alt={selectedVideo.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-slate-900" />
              )}

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Play Button Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center group-hover:bg-black/20 transition-colors duration-300">
                  <button
                    onClick={handlePlayPause}
                    className="relative group/btn inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/30 transition-all duration-300 shadow-2xl"
                  >
                    <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-white ml-1 group-hover/btn:scale-110 transition-transform" />
                  </button>
                </div>
              )}

              {/* Controls Bar */}
              {isPlaying && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white/80 text-sm font-semibold">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    Now Playing
                  </div>
                  <button
                    onClick={handleMuteToggle}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Video Info */}
            {selectedVideo && (
              <div className="space-y-6 animate-slide-in">
                {/* Premium Badge */}
                <div className="inline-flex items-center gap-2">
                  <div className="glass px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-xl border border-white/20">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-xs font-bold text-white/90 uppercase tracking-wide">Premium Introduction</span>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <h1 className="text-4xl md:text-5xl font-black leading-tight text-white drop-shadow-2xl">
                    {selectedVideo.title}
                  </h1>
                  <div className="h-1 w-20 bg-gradient-to-r from-purple-500 via-blue-500 to-transparent rounded-full" />
                </div>

                {/* Description */}
                {selectedVideo.description && (
                  <p className="text-base md:text-lg text-white/85 max-w-2xl drop-shadow-lg leading-relaxed font-light">
                    {selectedVideo.description}
                  </p>
                )}

                {/* Info Stats */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="glass px-4 py-2.5 rounded-full backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-white/90 font-semibold text-sm">4K Ultra HD</span>
                    </div>
                  </div>

                  <div className="glass px-4 py-2.5 rounded-full backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all">
                    <span className="text-white/90 font-semibold text-sm">Premium Quality</span>
                  </div>

                  <div className="glass px-4 py-2.5 rounded-full backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all">
                    <span className="text-white/90 font-semibold text-sm">No Ads</span>
                  </div>
                </div>

                {/* Watch Now Button */}
                <button
                  onClick={handlePlayPause}
                  className="group relative inline-flex items-center gap-3 px-8 md:px-10 py-4 rounded-full font-bold text-white text-base transition-all duration-300 overflow-hidden shadow-2xl hover:shadow-purple-500/50 w-fit"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
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
              </div>
            )}
          </div>

          {/* Right Side: Solitaire-Style Video Thumbnails */}
          <div className="hidden lg:block relative w-full h-[480px]">
            {/* Solitaire Card Stack */}
            <div className="relative w-full h-full">
              {remainingVideos.map((video, index) => {
                // Calculate rotation and position for solitaire effect
                const totalCards = remainingVideos.length
                const angle = (index - Math.floor(totalCards / 2)) * 8 // Spread cards in a fan
                const offsetX = index * 12 - (totalCards - 1) * 6 // Slight horizontal offset
                const offsetY = Math.abs(index - Math.floor(totalCards / 2)) * 8 // Vertical fan effect

                return (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className={`absolute transition-all duration-300 cursor-pointer group ${
                      selectedVideo?.id === video.id ? 'z-40' : 'z-' + (30 - index)
                    }`}
                    style={{
                      transform: `translate(${offsetX}px, ${offsetY}px) rotate(${angle}deg)`,
                      width: '140px',
                      height: '200px',
                      right: `${index * 8}px`,
                      bottom: '0px',
                    }}
                  >
                    {/* Card Container */}
                    <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl group-hover:border-blue-400 group-hover:shadow-blue-500/30 group-hover:scale-110 transition-all duration-300 bg-slate-900">
                      {/* Thumbnail Image */}
                      {video.thumbnail ? (
                        <Image
                          src={video.thumbnail}
                          alt={video.title}
                          fill
                          sizes="140px"
                          className="object-cover group-hover:brightness-110 transition-all duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-900/60 via-blue-900/60 to-slate-900" />
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Play Icon on Hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                        </div>
                      </div>

                      {/* Video Title Tooltip */}
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-xs font-semibold text-white line-clamp-2">{video.title}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Decorative Gradient Orb */}
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none" style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }} />
          </div>
        </div>

        {/* Mobile: Carousel-style Thumbnails */}
        <div className="lg:hidden max-w-7xl mx-auto px-6 md:px-12 pb-8">
          {remainingVideos.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold text-sm uppercase tracking-widest">More Videos</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {remainingVideos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className={`flex-shrink-0 relative rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      selectedVideo?.id === video.id
                        ? 'w-24 h-32 border-blue-400 shadow-lg shadow-blue-500/30'
                        : 'w-20 h-28 border-white/20 hover:border-white/40'
                    }`}
                  >
                    {video.thumbnail ? (
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        sizes="96px"
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-900/60 to-slate-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white fill-white" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Vignette Effect */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />
      </div>

      {/* CSS for fade-in animation */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-slide-in {
          animation: slide-in 0.8s ease-out 0.2s both;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}
