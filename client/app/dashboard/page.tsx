'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Header from '../../components/Layout/Header'
import ContentCard, { Content } from '../../components/Content/ContentCard'
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
  const [demoVideos, setDemoVideos] = useState<Content[]>([])

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

    // fetch demonstration videos (admin API)
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/catalog/streaming')
        const d = await res.json().catch(() => ({}))
        const vids = Array.isArray(d.videos) ? d.videos : []
        if (!mounted) return
        const mapped = vids.map((v: any) => ({
          id: v.id,
          title: v.title || 'Demo',
          type: 'movie' as const,
          price: v.price ?? 0,
          rating: v.rating ?? 4.5,
          image: v.thumbnail || 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg',
          description: v.description || '',
          duration: v.duration || 'Demo',
          genre: 'Demo',
          year: v.createdAt ? new Date(v.createdAt).getFullYear() : undefined,
          trailer: v.videoUrl
        }))
        setDemoVideos(mapped)
      } catch (err) {
        // ignore
      }
    })()

    // simulate small load and then hide loader
    const t = setTimeout(() => setIsPageLoading(false), 400)
    return () => { mounted = false; clearTimeout(t) }
  }, [router])

  const [appsContent, setAppsContent] = useState<Content[]>([])
  const [iptvChannelsList, setIptvChannelsList] = useState<Content[]>([])

  // Fetch production data from admin APIs and map to Content shape
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // Apps
        const appsRes = await fetch('/api/catalog/applications')
        const appsJson = await appsRes.json().catch(() => ({}))
        const apps = Array.isArray(appsJson.apps) ? appsJson.apps : []
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

        // IPTV Channels
        const chRes = await fetch('/api/catalog/iptv?category=iptv&pageSize=12')
        const chJson = await chRes.json().catch(() => ({}))
        const channels = Array.isArray(chJson.channels) ? chJson.channels : []
        const mappedChannels = channels.map((c: any) => ({
          id: c.id,
          title: c.name || 'Channel',
          type: 'live' as const,
          price: 0,
          rating: 4.2,
          image: c.logo || '',
          description: c.description || '',
          duration: 'Live',
          genre: c.category || 'IPTV'
        }))

            if (!mounted) return
        setAppsContent(mappedApps)
        setIptvChannelsList(mappedChannels)
      } catch (err) {
        // ignore
      }
    })()
    return () => { mounted = false }
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

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header credits={credits} userEmail={userEmail} />

      {/* HERO */}
      <section className="relative w-full h-[560px] md:h-[720px] overflow-hidden">
        {demoVideos.length > 0 && demoVideos[0].trailer ? (
          <video
            src={demoVideos[0].trailer}
            poster={demoVideos[0].image}
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
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">{demoVideos[0]?.title ?? 'Fast & Furious'}</h1>
            <p className="mt-4 text-white/80 max-w-xl">{demoVideos[0]?.description ?? 'A hilarious adventure featuring the lovable Minions. Enjoy full HD streaming and curated recommendations just for you.'}</p>

            <div className="mt-8 flex items-center gap-4">
              <MagneticButton
                href={demoVideos[0] ? `/player/${demoVideos[0].id}` : '/player/1'}
                className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 px-5 py-3 rounded-full font-semibold shadow-lg"
              >
                <Play className="w-5 h-5" /> Play
              </MagneticButton>

              <MagneticButton
                href={demoVideos[0] ? `/content/${demoVideos[0].id}` : '/content/1'}
                className="inline-flex items-center gap-2 border border-white/20 px-4 py-2 rounded-full text-sm hover:bg-white/5"
              >
                Details
              </MagneticButton>

              <div className="ml-auto md:ml-0 text-sm text-white/70">Available in HD • No cards shown</div>
            </div>

            <div className="mt-6 flex items-center gap-4 text-sm text-white/60">
              <div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400"/> {demoVideos[0]?.rating ?? 4.8}</div>
              <div className="px-2 py-1 bg-white/5 rounded">{demoVideos[0]?.year ?? 2024}</div>
              <div className="px-2 py-1 bg-white/5 rounded">{demoVideos[0]?.duration ?? '2h 15m'}</div>
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
              subtitle="Preview streaming plans and featured content"
              action={<a href="/streaming" className="text-sm text-white/60 hover:text-white">View All</a>}
            />
            <Carousel itemWidthPx={260} autoPlayMs={3500}>
              {demoVideos.map((item) => (
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

        {/* IPTV Channels */}
        <section>
          <MotionReveal delayMs={120}>
            <SectionHeader
              title="IPTV Channels"
              subtitle="Live TV and streaming channels from around the world"
              action={<a href="/iptv" className="text-sm text-white/60 hover:text-white">Explore</a>}
            />
            <Carousel itemWidthPx={260} autoPlayMs={3200}>
              {iptvChannelsList.map((item) => (
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
                  ...demoVideos,
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
