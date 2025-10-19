'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Copy, Calendar, Zap, Check, Tv, Radio, AlertCircle, ArrowLeft } from 'lucide-react'
import Header from '../../../components/Layout/Header'

interface UserSubscription {
  id: number
  code: string | null
  status: string
  startDate: string
  endDate: string
  subscription: {
    id: number
    credit: number
    duration: string
    channel: {
      id: number
      name: string
      logo: string | null
      category: string
    }
  }
}

interface User {
  id: number
  name: string
  email: string
  username: string
  credits: number
  userSubscriptions: UserSubscription[]
}

export default function SubscriptionsPage() {
  const [data, setData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedCodeId, setCopiedCodeId] = useState<number | null>(null)
  const [credits, setCredits] = useState(0)
  const [userEmail, setUserEmail] = useState('')
  const router = useRouter()

  useEffect(() => {
    const storedCredits = localStorage.getItem('userCredits')
    const storedEmail = localStorage.getItem('userEmail')

    if (!storedEmail) {
      router.push('/')
      return
    }

    if (storedCredits) setCredits(parseInt(storedCredits))
    if (storedEmail) setUserEmail(storedEmail)
  }, [router])

  useEffect(() => {
    let mounted = true
    async function fetchOverview() {
      try {
        const res = await fetch('/api/user/overview', { credentials: 'include' })
        const d = await res.json()
        if (!res.ok) {
          router.push('/')
          return
        }
        if (mounted) {
          setData(d.user)
          setCredits(d.user.credits)
        }
      } catch (e) {
        router.push('/')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchOverview()
    return () => { mounted = false }
  }, [router])

  const copyToClipboard = (code: string, id: number) => {
    navigator.clipboard.writeText(code)
    setCopiedCodeId(id)
    setTimeout(() => setCopiedCodeId(null), 2000)
  }

  const formatDuration = (duration: string): string => {
    const map: Record<string, string> = {
      'ONE_MONTH': '1 Month',
      'SIX_MONTHS': '6 Months',
      'ONE_YEAR': '1 Year'
    }
    return map[duration] || duration
  }

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isSubscriptionExpired = (endDate: string): boolean => {
    return new Date(endDate) < new Date()
  }

  const getCategoryIcon = (category: string) => {
    return category === 'IPTV' ? <Tv className="w-4 h-4" /> : <Radio className="w-4 h-4" />
  }

  const activeSubscriptions = data?.userSubscriptions.filter(
    (sub) => !isSubscriptionExpired(sub.endDate)
  ) || []

  const expiredSubscriptions = data?.userSubscriptions.filter(
    (sub) => isSubscriptionExpired(sub.endDate)
  ) || []

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header credits={credits} userEmail={userEmail} />
        <main className="max-w-5xl mx-auto px-4 py-12">
          <p className="text-white/60">Loading subscriptions...</p>
        </main>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header credits={credits} userEmail={userEmail} />
        <main className="max-w-5xl mx-auto px-4 py-12 text-center">
          <p className="text-white/60">Not authenticated</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Header credits={credits} userEmail={userEmail} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Profile
        </button>

        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">My Subscriptions</h1>
          <p className="text-white/70">View and manage your active subscription codes</p>
        </div>

        {/* Active Subscriptions */}
        {activeSubscriptions.length > 0 ? (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Check className="w-6 h-6 text-green-400" />
              Active Subscriptions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeSubscriptions.map((userSub) => (
                <div
                  key={userSub.id}
                  className="glass rounded-2xl border border-green-500/30 bg-green-500/5 overflow-hidden"
                >
                  {/* Channel Header */}
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryIcon(userSub.subscription.channel.category)}
                          <span className="text-xs px-2 py-1 rounded-full bg-white/10">
                            {userSub.subscription.channel.category}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold">{userSub.subscription.channel.name}</h3>
                      </div>

                      {userSub.subscription.channel.logo && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={userSub.subscription.channel.logo}
                            alt={userSub.subscription.channel.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-6 space-y-4">
                    {/* Duration */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white/70">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Duration</span>
                      </div>
                      <span className="font-semibold">{formatDuration(userSub.subscription.duration)}</span>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Valid Until</span>
                      <div className="text-right">
                        <div className="font-semibold">{formatDate(userSub.endDate)}</div>
                        <div className="text-white/50 text-xs">
                          {Math.ceil((new Date(userSub.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white/70">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm">Credits Used</span>
                      </div>
                      <span className="font-semibold text-yellow-400">{userSub.subscription.credit}</span>
                    </div>

                    {/* Subscription Code */}
                    {userSub.code ? (
                      <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-xs text-white/60 mb-2">YOUR SUBSCRIPTION CODE</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-black/40 px-4 py-3 rounded-lg font-mono text-sm break-all">
                            {userSub.code}
                          </code>
                          <button
                            onClick={() => copyToClipboard(userSub.code!, userSub.id)}
                            className={`p-3 rounded-lg transition-colors flex-shrink-0 ${
                              copiedCodeId === userSub.id
                                ? 'bg-green-500/30 text-green-400'
                                : 'bg-white/10 hover:bg-white/20 text-white/80'
                            }`}
                            title="Copy code"
                          >
                            {copiedCodeId === userSub.id ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <Copy className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        {copiedCodeId === userSub.id && (
                          <p className="text-xs text-green-400 mt-2">✓ Copied to clipboard!</p>
                        )}
                      </div>
                    ) : (
                      <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-xs text-white/60">No subscription code available</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-12">
            <div className="glass rounded-2xl border border-orange-500/30 bg-orange-500/5 p-8 text-center">
              <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Active Subscriptions</h3>
              <p className="text-white/70 mb-6">
                You don't have any active subscriptions yet. Browse our streaming and IPTV channels to get started!
              </p>
              <div className="flex gap-4 justify-center">
                <a
                  href="/streaming"
                  className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                >
                  Browse Streaming
                </a>
                <a
                  href="/iptv"
                  className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
                >
                  Browse IPTV
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Expired Subscriptions */}
        {expiredSubscriptions.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-orange-400" />
              Expired Subscriptions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {expiredSubscriptions.map((userSub) => (
                <div
                  key={userSub.id}
                  className="glass rounded-2xl border border-white/10 opacity-60 overflow-hidden"
                >
                  {/* Channel Header */}
                  <div className="p-6 border-b border-white/10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryIcon(userSub.subscription.channel.category)}
                          <span className="text-xs px-2 py-1 rounded-full bg-white/10">
                            {userSub.subscription.channel.category}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold">{userSub.subscription.channel.name}</h3>
                      </div>

                      {userSub.subscription.channel.logo && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={userSub.subscription.channel.logo}
                            alt={userSub.subscription.channel.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white/70">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Validity Period</span>
                      </div>
                      <span className="text-sm">
                        {formatDate(userSub.startDate)} - {formatDate(userSub.endDate)}
                      </span>
                    </div>

                    <div className="text-center py-4">
                      <p className="text-sm text-white/50">This subscription has expired</p>
                      <p className="text-xs text-white/40 mt-1">
                        Expired on {formatDate(userSub.endDate)}
                      </p>
                    </div>

                    <div className="border-t border-white/10 pt-4">
                      <a
                        href={`/subscription/${userSub.subscription.channel.id}`}
                        className="block text-center px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                      >
                        Renew Subscription
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 flex items-center justify-between text-sm text-white/60">
          <div>© 2025 SMART SAT TV. All rights reserved.</div>
          <div>Need help? <a href="/support" className="underline">Contact Support</a></div>
        </div>
      </footer>
    </div>
  )
}
