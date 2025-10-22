'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import ChannelCard from '../../../components/Content/ChannelCard'
import AdvancedFilter from '../../../components/Content/AdvancedFilter'
import {
  Satellite,
  Users,
  Star,
} from 'lucide-react'

interface Channel {
  id: number
  name: string
  logo?: string
  description?: string
  category: 'IPTV' | 'STREAMING'
  subscriptions?: Array<{
    id: number
    credit: number
    duration: string
    status: string
  }>
}

export default function IPTVPage() {
  const [credits, setCredits] = useState(150)
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

  const [channels, setChannels] = useState<Channel[]>([])
  const [totalChannels, setTotalChannels] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const [filters, setFilters] = useState<Record<string, any>>({
    q: '',
    category: 'iptv',
    minCredit: null,
    maxCredit: null,
    duration: '',
    sortBy: 'newest',
    sortDir: 'desc',
    page: 1,
    pageSize: 100,
  })

  async function fetchChannels(f = filters) {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(f).forEach(([k, v]) => {
        if (v === null || v === undefined || v === '') return
        params.set(k, String(v))
      })
      params.set('category', 'iptv')
      const res = await fetch(`/api/catalog/channels?${params.toString()}`)
      const d = await res.json().catch(() => ({}))
      const channelList = Array.isArray(d.channels) ? d.channels : []
      setChannels(channelList)
      setTotalChannels(d.total || channelList.length)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchChannels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleViewDetails = (channelId: number) => {
    router.push(`/subscription/${channelId}`)
  }

  const stats = [
    { label: 'Total Packages', value: totalChannels.toString(), icon: <Satellite className="w-5 h-5" /> },
    { label: 'Active Subscribers', value: '35K+', icon: <Users className="w-5 h-5" /> },
    { label: 'Avg Rating', value: '4.7★', icon: <Star className="w-5 h-5" /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
     

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">IPTV Subscriptions</h1>
          <p className="text-xl text-blue-200 max-w-2xl">
            Premium IPTV channels from around the world with live sports, movies, and entertainment
          </p>
        </div>

        {/* Filters */}
        <AdvancedFilter initial={{ category: 'iptv' }} onApply={(f) => { setFilters(prev => ({ ...prev, ...f, page: 1 })); fetchChannels({ ...filters, ...f, page: 1 }) }} onReset={() => { const base = { q: '', category: 'iptv', minCredit: null, maxCredit: null, duration: '', sortBy: 'newest', sortDir: 'desc', page: 1, pageSize: 100 }; setFilters(base); fetchChannels(base) }} />

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

        {/* Channels Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-white/60">Loading IPTV channels...</p>
          </div>
        ) : channels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {channels.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                onViewDetails={handleViewDetails}
                rating={4.7}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-white/60">No IPTV channels available</p>
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
