'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
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
  Zap,
  Copy,
  Lock,
  AlertCircle
} from 'lucide-react'

interface Subscription {
  id: number
  code: string | null
  credit: number
  duration: 'ONE_MONTH' | 'SIX_MONTHS' | 'ONE_YEAR'
  status: 'ACTIVE' | 'SOLD_OUT' | 'EXPIRED' | 'CANCELLED'
  createdAt: string
}

interface Channel {
  id: number
  name: string
  logo: string
  description: string
  category: 'IPTV' | 'STREAMING'
  createdAt: string
}

export default function SubscriptionDetailPage() {
  const [credits, setCredits] = useState(150)
  const [userEmail, setUserEmail] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const router = useRouter()
  const params = useParams()
  const channelId = parseInt(params.id as string)

  const [channel, setChannel] = useState<Channel | null>(null)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [contentLoading, setContentLoading] = useState(true)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [copiedCodeId, setCopiedCodeId] = useState<number | null>(null)

  const durationLabels: Record<string, string> = {
    'ONE_MONTH': '1 Month',
    'SIX_MONTHS': '6 Months',
    'ONE_YEAR': '1 Year'
  }

  const durationShortLabels: Record<string, string> = {
    'ONE_MONTH': '1M',
    'SIX_MONTHS': '6M',
    'ONE_YEAR': '1Y'
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setContentLoading(true)
        const res = await fetch(`/api/catalog/channels?id=${channelId}`)
        if (res.ok) {
          const d = await res.json().catch(() => ({}))
          const ch = d.channel
          if (ch && mounted) {
            setChannel({
              id: ch.id,
              name: ch.name,
              logo: ch.logo || 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg',
              description: ch.description || '',
              category: ch.category,
              createdAt: ch.createdAt
            })
          }
        }
      } catch (err) {
        console.error(err)
      }
    })()
    return () => { mounted = false }
  }, [channelId])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch(`/api/catalog/subscriptions/${channelId}`)
        if (res.ok) {
          const d = await res.json().catch(() => ({}))
          const subs = Array.isArray(d.subscriptions) ? d.subscriptions : []
          if (mounted) {
            setSubscriptions(subs)
            if (subs.length > 0) {
              setSelectedSubscription(subs[0])
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

    const wl = localStorage.getItem('watchlist')
    if (wl) {
      try { setIsFavorite(JSON.parse(wl).includes(channelId)) } catch {}
    }
  }, [router, channelId])

  const getCategoryIcon = () => {
    return channel?.category === 'IPTV' ? <Tv className="w-5 h-5" /> : <Radio className="w-5 h-5" />
  }

  const handleSubscribe = async () => {
    if (!selectedSubscription || !channel) return

    if (credits < selectedSubscription.credit) {
      alert(`Insufficient credits! You need ${selectedSubscription.credit} credits but only have ${credits}. Please add more credits to your account.`)
      return
    }

    setIsPurchasing(true)
    try {
      const res = await fetch('/api/checkout/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          subscriptionId: selectedSubscription.id,
          userEmail
        })
      })

      if (res.ok) {
        const data = await res.json()
        const newCredits = credits - selectedSubscription.credit
        setCredits(newCredits)
        localStorage.setItem('userCredits', newCredits.toString())

        const message = selectedSubscription.code
          ? `✓ Successfully purchased!\n\nCode: ${selectedSubscription.code}\n\nView all your subscription details in your profile.`
          : `✓ Successfully subscribed to "${channel.name}"`
        alert(message)

        setSubscriptions((subs) =>
          subs.map((sub) =>
            sub.id === selectedSubscription.id
              ? { ...sub, status: 'SOLD_OUT' as const }
              : sub
          )
        )

        const availableSubs = subscriptions.filter((s) => s.status === 'ACTIVE' && s.id !== selectedSubscription.id)
        if (availableSubs.length > 0) {
          setSelectedSubscription(availableSubs[0])
        } else {
          setSelectedSubscription(null)
        }

        setTimeout(() => {
          router.push('/profile/subscriptions')
        }, 2000)
      } else {
        const err = await res.json().catch(() => ({}))
        alert(`Error: ${err.error || 'Failed to purchase subscription'}`)
      }
    } catch (error) {
      console.error(error)
      alert('An error occurred while processing your purchase.')
    } finally {
      setIsPurchasing(false)
    }
  }

  const handleFavoriteToggle = () => {
    setIsFavorite((prev) => {
      const next = !prev
      const raw = localStorage.getItem('watchlist')
      let ids: number[] = []
      if (raw) { try { ids = JSON.parse(raw) } catch { ids = [] } }
      if (next && !ids.includes(channelId)) ids.push(channelId)
      if (!next) ids = ids.filter((id) => id !== channelId)
      localStorage.setItem('watchlist', JSON.stringify(ids))
      return next
    })
  }

  const copyToClipboard = (code: string, id: number) => {
    navigator.clipboard.writeText(code)
    setCopiedCodeId(id)
    setTimeout(() => setCopiedCodeId(null), 2000)
  }

  const activeSubscriptions = subscriptions.filter((s) => s.status === 'ACTIVE')
  const soldOutCount = subscriptions.filter((s) => s.status === 'SOLD_OUT').length

  if (contentLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-white/60">Loading subscription details...</p>
        </main>
      </div>
    )
  }

  if (!channel || subscriptions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">No subscriptions available</h1>
          <p className="text-white/70 mb-6">This channel has no subscription codes available at the moment.</p>
          <a href="/dashboard" className="px-6 py-3 rounded-xl btn-primary text-white font-semibold inline-block">Back to Dashboard</a>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      

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
                src={channel.logo}
                alt={channel.name}
                fill
                className="object-cover"
              />

              {/* Category Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-full bg-black/70 text-white">
                {getCategoryIcon()}
                <span className="capitalize font-medium">{channel.category}</span>
              </div>
            </div>
          </div>

          {/* Subscription Details */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Title and Basic Info */}
              <div>
                <h1 className="text-4xl font-bold text-white mb-4">{channel.name}</h1>

                <div className="flex flex-wrap items-center gap-4 text-white/80 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(channel.createdAt).getFullYear()}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    <span>{subscriptions.length} Codes Available</span>
                  </div>

                  <div className="px-3 py-1 rounded-full bg-white/10 text-sm">
                    {channel.category}
                  </div>
                </div>

                <p className="text-white/70 text-lg leading-relaxed">
                  {channel.description}
                </p>
              </div>

              {/* Subscription Availability Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass rounded-xl p-4 border border-white/20">
                  <p className="text-white/60 text-sm mb-1">Available Codes</p>
                  <p className="text-3xl font-bold text-green-400">{activeSubscriptions.length}</p>
                </div>
                <div className="glass rounded-xl p-4 border border-white/20">
                  <p className="text-white/60 text-sm mb-1">Sold Out</p>
                  <p className="text-3xl font-bold text-orange-400">{soldOutCount}</p>
                </div>
              </div>

              {/* Subscription Codes Selection */}
              <div>
                <h3 className="text-2xl font-semibold text-white mb-4">Available Subscription Codes</h3>
                
                {activeSubscriptions.length === 0 ? (
                  <div className="glass rounded-xl p-6 border border-orange-500/30 bg-orange-500/5">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                      <p className="text-white/80">All subscription codes are currently sold out. Please check back later.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {activeSubscriptions.map((sub) => (
                      <label
                        key={sub.id}
                        className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                          selectedSubscription?.id === sub.id
                            ? 'bg-blue-500/20 border-blue-500'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <input
                          type="radio"
                          name="subscription"
                          checked={selectedSubscription?.id === sub.id}
                          onChange={() => setSelectedSubscription(sub)}
                          className="w-4 h-4"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-white">Subscription #{sub.id}</span>
                            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                              ACTIVE
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-white/70 mb-2">
                            <Clock className="w-3 h-3" />
                            {durationLabels[sub.duration]}
                          </div>

                          {sub.code && (
                            <div className="flex items-center gap-2 text-sm text-white/60">
                              <code className="bg-black/30 px-2 blur-[4px] py-1 rounded font-mono text-xs">
                                {sub.code.substring(0, 5)}...
                              </code>
                       
                              {copiedCodeId === sub.id && (
                                <span className="text-green-400 text-xs">Copied!</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <div className="text-white/60 text-xs mb-1">Price</div>
                          <div className="flex items-center gap-1 text-lg font-bold text-yellow-400">
                            <Coins className="w-4 h-4" />
                            {sub.credit}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
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
                {selectedSubscription && selectedSubscription.status === 'ACTIVE' ? (
                  <button
                    onClick={handleSubscribe}
                    disabled={credits < selectedSubscription.credit || isPurchasing}
                    className="px-8 py-3 rounded-xl btn-primary text-white font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {isPurchasing ? 'Processing...' : `Subscribe for ${selectedSubscription.credit} Credits`}
                  </button>
                ) : (
                  <button disabled className="px-8 py-3 rounded-xl bg-gray-600 text-white font-semibold flex items-center gap-2 cursor-not-allowed opacity-50">
                    <Lock className="w-5 h-5" />
                    No Available Codes
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

              {/* Price Summary */}
              {selectedSubscription && selectedSubscription.status === 'ACTIVE' && (
                <div className="glass rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white/80">Your Credits</span>
                    <div className="flex items-center gap-2 text-lg font-semibold text-yellow-400">
                      <Coins className="w-5 h-5" />
                      {credits}
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-white/80">Subscription Cost</span>
                      <div className="flex items-center gap-2 text-2xl font-bold text-white">
                        <Zap className="w-6 h-6 text-yellow-400" />
                        {selectedSubscription.credit}
                      </div>
                    </div>
                    <div className="border-t border-white/10 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white/80">Credits After Purchase</span>
                        <div className={`text-xl font-bold ${credits - selectedSubscription.credit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {credits - selectedSubscription.credit}
                        </div>
                      </div>
                    </div>
                    {credits >= selectedSubscription.credit ? (
                      <div className="mt-4 text-sm text-green-400">✓ You have enough credits to subscribe</div>
                    ) : (
                      <div className="mt-4 text-sm text-red-400">You need {selectedSubscription.credit - credits} more credits</div>
                    )}
                  </div>
                </div>
              )}
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
