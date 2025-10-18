'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../components/Layout/Header'
import { 
  Play,
  Zap,
  Users,
  Star,
  Clock,
  TrendingUp,
  Infinity,
  Download
} from 'lucide-react'

interface StreamingPlan {
  id: number
  title: string
  duration: 'monthly' | 'quarterly' | 'annual'
  price: number
  rating?: number
  image: string
  description: string
  features: string[]
  savings?: string
}

export default function StreamingPage() {
  const [credits, setCredits] = useState(150)
  const [userEmail, setUserEmail] = useState('')
  const [selectedDuration, setSelectedDuration] = useState('all')
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

  const [streamingPlans, setStreamingPlans] = useState<StreamingPlan[]>([])
  const [totalPlans, setTotalPlans] = useState(0)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const params = new URLSearchParams()
        params.set('page', '1')
        params.set('pageSize', '100')
        const res = await fetch(`/api/catalog/streaming?${params.toString()}`)
        const d = await res.json().catch(() => ({}))
        const videos = Array.isArray(d.videos) ? d.videos : []
        if (!mounted) return
        const mapped = videos.map((v: any) => ({
          id: v.id,
          title: v.title || 'Stream',
          duration: 'monthly' as const,
          price: v.price ?? 0,
          rating: 4.5,
          image: v.thumbnail || '',
          description: v.description || '',
          features: (v.description ? String(v.description).split('.').slice(0,5).map(s => s.trim()).filter(Boolean) : []),
          savings: undefined,
        }))
        setStreamingPlans(mapped)
        setTotalPlans(d.total || mapped.length)
      } catch (err) {
        console.error(err)
      }
    })()
    return () => { mounted = false }
  }, [])


  const durations = [
    { id: 'all', label: 'All Plans' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'quarterly', label: '3-6 Months' },
    { id: 'annual', label: 'Annual' }
  ]

  const filteredPlans = selectedDuration === 'all' 
    ? streamingPlans 
    : streamingPlans.filter(p => p.duration === selectedDuration)

  const handleSubscribe = (plan: StreamingPlan) => {
    if (credits >= plan.price) {
      const newCredits = credits - plan.price
      setCredits(newCredits)
      localStorage.setItem('userCredits', newCredits.toString())
      alert(`Successfully subscribed to "${plan.title}" for ${plan.price} credits!`)
    } else {
      alert('Insufficient credits! Please add more credits to your account.')
    }
  }

  const stats = [
    { label: 'Total Plans', value: totalPlans.toString(), icon: <Zap className="w-5 h-5" /> },
    { label: 'Active Members', value: '500K+', icon: <Users className="w-5 h-5" /> },
    { label: 'Avg Rating', value: '4.8★', icon: <Star className="w-5 h-5" /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Header credits={credits} userEmail={userEmail} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">Streaming Subscriptions</h1>
          <p className="text-xl text-blue-200 max-w-2xl">
            Choose the perfect streaming plan with unlimited access to movies, series, and live content
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="glass rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className="text-blue-400">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Duration Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {durations.map((dur) => (
              <button
                key={dur.id}
                onClick={() => setSelectedDuration(dur.id)}
                className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all font-medium ${
                  selectedDuration === dur.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
                }`}
              >
                <Zap className="w-5 h-5" />
                {dur.label}
              </button>
            ))}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="glass rounded-xl overflow-hidden border border-white/10 hover:border-blue-400 transition-all duration-300 group relative"
            >
              {/* Savings Badge */}
              {plan.savings && (
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-green-500 text-white text-xs font-semibold z-10">
                  {plan.savings}
                </div>
              )}

              {/* Plan Image */}
              <div className="relative h-48 overflow-hidden bg-white/5">
                <img
                  src={plan.image}
                  alt={plan.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Rating */}
                {plan.rating && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/70 px-2 py-1 rounded text-xs text-yellow-400">
                    <Star className="w-3 h-3 fill-current" />
                    {plan.rating}
                  </div>
                )}
              </div>

              {/* Plan Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{plan.title}</h3>
                <p className="text-white/60 text-sm mb-4">{plan.description}</p>
                
                <div className="mb-4 space-y-2">
                  {plan.features.slice(0, 3).map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      {feature}
                    </div>
                  ))}
                  {plan.features.length > 3 && (
                    <div className="text-xs text-white/50 pt-2">
                      +{plan.features.length - 3} more features
                    </div>
                  )}
                </div>

                {/* Price and Button */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <p className="text-white/60 text-xs mb-1">Price</p>
                    <p className="text-2xl font-bold text-blue-400">{plan.price}</p>
                    <p className="text-white/60 text-xs">Credits</p>
                  </div>
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={credits < plan.price}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      credits >= plan.price
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:scale-105'
                        : 'bg-white/10 text-white/50 cursor-not-allowed'
                    }`}
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPlans.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/60">No plans found in this category</p>
          </div>
        )}
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
