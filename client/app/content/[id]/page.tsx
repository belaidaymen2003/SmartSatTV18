'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Header from '../../../components/Layout/Header'
import {
  Play,
  Star,
  Clock,
  Calendar,
  User,
  Heart,
  Share2,
  Download,
  ShoppingCart,
  Coins,
  ArrowLeft,
  Film,
  Tv,
  Radio,
  Gamepad2,
  X
} from 'lucide-react'
import ReviewsSection from '../../../components/Reviews/ReviewsSection'

interface ContentDetail {
  id: number
  title: string
  type: 'movie' | 'series' | 'live' | 'gaming'
  price: number
  rating: number
  image: string
  description: string
  duration?: string
  genre: string
  year?: number
  actors?: string[]
  director?: string
  trailer?: string
  longDescription?: string
  seasons?: number
  episodes?: number
}

export default function ContentDetailPage() {
  const [credits, setCredits] = useState(150)
  const [userEmail, setUserEmail] = useState('')
  const [isOwned, setIsOwned] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showTrailer, setShowTrailer] = useState(false)
  const router = useRouter()
  const params = useParams()
  const contentId = parseInt(params.id as string)

  const [contentDetails, setContentDetails] = useState<ContentDetail | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // try video first
        const videoRes = await fetch(`/api/catalog/video?id=${contentId}`)
        if (videoRes.ok) {
          const d = await videoRes.json().catch(() => ({}))
          const v = d.video
          if (v && mounted) {
            setContentDetails({
              id: v.id,
              title: v.title,
              type: 'movie',
              price: v.price ?? 0,
              rating: 4.5,
              image: v.thumbnail || '',
              description: v.description || '',
              longDescription: v.description || '',
              duration: v.runtime || undefined,
              genre: 'Streaming',
              year: v.createdAt ? new Date(v.createdAt).getFullYear() : undefined,
              trailer: v.videoUrl || undefined
            })
            return
          }
        }

        // fallback to iptv channel
        const chRes = await fetch(`/api/catalog/iptv?id=${contentId}`)
        if (chRes.ok) {
          const d = await chRes.json().catch(() => ({}))
          const c = d.channel
          if (c && mounted) {
            setContentDetails({
              id: c.id,
              title: c.name,
              type: 'live',
              price: c.price ?? 0,
              rating: 4.2,
              image: c.logo || '',
              description: c.description || '',
              duration: 'Live',
              genre: c.category || 'IPTV',
              year: c.createdAt ? new Date(c.createdAt).getFullYear() : undefined
            })
            return
          }
        }

        // fallback: not found
        if (mounted) setContentDetails(null)
      } catch (err) {
        console.error(err)
      }
    })()
    return () => { mounted = false }
  }, [contentId])


  useEffect(() => {
    const storedCredits = localStorage.getItem('userCredits')
    const storedEmail = localStorage.getItem('userEmail')

    if (!storedEmail) {
      router.push('/')
      return
    }
    if (!contentDetails) {
      router.push('/catalog')
      return
    }

    if (storedCredits) setCredits(parseInt(storedCredits))
    if (storedEmail) setUserEmail(storedEmail)

    const wl = localStorage.getItem('watchlist')
    if (wl) {
      try { setIsFavorite(JSON.parse(wl).includes(contentId)) } catch {}
    }
    const owned = localStorage.getItem('ownedContent')
    if (owned) {
      try { setIsOwned(JSON.parse(owned).includes(contentId)) } catch {}
    }
  }, [router, contentDetails, contentId])

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'movie': return <Film className="w-5 h-5" />
      case 'series': return <Tv className="w-5 h-5" />
      case 'live': return <Radio className="w-5 h-5" />
      case 'gaming': return <Gamepad2 className="w-5 h-5" />
      default: return <Play className="w-5 h-5" />
    }
  }

  const handlePurchase = () => {
    if (!contentDetails) return
    if (credits >= contentDetails.price) {
      const newCredits = credits - contentDetails.price
      setCredits(newCredits)
      localStorage.setItem('userCredits', newCredits.toString())
      setIsOwned(true)
      const ownedRaw = localStorage.getItem('ownedContent')
      let ownedIds: number[] = []
      if (ownedRaw) { try { ownedIds = JSON.parse(ownedRaw) } catch { ownedIds = [] } }
      if (!ownedIds.includes(contentDetails.id)) ownedIds.push(contentDetails.id)
      localStorage.setItem('ownedContent', JSON.stringify(ownedIds))
      alert(`Successfully purchased "${contentDetails.title}" for ${contentDetails.price} credits!`)
    } else {
      alert('Insufficient credits! Please add more credits to your account.')
    }
  }

  const handleWatch = () => {
    if (!contentDetails) return
    router.push(`/player/${contentDetails.id}`)
  }

  const handleFavoriteToggle = () => {
    setIsFavorite((prev) => {
      const next = !prev
      const raw = localStorage.getItem('watchlist')
      let ids: number[] = []
      if (raw) { try { ids = JSON.parse(raw) } catch { ids = [] } }
      if (contentDetails) {
        if (next && !ids.includes(contentDetails.id)) ids.push(contentDetails.id)
        if (!next) ids = ids.filter((id) => id !== contentDetails.id)
        localStorage.setItem('watchlist', JSON.stringify(ids))
      }
      return next
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header credits={credits} userEmail={userEmail} />

      {!contentDetails ? (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Content not found</h1>
          <p className="text-white/70 mb-6">The requested title does not exist or was removed.</p>
          <a href="/catalog" className="px-6 py-3 rounded-xl btn-primary text-white font-semibold inline-block">Back to Catalog</a>
        </main>
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={() => history.length > 1 ? router.back() : (window.location.href = '/catalog')}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Catalog
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Content Image */}
            <div className="lg:col-span-1">
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden">
                <Image
                  src={contentDetails.image}
                  alt={contentDetails.title}
                  fill
                  className="object-cover"
                />

                {/* Category Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-full bg-black/70 text-white">
                  {getCategoryIcon(contentDetails.type)}
                  <span className="capitalize font-medium">{contentDetails.type}</span>
                </div>

                {/* Rating */}
                <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-2 rounded-full bg-black/70 text-white">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{contentDetails.rating}</span>
                </div>
              </div>
            </div>

            {/* Content Details */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Title and Basic Info */}
                <div>
                  <h1 className="text-4xl font-bold text-white mb-4">{contentDetails.title}</h1>

                  <div className="flex flex-wrap items-center gap-4 text-white/80 mb-4">
                    {contentDetails.year && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{contentDetails.year}</span>
                      </div>
                    )}

                    {contentDetails.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{contentDetails.duration}</span>
                      </div>
                    )}

                    <div className="px-3 py-1 rounded-full bg-white/10 text-sm">
                      {contentDetails.genre}
                    </div>
                  </div>

                  <p className="text-white/60 text-lg leading-relaxed">
                    {contentDetails.description}
                  </p>
                </div>

                {/* Long Description */}
                {contentDetails.longDescription && (
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">Synopsis</h3>
                    <p className="text-white/80 leading-relaxed">
                      {contentDetails.longDescription}
                    </p>
                  </div>
                )}

                {/* Cast and Crew */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {contentDetails.director && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Director</h3>
                      <p className="text-white/80">{contentDetails.director}</p>
                    </div>
                  )}

                  {contentDetails.actors && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Cast</h3>
                      <div className="flex flex-wrap gap-2">
                        {contentDetails.actors.map((actor, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm"
                          >
                            {actor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-4">
                  {isOwned ? (
                    <button
                      onClick={handleWatch}
                      className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold flex items-center gap-2 hover:from-green-600 hover:to-emerald-700 transition-all"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      Watch Now
                    </button>
                  ) : (
                    <button
                      onClick={handlePurchase}
                      disabled={credits < contentDetails.price}
                      className="px-8 py-3 rounded-xl btn-primary text-white font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Buy for {contentDetails.price} Credits
                    </button>
                  )}

                  {contentDetails.trailer && (
                    <button onClick={() => setShowTrailer(true)} className="px-6 py-3 rounded-xl glass border border-white/20 text-white font-medium flex items-center gap-2 hover:bg-white/10 transition-colors">
                      <Play className="w-5 h-5" />
                      Watch Trailer
                    </button>
                  )}

                  <button
                    onClick={handleFavoriteToggle}
                    className={`p-3 rounded-xl border transition-colors ${
                      isFavorite
                        ? 'bg-red-500/20 border-red-500/30 text-red-400'
                        : 'glass border-white/20 text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>

                  <button className="p-3 rounded-xl glass border border-white/20 text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Price Info */}
                {!isOwned && (
                  <div className="glass rounded-xl p-6 border border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">Purchase this content</h3>
                        <p className="text-white/60">Watch unlimited times after purchase</p>
                      </div>
                      <div className="flex items-center gap-2 text-2xl font-bold text-white">
                        <Coins className="w-6 h-6 text-yellow-400" />
                        {contentDetails.price}
                      </div>
                    </div>
                  </div>
                )}

                {/* Reviews */}
                <div className="pt-6">
                  <ReviewsSection contentId={contentDetails.id} contentTitle={contentDetails.title} userEmail={userEmail} />
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* Trailer Modal */}
      {showTrailer && contentDetails?.trailer && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4">
          <div className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden glass border border-white/20">
            <button onClick={() => setShowTrailer(false)} className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 hover:bg-black/80">
              <X className="w-5 h-5 text-white" />
            </button>
            <video src={contentDetails.trailer} className="w-full h-full object-contain bg-black" controls autoPlay playsInline />
          </div>
        </div>
      )}
    </div>
  )
}
