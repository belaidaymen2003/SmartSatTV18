'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../components/Layout/Header'
import { 
  Tv,
  Radio,
  Satellite,
  Globe,
  Users,
  Star,
  Clock,
  TrendingUp
} from 'lucide-react'

interface IPTVPackage {
  id: number
  title: string
  category: string
  price: number
  rating?: number
  image: string
  description: string
  channels: number
  quality: string
  details?: string
}

export default function IPTVPage() {
  const [credits, setCredits] = useState(150)
  const [userEmail, setUserEmail] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
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

  const [iptvPackages, setIptvPackages] = useState<IPTVPackage[]>([])
  const [totalPackages, setTotalPackages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setIsLoading(true)
        const params = new URLSearchParams()
        params.set('page', '1')
        params.set('pageSize', '100')
        params.set('category', 'iptv')
        const res = await fetch(`/api/catalog/channels?${params.toString()}`)
        const d = await res.json().catch(() => ({}))
        const channels = Array.isArray(d.channels) ? d.channels : []
        if (!mounted) return
        const mapped = channels.map((c: any) => ({
          id: c.id,
          title: c.name,
          category: (c.category || 'IPTV').toLowerCase(),
          price: c.price ?? 0,
          rating: c.rating ?? 4.2,
          image: c.logo || '',
          description: c.description || '',
          channels: c.channels ?? 0,
          quality: c.quality ?? 'HD',
          details: c.details || ''
        }))
        setIptvPackages(mapped)
        setTotalPackages(d.total || mapped.length)
      } catch (err) {
        console.error(err)
      } finally {
        if (mounted) setIsLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const categories = [
    { id: 'all', label: 'All Packages', icon: <Satellite className="w-5 h-5" /> },
    { id: 'sports', label: 'Sports', icon: <Tv className="w-5 h-5" /> },
    { id: 'international', label: 'International', icon: <Globe className="w-5 h-5" /> },
    { id: 'movies', label: 'Movies', icon: <Radio className="w-5 h-5" /> },
    { id: 'entertainment', label: 'Entertainment', icon: <TrendingUp className="w-5 h-5" /> }
  ]

  const filteredPackages = selectedCategory === 'all' 
    ? iptvPackages 
    : iptvPackages.filter(p => p.category === selectedCategory)

  const handleSubscribe = (pkg: IPTVPackage) => {
    if (credits >= pkg.price) {
      const newCredits = credits - pkg.price
      setCredits(newCredits)
      localStorage.setItem('userCredits', newCredits.toString())
      alert(`Successfully subscribed to "${pkg.title}" for ${pkg.price} credits!`)
    } else {
      alert('Insufficient credits! Please add more credits to your account.')
    }
  }

  const stats = [
    { label: 'Total Packages', value: totalPackages.toString(), icon: <Satellite className="w-5 h-5" /> },
    { label: 'Active Subscribers', value: '35K+', icon: <Users className="w-5 h-5" /> },
    { label: 'Avg Rating', value: '4.7★', icon: <Star className="w-5 h-5" /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Header credits={credits} userEmail={userEmail} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">IPTV Subscriptions</h1>
          <p className="text-xl text-blue-200 max-w-2xl">
            Premium IPTV channels from around the world with live sports, movies, and entertainment
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

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-3 rounded-lg flex items-center gap-2 transition-all font-medium ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Packages Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-white/60">Loading IPTV packages...</p>
          </div>
        ) : filteredPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="glass rounded-xl overflow-hidden border border-white/10 hover:border-blue-400 transition-all duration-300 group"
              >
                {/* Package Image */}
                <div className="relative h-48 overflow-hidden bg-white/5">
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-semibold capitalize">
                    {pkg.category}
                  </div>

                  {/* Rating */}
                  {pkg.rating && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/70 px-2 py-1 rounded text-xs text-yellow-400">
                      <Star className="w-3 h-3 fill-current" />
                      {pkg.rating}
                    </div>
                  )}
                </div>

                {/* Package Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{pkg.title}</h3>
                  <p className="text-white/60 text-sm mb-3 line-clamp-2">{pkg.description}</p>
                  
                  <div className="mb-4 space-y-2 text-sm text-white/70">
                    <div className="flex items-center gap-2">
                      <Tv className="w-4 h-4 text-blue-400" />
                      {pkg.channels} channels
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-400" />
                      {pkg.quality}
                    </div>
                  </div>

                  {pkg.details && (
                    <p className="text-white/50 text-xs mb-4">{pkg.details}</p>
                  )}

                  {/* Price and Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div>
                      <p className="text-white/60 text-xs mb-1">Price</p>
                      <p className="text-2xl font-bold text-blue-400">{pkg.price}</p>
                      <p className="text-white/60 text-xs">Credits</p>
                    </div>
                    <button
                      onClick={() => handleSubscribe(pkg)}
                      disabled={credits < pkg.price}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        credits >= pkg.price
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
        ) : (
          <div className="text-center py-12">
            <p className="text-white/60">No IPTV packages available</p>
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
