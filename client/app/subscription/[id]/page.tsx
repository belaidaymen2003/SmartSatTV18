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
  Heart,
  Share2,
  ShoppingCart,
  Coins,
  ArrowLeft,
  Radio,
  Tv,
  Check,
  Package,
  Zap
} from 'lucide-react'

interface SubscriptionDetail {
  id: number
  name: string
  logo: string
  description: string
  category: 'IPTV' | 'STREAMING'
  createdAt: string
  subscriptions: Array<{
    id: number
    credit: number
    duration: 'ONE_MONTH' | 'SIX_MONTHS' | 'ONE_YEAR'
    status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
  }>
}

interface ContentDetail {
  id: number
  title: string
  category: 'IPTV' | 'STREAMING'
  price: number
  rating: number
  image: string
  description: string
  duration: string
  year: number
}

export default function SubscriptionDetailPage() {
  const [credits, setCredits] = useState(150)
  const [userEmail, setUserEmail] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const router = useRouter()
  const params = useParams()
  const channelId = parseInt(params.id as string)

  const [contentDetails, setContentDetails] = useState<ContentDetail | null>(null)
  const [contentLoading, setContentLoading] = useState(true)
  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null)

  const durationLabels: Record<string, string> = {
    'ONE_MONTH': '1 Month',
    'SIX_MONTHS': '6 Months',
    'ONE_YEAR': '1 Year'
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setContentLoading(true)
        const res = await fetch(`/api/catalog/channels?id=${channelId}`)
        if (res.ok) {
          const d = await res.json().catch(() => ({}))
          const channel = d.channel
          if (channel && mounted) {
            const activeSubscription = channel.subscriptions?.[0]
            setContentDetails({
              id: channel.id,
              title: channel.name,
              category: channel.category,
              price: activeSubscription?.credit ?? 0,
              rating: 4.5,
              image: channel.logo || 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg',
              description: channel.description || '',
              duration: activeSubscription?.duration ? durationLabels[activeSubscription.duration] : 'Monthly',
              year: new Date(channel.createdAt).getFullYear()
            })
            if (activeSubscription) {
              setSelectedSubscription(activeSubscription.id.toString())
            }
          }
        }
        if (mounted) setContentLoading(false)
      } catch (err) {
        console.error(err)
        if (mounted) setContentLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [channelId])

  useEffect(() => {
    const storedCredits = localStorage.getItem('userCredits')
    const storedEmail = localStorage.getItem('userEmail')

    if (!storedEmail) {
      router.push('/')
      return
    }

    if (storedCredits) setCredits(parseInt(storedCredits))
    if (storedEmail) setUserEmail(storedEmail)

    if (!contentLoading && !contentDetails) {
      router.push(contentDetails?.category === 'IPTV' ? '/iptv' : '/streaming')
      return
    }

    const wl = localStorage.getItem('watchlist')
    if (wl) {
      try { setIsFavorite(JSON.parse(wl).includes(channelId)) } catch {}
    }
  }, [router, contentDetails, channelId, contentLoading])

  const getCategoryIcon = () => {
    return contentDetails?.category === 'IPTV' ? <Tv className="w-5 h-5" /> : <Radio className="w-5 h-5" />
  }

  const handleSubscribe = () => {
    if (!contentDetails || !selectedSubscription) return
    if (credits >= contentDetails.price) {
      const newCredits = credits - contentDetails.price
      setCredits(newCredits)
      localStorage.setItem('userCredits', newCredits.toString())
      const owned = localStorage.getItem('ownedSubscriptions')
      let ownedIds: number[] = []
      if (owned) { try { ownedIds = JSON.parse(owned) } catch { ownedIds = [] } }
      if (!ownedIds.includes(contentDetails.id)) ownedIds.push(contentDetails.id)
      localStorage.setItem('ownedSubscriptions', JSON.stringify(ownedIds))
      alert(`Successfully subscribed to "${contentDetails.title}" for ${contentDetails.price} credits!`)
    } else {
      alert('Insufficient credits! Please add more credits to your account.')
    }
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

  if (contentLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header credits={credits} userEmail={userEmail} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-white/60">Loading subscription details...</p>
        </main>
      </div>
    )
  }

  if (!contentDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header credits={credits} userEmail={userEmail} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Subscription not found</h1>
          <p className="text-white/70 mb-6">The requested subscription does not exist or was removed.</p>
          <a href="/dashboard" className="px-6 py-3 rounded-xl btn-primary text-white font-semibold inline-block">Back to Dashboard</a>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header credits={credits} userEmail={userEmail} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Go Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Channel Logo */}
          <div className="lg:col-span-1">
            <div className="relative aspect-square rounded-2xl overflow-hidden sticky top-8">
              <Image
                src={contentDetails.image}
                alt={contentDetails.title}
                fill
                className="object-cover"
              />

              {/* Category Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-full bg-black/70 text-white">
                {getCategoryIcon()}
                <span className="capitalize font-medium">{contentDetails.category}</span>
              </div>
            </div>
          </div>

          {/* Subscription Details */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Title and Basic Info */}
              <div>
                <h1 className="text-4xl font-bold text-white mb-4">{contentDetails.title}</h1>

                <div className="flex flex-wrap items-center gap-4 text-white/80 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{contentDetails.year}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    <span>{contentDetails.duration}</span>
                  </div>

                  <div className="px-3 py-1 rounded-full bg-white/10 text-sm">
                    {contentDetails.category}
                  </div>
                </div>

                <p className="text-white/70 text-lg leading-relaxed">
                  {contentDetails.description}
                </p>
              </div>

              {/* Subscription Plans */}
              <div>
                <h3 className="text-2xl font-semibold text-white mb-4">Subscription Plans</h3>
                <div className="space-y-3">
                  {[
                    { id: '1', duration: 'ONE_MONTH', label: '1 Month', savings: null },
                    { id: '2', duration: 'SIX_MONTHS', label: '6 Months', savings: 'Save 15%' },
                    { id: '3', duration: 'ONE_YEAR', label: '1 Year', savings: 'Save 25%' }
                  ].map((plan) => (
                    <label
                      key={plan.id}
                      className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                        selectedSubscription === plan.id
                          ? 'bg-blue-500/20 border-blue-500'
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name="subscription"
                        value={plan.id}
                        checked={selectedSubscription === plan.id}
                        onChange={(e) => setSelectedSubscription(e.target.value)}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-white">{plan.label}</div>
                        <div className="text-white/60 text-sm">Continuous access for {plan.label.toLowerCase()}</div>
                      </div>
                      {plan.savings && (
                        <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
                          {plan.savings}
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">What's Included</h3>
                <div className="space-y-2">
                  {[
                    'Unlimited streaming access',
                    'Premium HD quality',
                    'Watch on multiple devices',
                    'Ad-free experience',
                    '24/7 customer support'
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-white/80">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  onClick={handleSubscribe}
                  disabled={credits < contentDetails.price}
                  className="px-8 py-3 rounded-xl btn-primary text-white font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Subscribe for {contentDetails.price} Credits
                </button>

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

              {/* Price Summary */}
              <div className="glass rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/80">Your Credits</span>
                  <div className="flex items-center gap-2 text-lg font-semibold text-yellow-400">
                    <Coins className="w-5 h-5" />
                    {credits}
                  </div>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Subscription Cost</span>
                    <div className="flex items-center gap-2 text-2xl font-bold text-white">
                      <Zap className="w-6 h-6 text-yellow-400" />
                      {contentDetails.price}
                    </div>
                  </div>
                  {credits >= contentDetails.price ? (
                    <div className="mt-4 text-sm text-green-400">✓ You have enough credits to subscribe</div>
                  ) : (
                    <div className="mt-4 text-sm text-red-400">You need {contentDetails.price - credits} more credits</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-between text-sm text-white/60">
          <div>© 2025 SMART SAT TV. All rights reserved.</div>
          <div>Need help? <a href="/support" className="underline">Contact Support</a></div>
        </div>
      </footer>
    </div>
  )
}
