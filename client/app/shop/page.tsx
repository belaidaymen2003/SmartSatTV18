'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../components/Layout/Header'
import { 
  Download,
  Zap,
  Tv,
  PlayCircle,
  Star,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react'

interface Product {
  id: number
  title: string
  type: 'app' | 'subscription' | 'video' | 'iptv'
  price: number
  rating?: number
  image: string
  description: string
  details?: string
}

export default function ShopPage() {
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

  const products: Product[] = [
    // Apps
    {
      id: 1,
      title: "IPTV Player Pro",
      type: "app",
      price: 25,
      rating: 4.8,
      image: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg",
      description: "Professional IPTV player with advanced streaming capabilities",
      details: "Version 2.5 • 125MB • Compatible with all devices"
    },
    {
      id: 2,
      title: "Stream Manager",
      type: "app",
      price: 15,
      rating: 4.6,
      image: "https://images.pexels.com/photos/3944091/pexels-photo-3944091.jpeg",
      description: "Manage all your streaming subscriptions in one place",
      details: "Version 1.8 • 45MB • Free updates included"
    },
    {
      id: 3,
      title: "HD Video Downloader",
      type: "app",
      price: 20,
      rating: 4.7,
      image: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg",
      description: "Download your favorite content in HD quality",
      details: "Version 3.2 • 85MB • Lifetime license"
    },
    // Subscriptions
    {
      id: 4,
      title: "Premium Monthly Pass",
      type: "subscription",
      price: 50,
      rating: 4.9,
      image: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg",
      description: "One month access to all premium content",
      details: "30 days • Unlimited streaming • Cancel anytime"
    },
    {
      id: 5,
      title: "Pro 6-Month Bundle",
      type: "subscription",
      price: 120,
      rating: 5.0,
      image: "https://images.pexels.com/photos/7991319/pexels-photo-7991319.jpeg",
      description: "Six months of premium streaming access",
      details: "180 days • Family sharing • Priority support"
    },
    {
      id: 6,
      title: "Annual Premium Pass",
      type: "subscription",
      price: 199,
      rating: 4.9,
      image: "https://images.pexels.com/photos/7991225/pexels-photo-7991225.jpeg",
      description: "Full year of unlimited premium streaming",
      details: "365 days • 4K quality • VIP support"
    },
    // IPTV Channels
    {
      id: 7,
      title: "Sports Premium Bundle",
      type: "iptv",
      price: 35,
      rating: 4.7,
      image: "https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg",
      description: "50+ sports channels including live matches",
      details: "HD quality • 30 channels • Live sports 24/7"
    },
    {
      id: 8,
      title: "International Channels",
      type: "iptv",
      price: 40,
      rating: 4.6,
      image: "https://images.pexels.com/photos/3944091/pexels-photo-3944091.jpeg",
      description: "150+ channels from around the world",
      details: "Multiple languages • Full HD • 150 channels"
    },
    {
      id: 9,
      title: "Movie Heaven",
      type: "iptv",
      price: 30,
      rating: 4.8,
      image: "https://images.pexels.com/photos/7991580/pexels-photo-7991580.jpeg",
      description: "Dedicated movie channels with latest releases",
      details: "HD/4K • 60 movie channels • Daily updates"
    },
    // Videos/Content for Purchase
    {
      id: 10,
      title: "Avatar: The Way of Water",
      type: "video",
      price: 18,
      rating: 4.8,
      image: "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg",
      description: "Epic sci-fi adventure in stunning underwater worlds",
      details: "3h 12m • 4K • James Cameron"
    },
    {
      id: 11,
      title: "Stranger Things S4",
      type: "video",
      price: 25,
      rating: 4.9,
      image: "https://images.pexels.com/photos/7991319/pexels-photo-7991319.jpeg",
      description: "Supernatural thriller series with mind-bending mysteries",
      details: "8 episodes • HD • Complete season"
    },
    {
      id: 12,
      title: "The Batman",
      type: "video",
      price: 15,
      rating: 4.6,
      image: "https://images.pexels.com/photos/7991225/pexels-photo-7991225.jpeg",
      description: "Dark knight returns in this thrilling superhero film",
      details: "2h 56m • 4K • Matt Reeves"
    }
  ]

  const categories = [
    { id: 'all', label: 'All Products', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'app', label: 'Apps', icon: <Download className="w-5 h-5" /> },
    { id: 'subscription', label: 'Subscriptions', icon: <Zap className="w-5 h-5" /> },
    { id: 'iptv', label: 'IPTV Channels', icon: <Tv className="w-5 h-5" /> },
    { id: 'video', label: 'Videos', icon: <PlayCircle className="w-5 h-5" /> }
  ]

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.type === selectedCategory)

  const handlePurchase = (product: Product) => {
    if (credits >= product.price) {
      const newCredits = credits - product.price
      setCredits(newCredits)
      localStorage.setItem('userCredits', newCredits.toString())
      alert(`Successfully purchased "${product.title}" for ${product.price} credits!`)
    } else {
      alert('Insufficient credits! Please add more credits to your account.')
    }
  }

  const stats = [
    { label: 'Total Products', value: products.length.toString(), icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Active Users', value: '25K+', icon: <Users className="w-5 h-5" /> },
    { label: 'Avg Rating', value: '4.7★', icon: <Star className="w-5 h-5" /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Header credits={credits} userEmail={userEmail} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">Shop & Store</h1>
          <p className="text-xl text-blue-200 max-w-2xl">
            Discover premium apps, subscriptions, IPTV channels, and exclusive video content
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
                {cat.id !== 'all' && `(${products.filter(p => p.type === cat.id).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="glass rounded-xl overflow-hidden border border-white/10 hover:border-blue-400 transition-all duration-300 group"
            >
              {/* Product Image */}
              <div className="relative h-48 overflow-hidden bg-white/5">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Type Badge */}
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-semibold capitalize">
                  {product.type}
                </div>

                {/* Rating */}
                {product.rating && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/70 px-2 py-1 rounded text-xs text-yellow-400">
                    <Star className="w-3 h-3 fill-current" />
                    {product.rating}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.title}</h3>
                <p className="text-white/60 text-sm mb-3 line-clamp-2">{product.description}</p>
                
                {product.details && (
                  <p className="text-white/50 text-xs mb-4">{product.details}</p>
                )}

                {/* Price and Button */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <p className="text-white/60 text-xs mb-1">Price</p>
                    <p className="text-2xl font-bold text-blue-400">{product.price}</p>
                    <p className="text-white/60 text-xs">Credits</p>
                  </div>
                  <button
                    onClick={() => handlePurchase(product)}
                    disabled={credits < product.price}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      credits >= product.price
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:scale-105'
                        : 'bg-white/10 text-white/50 cursor-not-allowed'
                    }`}
                  >
                    Buy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/60">No products found in this category</p>
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
