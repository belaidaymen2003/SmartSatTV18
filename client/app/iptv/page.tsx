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
  category: 'sports' | 'international' | 'movies' | 'entertainment'
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

  const iptvPackages: IPTVPackage[] = [
    {
      id: 1,
      title: "Sports Premium Bundle",
      category: "sports",
      price: 35,
      rating: 4.7,
      image: "https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg",
      description: "Complete sports experience with live matches and exclusive coverage",
      channels: 50,
      quality: "Full HD",
      details: "Live Sports • 24/7 Coverage • Multiple Languages"
    },
    {
      id: 2,
      title: "Premier League Bundle",
      category: "sports",
      price: 40,
      rating: 4.9,
      image: "https://images.pexels.com/photos/3621141/pexels-photo-3621141.jpeg",
      description: "Exclusive Premier League and international football matches",
      channels: 30,
      quality: "Full HD + 4K",
      details: "Live Matches • Match Analysis • Replays"
    },
    {
      id: 3,
      title: "International Channels",
      category: "international",
      price: 40,
      rating: 4.6,
      image: "https://images.pexels.com/photos/3944091/pexels-photo-3944091.jpeg",
      description: "150+ channels from around the world in multiple languages",
      channels: 150,
      quality: "Full HD",
      details: "Multiple Languages • Global Content • 24/7 Access"
    },
    {
      id: 4,
      title: "European Channels",
      category: "international",
      price: 32,
      rating: 4.5,
      image: "https://images.pexels.com/photos/3597970/pexels-photo-3597970.jpeg",
      description: "Premium European television and entertainment channels",
      channels: 80,
      quality: "Full HD",
      details: "European Content • Live TV • News & Entertainment"
    },
    {
      id: 5,
      title: "Movie Heaven",
      category: "movies",
      price: 30,
      rating: 4.8,
      image: "https://images.pexels.com/photos/7991580/pexels-photo-7991580.jpeg",
      description: "Dedicated movie channels with latest theatrical releases",
      channels: 60,
      quality: "Full HD + 4K",
      details: "Latest Movies • Daily Updates • 4K Quality"
    },
    {
      id: 6,
      title: "Blockbuster Cinema",
      category: "movies",
      price: 28,
      rating: 4.7,
      image: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg",
      description: "Hollywood blockbusters and exclusive cinema releases",
      channels: 45,
      quality: "Full HD + 4K",
      details: "New Releases • Classics • 4K Streaming"
    },
    {
      id: 7,
      title: "Entertainment Plus",
      category: "entertainment",
      price: 25,
      rating: 4.6,
      image: "https://images.pexels.com/photos/7991319/pexels-photo-7991319.jpeg",
      description: "TV series, reality shows, and entertainment content",
      channels: 70,
      quality: "Full HD",
      details: "Series • Reality TV • Talk Shows • Unlimited Access"
    },
    {
      id: 8,
      title: "Family Entertainment",
      category: "entertainment",
      price: 22,
      rating: 4.5,
      image: "https://images.pexels.com/photos/7991225/pexels-photo-7991225.jpeg",
      description: "Family-friendly entertainment for all ages",
      channels: 55,
      quality: "Full HD",
      details: "Kids Content • Family Shows • Educational Programs"
    }
  ]

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
    { label: 'Total Packages', value: iptvPackages.length.toString(), icon: <Satellite className="w-5 h-5" /> },
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

        {filteredPackages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/60">No packages found in this category</p>
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
