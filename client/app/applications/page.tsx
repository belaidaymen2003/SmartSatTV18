'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../components/Layout/Header'
import { 
  Download,
  Smartphone,
  Monitor,
  Package,
  Users,
  Star,
  FileText,
  TrendingUp
} from 'lucide-react'

interface Application {
  id: number
  title: string
  category: 'player' | 'manager' | 'downloader' | 'utility'
  price: number
  rating?: number
  image: string
  description: string
  platforms: string[]
  version: string
  size: string
  downloads: string
  details?: string
}

export default function ApplicationsPage() {
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

  const applications: Application[] = [
    {
      id: 1,
      title: "IPTV Player Pro",
      category: "player",
      price: 25,
      rating: 4.8,
      image: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg",
      description: "Professional IPTV player with advanced streaming capabilities",
      platforms: ["iOS", "Android", "Windows", "macOS"],
      version: "2.5.1",
      size: "125MB",
      downloads: "50K+",
      details: "Advanced Codec Support • 4K Ready • Zero Buffering"
    },
    {
      id: 2,
      title: "Stream Manager",
      category: "manager",
      price: 15,
      rating: 4.6,
      image: "https://images.pexels.com/photos/3944091/pexels-photo-3944091.jpeg",
      description: "Manage all your streaming subscriptions in one place",
      platforms: ["iOS", "Android", "Web"],
      version: "1.8.0",
      size: "45MB",
      downloads: "30K+",
      details: "Multi-Account Support • Sync Across Devices • Smart Organization"
    },
    {
      id: 3,
      title: "HD Video Downloader",
      category: "downloader",
      price: 20,
      rating: 4.7,
      image: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg",
      description: "Download your favorite content in HD quality",
      platforms: ["Windows", "macOS", "Android"],
      version: "3.2.5",
      size: "85MB",
      downloads: "25K+",
      details: "Batch Download • Resume Support • Auto-Organization"
    },
    {
      id: 4,
      title: "Smart TV Companion",
      category: "player",
      price: 18,
      rating: 4.5,
      image: "https://images.pexels.com/photos/3261069/pexels-photo-3261069.jpeg",
      description: "Control and stream content to your Smart TV",
      platforms: ["iOS", "Android", "Web"],
      version: "2.1.0",
      size: "92MB",
      downloads: "40K+",
      details: "AirPlay • Chromecast • DLNA Support • Remote Control"
    },
    {
      id: 5,
      title: "PlayBack Pro",
      category: "player",
      price: 22,
      rating: 4.9,
      image: "https://images.pexels.com/photos/3861957/pexels-photo-3861957.jpeg",
      description: "Premium video player with advanced features",
      platforms: ["Windows", "macOS", "Linux"],
      version: "4.0.2",
      size: "156MB",
      downloads: "60K+",
      details: "Subtitle Engine • Equalizer • Gesture Controls • Codecs Support"
    },
    {
      id: 6,
      title: "Subscription Organizer",
      category: "manager",
      price: 12,
      rating: 4.4,
      image: "https://images.pexels.com/photos/3808517/pexels-photo-3808517.jpeg",
      description: "Keep track of all your subscriptions and billing",
      platforms: ["iOS", "Android", "Web"],
      version: "1.5.3",
      size: "38MB",
      downloads: "20K+",
      details: "Bill Reminders • Budget Tracking • Payment History"
    },
    {
      id: 7,
      title: "Content Converter",
      category: "utility",
      price: 16,
      rating: 4.6,
      image: "https://images.pexels.com/photos/3587620/pexels-photo-3587620.jpeg",
      description: "Convert videos between different formats",
      platforms: ["Windows", "macOS"],
      version: "5.1.0",
      size: "210MB",
      downloads: "35K+",
      details: "Fast Conversion • Batch Processing • Quality Presets"
    },
    {
      id: 8,
      title: "Stream Optimizer",
      category: "utility",
      price: 14,
      rating: 4.7,
      image: "https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg",
      description: "Optimize your network for better streaming",
      platforms: ["Windows", "macOS", "Android"],
      version: "2.3.1",
      size: "67MB",
      downloads: "28K+",
      details: "Network Analysis • Speed Test • Auto-Optimization"
    },
    {
      id: 9,
      title: "Media Library Pro",
      category: "manager",
      price: 19,
      rating: 4.8,
      image: "https://images.pexels.com/photos/5632398/pexels-photo-5632398.jpeg",
      description: "Organize and manage your media collection",
      platforms: ["iOS", "Android", "Windows", "macOS"],
      version: "3.4.0",
      size: "120MB",
      downloads: "45K+",
      details: "Smart Categorization • Metadata Fetching • Artwork Support"
    },
    {
      id: 10,
      title: "Quality Enhancer",
      category: "utility",
      price: 17,
      rating: 4.5,
      image: "https://images.pexels.com/photos/4348410/pexels-photo-4348410.jpeg",
      description: "Upscale and enhance video quality",
      platforms: ["Windows", "macOS"],
      version: "1.9.2",
      size: "180MB",
      downloads: "22K+",
      details: "AI Upscaling • Noise Reduction • Color Correction"
    },
    {
      id: 11,
      title: "Subtitle Master",
      category: "utility",
      price: 13,
      rating: 4.6,
      image: "https://images.pexels.com/photos/5632397/pexels-photo-5632397.jpeg",
      description: "Advanced subtitle editing and management",
      platforms: ["Windows", "macOS", "Linux"],
      version: "2.7.1",
      size: "74MB",
      downloads: "33K+",
      details: "Multi-Language Support • Sync Adjustment • Format Conversion"
    },
    {
      id: 12,
      title: "Remote Control",
      category: "manager",
      price: 11,
      rating: 4.4,
      image: "https://images.pexels.com/photos/5632396/pexels-photo-5632396.jpeg",
      description: "Control streaming devices from your phone",
      platforms: ["iOS", "Android"],
      version: "1.6.0",
      size: "52MB",
      downloads: "27K+",
      details: "Universal Support • Custom Layout • Voice Commands"
    }
  ]

  const categories = [
    { id: 'all', label: 'All Apps', icon: <Package className="w-5 h-5" /> },
    { id: 'player', label: 'Players', icon: <Monitor className="w-5 h-5" /> },
    { id: 'manager', label: 'Managers', icon: <FileText className="w-5 h-5" /> },
    { id: 'downloader', label: 'Downloaders', icon: <Download className="w-5 h-5" /> },
    { id: 'utility', label: 'Utilities', icon: <TrendingUp className="w-5 h-5" /> }
  ]

  const filteredApps = selectedCategory === 'all' 
    ? applications 
    : applications.filter(a => a.category === selectedCategory)

  const handleDownload = (app: Application) => {
    if (credits >= app.price) {
      const newCredits = credits - app.price
      setCredits(newCredits)
      localStorage.setItem('userCredits', newCredits.toString())
      alert(`Successfully downloaded "${app.title}" for ${app.price} credits!`)
    } else {
      alert('Insufficient credits! Please add more credits to your account.')
    }
  }

  const stats = [
    { label: 'Total Apps', value: applications.length.toString(), icon: <Package className="w-5 h-5" /> },
    { label: 'Active Downloads', value: '250K+', icon: <Users className="w-5 h-5" /> },
    { label: 'Avg Rating', value: '4.6★', icon: <Star className="w-5 h-5" /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Header credits={credits} userEmail={userEmail} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">Applications</h1>
          <p className="text-xl text-blue-200 max-w-2xl">
            Download powerful apps to enhance your streaming experience across all devices
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

        {/* Apps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="glass rounded-xl overflow-hidden border border-white/10 hover:border-blue-400 transition-all duration-300 group"
            >
              {/* App Image */}
              <div className="relative h-48 overflow-hidden bg-white/5">
                <img
                  src={app.image}
                  alt={app.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Category Badge */}
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-semibold capitalize">
                  {app.category}
                </div>

                {/* Rating */}
                {app.rating && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/70 px-2 py-1 rounded text-xs text-yellow-400">
                    <Star className="w-3 h-3 fill-current" />
                    {app.rating}
                  </div>
                )}
              </div>

              {/* App Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{app.title}</h3>
                <p className="text-white/60 text-sm mb-3 line-clamp-2">{app.description}</p>
                
                <div className="mb-4 space-y-2 text-sm text-white/70">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-blue-400" />
                    <span className="text-xs">{app.platforms.join(", ")}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>v{app.version} • {app.size}</span>
                    <span className="text-green-400">{app.downloads}</span>
                  </div>
                </div>

                {app.details && (
                  <p className="text-white/50 text-xs mb-4">{app.details}</p>
                )}

                {/* Price and Button */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div>
                    <p className="text-white/60 text-xs mb-1">Price</p>
                    <p className="text-2xl font-bold text-blue-400">{app.price}</p>
                    <p className="text-white/60 text-xs">Credits</p>
                  </div>
                  <button
                    onClick={() => handleDownload(app)}
                    disabled={credits < app.price}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                      credits >= app.price
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg hover:scale-105'
                        : 'bg-white/10 text-white/50 cursor-not-allowed'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    Get
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredApps.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/60">No apps found in this category</p>
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
