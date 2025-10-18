'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Header from '../../components/Layout/Header'
import ContentCard, { Content } from '../../components/Content/ContentCard'
import SubscriptionCard from '../../components/Content/SubscriptionCard'
import Loading3D from '../../components/Loading3D'
import SectionHeader from '../../components/UI/SectionHeader'
import Carousel from '../../components/UI/Carousel'
import MagneticButton from '../../components/UI/MagneticButton'
import MotionReveal from '../../components/UI/MotionReveal'
import {
  Play,
  TrendingUp,
  Star,
  Clock,
  Film,
  Tv,
  Radio,
  Gamepad2,
  ChevronRight,
  Eye,
  Calendar,
  Users
} from 'lucide-react'

export default function DashboardPage() {
  const [credits, setCredits] = useState(150)
  const [userEmail, setUserEmail] = useState('')
  const [isPageLoading, setIsPageLoading] = useState(true)
  const router = useRouter()
  const [watchlistIds, setWatchlistIds] = useState<number[]>([])
  const [streamingPreview, setStreamingPreview] = useState<Content[]>([])
  const [iptvChannelsList, setIptvChannelsList] = useState<Content[]>([])
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
        // Fetch streaming channels preview
        const spParams = new URLSearchParams()
        spParams.set('page', '1')
        spParams.set('pageSize', '8')
        spParams.set('category', 'streaming')
        const spRes = await fetch(`/api/catalog/channels?${spParams.toString()}`)
        const spJson = await spRes.json().catch(() => ({}))
        const streamingChannels = Array.isArray(spJson.channels) ? spJson.channels : []
        if (!mounted) return
        const mappedStreaming = streamingChannels.map((c: any) => ({
          id: c.id,
          title: c.name || 'Streaming Plan',
          type: 'movie' as const,
          price: c.price ?? 0,
          rating: c.rating ?? 4.5,
          image: c.logo || 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg',
          description: c.description || '',
          duration: 'Streaming',
          genre: 'Streaming',
          trailer: c.videoUrl
        }))
        setStreamingPreview(mappedStreaming)
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
        // Fetch IPTV channels preview
        const iptvParams = new URLSearchParams()
        iptvParams.set('page', '1')
        iptvParams.set('pageSize', '8')
        iptvParams.set('category', 'iptv')
        const iptvRes = await fetch(`/api/catalog/channels?${iptvParams.toString()}`)
        const iptvJson = await iptvRes.json().catch(() => ({}))
        const iptvChannels = Array.isArray(iptvJson.channels) ? iptvJson.channels : []
        if (!mounted) return
        const mappedIPTV = iptvChannels.map((c: any) => ({
          id: c.id,
          title: c.name || 'IPTV Channel',
          type: 'subscription' as const,
          price: c.price ?? 0,
          rating: c.rating ?? 4.2,
          image: c.logo || '',
          description: c.description || '',
          duration: 'Monthly',
          genre: 'IPTV',
          channels: c.channels,
          quality: c.quality
        }))
        setIptvChannelsList(mappedIPTV)
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
        // Fetch apps
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

  const handlePurchase = (item: Content) => {
    if (credits >= item.price) {
      const newCredits = credits - item.price
      setCredits(newCredits)
      localStorage.setItem('userCredits', newCredits.toString())
      alert(`Successfully purchased "${item.title}" for ${item.price} credits!`)
    } else {
      alert('Insufficient credits! Please add more credits to your account.')
    }
  }

  const handleViewDetails = (item: Content) => {
    router.push(`/content/${item.id}`)
  }

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <Loading3D />
      </div>
    )
  }

  const featuredContent = streamingPreview.length > 0 ? streamingPreview[0] : null

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header credits={credits} userEmail={userEmail} />

      {/* HERO */}
      <section className="relative w-full h-[560px] md:h-[720px] overflow-hidden">
        {featuredContent?.trailer ? (
          <video
            src={featuredContent.trailer}
            poster={featuredContent.image}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover brightness-70"
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
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">{featuredContent?.title ?? 'Welcome to SMART SAT TV'}</h1>
            <p className="mt-4 text-white/80 max-w-xl">{featuredContent?.description ?? 'Experience premium streaming and IPTV services with unlimited access to your favorite content.'}</p>

            <div className="mt-8 flex items-center gap-4">
              <MagneticButton
                href={featuredContent ? `/player/${featuredContent.id}` : '/streaming'}
                className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 px-5 py-3 rounded-full font-semibold shadow-lg"
              >
                <Play className="w-5 h-5" /> Play
              </MagneticButton>

              <MagneticButton
                href={featuredContent ? `/content/${featuredContent.id}` : '/streaming'}
                className="inline-flex items-center gap-2 border border-white/20 px-4 py-2 rounded-full text-sm hover:bg-white/5"
              >
                Details
              </MagneticButton>

              <div className="ml-auto md:ml-0 text-sm text-white/70">Available in HD • Premium Quality</div>
            </div>

            <div className="mt-6 flex items-center gap-4 text-sm text-white/60">
              <div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400"/> {featuredContent?.rating ?? 4.8}</div>
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
              {streamingPreview.map((item) => (
                <div key={item.id}>
                  <SubscriptionCard
                    product={{
                      id: item.id,
                      title: item.title,
                      price: item.price,
                      image: item.image,
                      description: item.description,
                      duration: item.duration,
                      genre: item.genre,
                      type: item.type,
                    }}
                    onPurchase={(p) => handlePurchase(p as any)}
                    onViewDetails={(p) => handleViewDetails(p as any)}
                    userCredits={credits}
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
              {iptvChannelsList.map((item) => (
                <div key={item.id}>
                  <SubscriptionCard
                    product={{
                      id: item.id,
                      title: item.title,
                      price: item.price,
                      image: item.image,
                      description: item.description,
                      duration: item.duration,
                      genre: item.genre,
                      type: item.type,
                    }}
                    onPurchase={(p) => handlePurchase(p as any)}
                    onViewDetails={(p) => handleViewDetails(p as any)}
                    userCredits={credits}
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
                    onPurchase={handlePurchase}
                    onViewDetails={handleViewDetails}
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
                subtitle="Your saved movies and series"
                action={<a href="/profile" className="text-sm text-white/60 hover:text-white">Manage</a>}
              />
              <Carousel itemWidthPx={224} autoPlayMs={3400}>
                {[
                  ...streamingPreview,
                  ...iptvChannelsList,
                  ...appsContent,
                ]
                  .filter((c) => watchlistIds.includes(c.id))
                  .map((item) => (
                    <div key={item.id}>
                      <ContentCard
                        content={item}
                        onPurchase={handlePurchase}
                        onViewDetails={handleViewDetails}
                        userCredits={credits}
                        isOwned={false}
                      />
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
