'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Header from '../../components/Layout/Header'
import ContentCard, { Content } from '../../components/Content/ContentCard'
import ChannelCard from '../../components/Content/ChannelCard'
import VideoHero from '../../components/Content/VideoHero'
import Loading3D from '../../components/Loading3D'
import SectionHeader from '../../components/UI/SectionHeader'
import Carousel from '../../components/UI/Carousel'
import MagneticButton from '../../components/UI/MagneticButton'
import MotionReveal from '../../components/UI/MotionReveal'
import {
  Play,
  Star,
  Clock,
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

export default function DashboardPage() {
  const [credits, setCredits] = useState(150)
  const [userEmail, setUserEmail] = useState('')
  const [isPageLoading, setIsPageLoading] = useState(true)
  const router = useRouter()
  const [watchlistIds, setWatchlistIds] = useState<number[]>([])
  const [streamingChannels, setStreamingChannels] = useState<Channel[]>([])
  const [iptvChannels, setIptvChannels] = useState<Channel[]>([])
  const [appsContent, setAppsContent] = useState<Content[]>([])

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
      try { setWatchlistIds(JSON.parse(wl)) } catch {}
    }
  }, [router])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const spParams = new URLSearchParams()
        spParams.set('page', '1')
        spParams.set('pageSize', '8')
        spParams.set('category', 'streaming')
        const spRes = await fetch(`/api/catalog/channels?${spParams.toString()}`)
        const spJson = await spRes.json().catch(() => ({}))
        const channels = Array.isArray(spJson.channels) ? spJson.channels : []
        if (!mounted) return
        setStreamingChannels(channels)
      } catch (err) {
        console.error('Error fetching streaming channels:', err)
      }
    })()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const iptvParams = new URLSearchParams()
        iptvParams.set('page', '1')
        iptvParams.set('pageSize', '8')
        iptvParams.set('category', 'iptv')
        const iptvRes = await fetch(`/api/catalog/channels?${iptvParams.toString()}`)
        const iptvJson = await iptvRes.json().catch(() => ({}))
        const channels = Array.isArray(iptvJson.channels) ? iptvJson.channels : []
        if (!mounted) return
        setIptvChannels(channels)
      } catch (err) {
        console.error('Error fetching IPTV channels:', err)
      }
    })()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const appsRes = await fetch('/api/catalog/applications')
        const appsJson = await appsRes.json().catch(() => ({}))
        const apps = Array.isArray(appsJson.apps) ? appsJson.apps : []
        if (!mounted) return
        const mappedApps = apps.map((a: any) => ({
          id: a.id,
          title: a.name || a.title || 'App',
          type: 'app' as const,
          price: a.credit ?? 0,
          rating: 4.5,
          image: a.image || '',
          description: a.description || '',
          duration: 'Lifetime',
          genre: 'App'
        }))
        setAppsContent(mappedApps)
      } catch (err) {
        console.error('Error fetching apps:', err)
      }
    })()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setIsPageLoading(false), 400)
    return () => clearTimeout(t)
  }, [])

  const handleViewChannelDetails = (channelId: number) => {
    router.push(`/subscription/${channelId}`)
  }

  const handlePurchaseApp = (item: Content) => {
    if (credits >= item.price) {
      const newCredits = credits - item.price
      setCredits(newCredits)
      localStorage.setItem('userCredits', newCredits.toString())
      alert(`Successfully purchased "${item.title}" for ${item.price} credits!`)
    } else {
      alert('Insufficient credits! Please add more credits to your account.')
    }
  }

  const handleViewAppDetails = (item: Content) => {
    router.push(`/applications/${item.id}`)
  }

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <Loading3D />
      </div>
    )
  }

  const featuredChannel = streamingChannels.length > 0 ? streamingChannels[0] : null

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header credits={credits} userEmail={userEmail} />

      {/* HERO */}
      <section className="relative w-full h-[560px] md:h-[720px] overflow-hidden">
        {featuredChannel?.logo ? (
          <Image
            src={featuredChannel.logo}
            alt={featuredChannel.name}
            fill
            sizes="(max-width: 768px) 100vw, 1600px"
            className="object-cover brightness-50"
          />
        ) : (
          <Image
            src={"https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg"}
            alt="Featured background"
            fill
            sizes="(max-width: 768px) 100vw, 1600px"
            className="object-cover brightness-50 animate-kenburns"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="absolute inset-0 max-w-7xl mx-auto px-6 md:px-12 flex items-end md:items-center">
          <div className="py-12 md:py-20 w-full md:w-2/3 lg:w-1/2">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">{featuredChannel?.name ?? 'Welcome to SMART SAT TV'}</h1>
            <p className="mt-4 text-white/80 max-w-xl">{featuredChannel?.description ?? 'Experience premium streaming and IPTV services with unlimited access to your favorite content.'}</p>

            <div className="mt-8 flex items-center gap-4">
              <MagneticButton
                href={featuredChannel ? `/subscription/${featuredChannel.id}` : '/streaming'}
                className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 px-5 py-3 rounded-full font-semibold shadow-lg"
              >
                <Play className="w-5 h-5" /> View Plans
              </MagneticButton>

              <div className="text-sm text-white/70">Premium Quality • No Ads</div>
            </div>

            <div className="mt-6 flex items-center gap-4 text-sm text-white/60">
              <div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400"/> 4.8</div>
              <div className="px-2 py-1 bg-white/5 rounded">{new Date().getFullYear()}</div>
              <div className="px-2 py-1 bg-white/5 rounded">Premium</div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

        {/* Streaming Preview */}
        <section>
          <MotionReveal delayMs={120}>
            <SectionHeader
              title="Streaming"
              subtitle="Preview streaming channels and plans from the catalog"
              action={<a href="/streaming" className="text-sm text-white/60 hover:text-white">View All</a>}
            />
            <Carousel itemWidthPx={260} autoPlayMs={3500}>
              {streamingChannels.map((channel) => (
                <div key={channel.id}>
                  <ChannelCard
                    channel={channel}
                    onViewDetails={handleViewChannelDetails}
                    rating={4.8}
                  />
                </div>
              ))}
            </Carousel>
          </MotionReveal>
        </section>

        {/* IPTV Channels */}
        <section>
          <MotionReveal delayMs={120}>
            <SectionHeader
              title="IPTV Subscriptions"
              subtitle="Available IPTV subscription plans and channels"
              action={<a href="/iptv" className="text-sm text-white/60 hover:text-white">Explore</a>}
            />
            <Carousel itemWidthPx={260} autoPlayMs={3200}>
              {iptvChannels.map((channel) => (
                <div key={channel.id}>
                  <ChannelCard
                    channel={channel}
                    onViewDetails={handleViewChannelDetails}
                    rating={4.7}
                  />
                </div>
              ))}
            </Carousel>
          </MotionReveal>
        </section>

        {/* Available Apps */}
        <section>
          <MotionReveal delayMs={160}>
            <SectionHeader
              title="Available Apps"
              subtitle="Download powerful apps to enhance your experience"
              action={<a href="/applications" className="text-sm text-white/60 hover:text-white">View All</a>}
            />
            <Carousel itemWidthPx={260} autoPlayMs={3800}>
              {appsContent.map((item) => (
                <div key={item.id}>
                  <ContentCard
                    content={item}
                    onPurchase={handlePurchaseApp}
                    onViewDetails={handleViewAppDetails}
                    userCredits={credits}
                  />
                </div>
              ))}
            </Carousel>
          </MotionReveal>
        </section>

        {/* Watchlist */}
        {watchlistIds.length > 0 && (
          <section>
            <MotionReveal>
              <SectionHeader
                title="My List"
                subtitle="Your saved channels and apps"
                action={<a href="/profile" className="text-sm text-white/60 hover:text-white">Manage</a>}
              />
              <Carousel itemWidthPx={224} autoPlayMs={3400}>
                {[
                  ...streamingChannels.map(c => ({ ...c, isChannel: true })),
                  ...iptvChannels.map(c => ({ ...c, isChannel: true })),
                ]
                  .filter((c: any) => watchlistIds.includes(c.id))
                  .map((item: any) => (
                    <div key={item.id}>
                      {item.isChannel ? (
                        <ChannelCard
                          channel={item}
                          onViewDetails={handleViewChannelDetails}
                        />
                      ) : null}
                    </div>
                  ))}
              </Carousel>
            </MotionReveal>
          </section>
        )}

      </main>

      <footer className="border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-between text-sm text-white/60">
          <div>© 2025 SMART SAT TV. All rights reserved.</div>
          <div>Need help? <a href="/support" className="underline">Contact Support</a></div>
        </div>
      </footer>
    </div>
  )
}
