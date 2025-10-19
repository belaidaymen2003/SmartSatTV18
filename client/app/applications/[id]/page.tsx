'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Header from '../../../components/Layout/Header'
import {
  Download,
  ArrowLeft,
  Coins,
  AlertCircle,
  CheckCircle,
  Smartphone,
  Package,
  Zap,
  Star
} from 'lucide-react'

interface Application {
  id: number
  name: string
  description: string
  downloadLink: string
  image: string
  credit: number
  version: string
  createdAt: string
  updatedAt: string
}

export default function AppDetailPage() {
  const params = useParams()
  const appId = params.id as string
  const router = useRouter()

  const [app, setApp] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState(0)
  const [userEmail, setUserEmail] = useState('')
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [isOwned, setIsOwned] = useState(false)

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
    ;(async () => {
      try {
        const res = await fetch(`/api/catalog/applications/${appId}`)
        if (!res.ok) {
          setErrorMessage('App not found')
          setLoading(false)
          return
        }
        const data = await res.json()
        if (mounted) {
          setApp(data.app)
          setIsOwned(data.isOwned || false)
        }
      } catch (err) {
        console.error('Error fetching app:', err)
        setErrorMessage('Failed to load app details')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [appId])

  const handlePurchase = async () => {
    if (!app || credits < app.credit) {
      setErrorMessage('Insufficient credits')
      return
    }

    setPurchasing(true)
    setErrorMessage('')
    setPurchaseStatus('idle')

    try {
      const res = await fetch(`/api/catalog/applications/${appId}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMessage(data.error || 'Purchase failed')
        setPurchaseStatus('error')
        setPurchasing(false)
        return
      }

      setCredits(data.user.credits)
      localStorage.setItem('userCredits', data.user.credits.toString())
      setIsOwned(true)
      setPurchaseStatus('success')
      setPurchasing(false)

      setTimeout(() => {
        window.location.href = app.downloadLink
      }, 2000)
    } catch (err: any) {
      setErrorMessage(err.message || 'Purchase failed')
      setPurchaseStatus('error')
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header credits={credits} userEmail={userEmail} />
        <main className="max-w-6xl mx-auto px-4 py-12 text-center">
          <p className="text-white/60">Loading...</p>
        </main>
      </div>
    )
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <Header credits={credits} userEmail={userEmail} />
        <main className="max-w-6xl mx-auto px-4 py-12">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
          <div className="glass rounded-2xl border border-red-500/30 bg-red-500/5 p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">App Not Found</h2>
            <p className="text-white/70">{errorMessage || 'The app you are looking for does not exist.'}</p>
          </div>
        </main>
      </div>
    )
  }

  const hasEnoughCredits = credits >= app.credit

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Header credits={credits} userEmail={userEmail} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Applications
        </button>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: App Image and Primary Details */}
          <div className="lg:col-span-1">
            <div className="glass rounded-2xl overflow-hidden border border-white/10 sticky top-8">
              {/* Image */}
              <div className="relative h-80 bg-white/5 overflow-hidden">
                <img
                  src={app.image}
                  alt={app.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              {/* App Info Card */}
              <div className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <h1 className="text-2xl font-bold mb-2">{app.name}</h1>
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm">Premium App</span>
                  </div>
                </div>

                {/* Version and Info */}
                <div className="space-y-2 text-sm text-white/70">
                  <div className="flex items-center justify-between">
                    <span>Version</span>
                    <span className="font-semibold text-white">{app.version}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Type</span>
                    <span className="font-semibold text-white">Application</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Published</span>
                    <span className="font-semibold text-white">
                      {new Date(app.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Credit Cost */}
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-4 border border-blue-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80 text-sm">Required Credits</span>
                    <Coins className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="text-3xl font-bold text-yellow-400">{app.credit}</div>
                  <div className="text-xs text-white/60 mt-1">
                    You have: <span className="text-white">{credits}</span> credits
                  </div>
                </div>

                {/* Status Message */}
                {purchaseStatus === 'success' ? (
                  <div className="bg-green-500/20 rounded-xl p-4 border border-green-500/30 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-400">Purchase Successful!</p>
                      <p className="text-sm text-white/80">Redirecting to download link...</p>
                    </div>
                  </div>
                ) : purchaseStatus === 'error' ? (
                  <div className="bg-red-500/20 rounded-xl p-4 border border-red-500/30 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-400">Error</p>
                      <p className="text-sm text-white/80">{errorMessage}</p>
                    </div>
                  </div>
                ) : !hasEnoughCredits ? (
                  <div className="bg-orange-500/20 rounded-xl p-4 border border-orange-500/30 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-orange-400">Insufficient Credits</p>
                      <p className="text-sm text-white/80">
                        You need {app.credit - credits} more credits to purchase this app.
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Action Button */}
                {isOwned ? (
                  <a
                    href={app.downloadLink}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-5 h-5" />
                    Download Now
                  </a>
                ) : (
                  <button
                    onClick={handlePurchase}
                    disabled={!hasEnoughCredits || purchasing}
                    className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                      hasEnoughCredits && !purchasing
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                        : 'bg-white/10 text-white/50 cursor-not-allowed'
                    }`}
                  >
                    {purchasing ? (
                      <>
                        <Zap className="w-5 h-5 animate-pulse" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Get App - {app.credit} Credits
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Detailed Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section className="glass rounded-2xl border border-white/10 p-8">
              <h2 className="text-2xl font-bold mb-4">About This App</h2>
              <p className="text-white/80 leading-relaxed">
                {app.description}
              </p>
            </section>

            {/* Features */}
            <section className="glass rounded-2xl border border-white/10 p-8">
              <h2 className="text-2xl font-bold mb-6">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Download className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Easy Download</h3>
                    <p className="text-sm text-white/60">One-click installation and setup</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Multi-Platform</h3>
                    <p className="text-sm text-white/60">Works on iOS, Android, and more</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Regular Updates</h3>
                    <p className="text-sm text-white/60">Always get the latest version</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Optimized</h3>
                    <p className="text-sm text-white/60">Lightning-fast performance</p>
                  </div>
                </div>
              </div>
            </section>

            {/* System Requirements */}
            <section className="glass rounded-2xl border border-white/10 p-8">
              <h2 className="text-2xl font-bold mb-6">System Requirements</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-white/70">Minimum iOS Version</span>
                  <span className="font-semibold">13.0+</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-white/70">Minimum Android Version</span>
                  <span className="font-semibold">8.0+</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-white/70">Storage Required</span>
                  <span className="font-semibold">50MB - 200MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Internet Connection</span>
                  <span className="font-semibold">Required</span>
                </div>
              </div>
            </section>

            {/* Support Section */}
            <section className="glass rounded-2xl border border-blue-500/30 bg-blue-500/5 p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-400" />
                Need Help?
              </h2>
              <p className="text-white/80 mb-4">
                If you have any issues with this app or need technical support, please reach out to our support team.
              </p>
              <a href="/support" className="inline-block px-6 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-semibold transition-colors">
                Contact Support
              </a>
            </section>
          </div>
        </div>
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
