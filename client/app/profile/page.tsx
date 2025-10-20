'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check, Calendar, Zap, Tv, Radio, AlertCircle } from 'lucide-react'
import Header from '../../components/Layout/Header'

export default function ProfilePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState(0)
  const [userEmail, setUserEmail] = useState('')
  const [copiedCodeId, setCopiedCodeId] = useState<number | null>(null)
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

  useEffect(() => {
    let mounted = true
    async function fetchOverview() {
      try {
        const res = await fetch('/api/user/overview', { credentials: 'include' })
        const d = await res.json()
        if (!res.ok) {
          router.push('/')
          return
        }
        if (mounted) {
          setData(d.user)
          setCredits(d.user.credits)
        }
      } catch (e) {
        router.push('/')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchOverview()
    return () => { mounted = false }
  }, [router])

  const copyToClipboard = (code: string, id: number) => {
    navigator.clipboard.writeText(code)
    setCopiedCodeId(id)
    setTimeout(() => setCopiedCodeId(null), 2000)
  }

  const isSubscriptionExpired = (endDate: string): boolean => {
    return new Date(endDate) < new Date()
  }

  const getCategoryIcon = (category: string) => {
    return category === 'IPTV' ? <Tv className="w-3 h-3" /> : <Radio className="w-3 h-3" />
  }

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const activeSubscriptions = data?.userSubscriptions?.filter(
    (sub: any) => !isSubscriptionExpired(sub.endDate)
  ) || []

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header credits={credits} userEmail={userEmail} />
      <main className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p className="text-white/60">Loading...</p>
      </main>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header credits={credits} userEmail={userEmail} />
      <main className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p className="text-white/60">Not authenticated</p>
      </main>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Header credits={credits} userEmail={userEmail} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Welcome, {data.name}!</h1>
          <p className="text-white/70">Manage your account, subscriptions, and downloads</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="glass rounded-xl p-4 border border-white/20">
            <p className="text-white/60 text-sm mb-1">Available Credits</p>
            <p className="text-3xl font-bold text-yellow-400 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              {data.credits}
            </p>
          </div>
          <div className="glass rounded-xl p-4 border border-white/20">
            <p className="text-white/60 text-sm mb-1">Active Subscriptions</p>
            <p className="text-3xl font-bold text-green-400">{activeSubscriptions.length}</p>
          </div>
          <div className="glass rounded-xl p-4 border border-white/20">
            <p className="text-white/60 text-sm mb-1">Videos</p>
            <p className="text-3xl font-bold text-blue-400">{data.video?.length || 0}</p>
          </div>
          <div className="glass rounded-xl p-4 border border-white/20">
            <p className="text-white/60 text-sm mb-1">Status</p>
            <p className={`text-lg font-bold ${data.status === 'APPROVED' ? 'text-green-400' : 'text-orange-400'}`}>
              {data.status}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Subscriptions Preview */}
            {activeSubscriptions.length > 0 && (
              <section className="glass rounded-2xl border border-green-500/30 bg-green-500/5 p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Check className="w-6 h-6 text-green-400" />
                  Active Subscriptions
                </h2>

                <div className="space-y-4">
                  {activeSubscriptions.slice(0, 3).map((userSub: any) => (
                    <div key={userSub.id} className="flex items-start justify-between p-4 rounded-lg bg-black/20 border border-white/10">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getCategoryIcon(userSub.subscription.channel.category)}
                          <h4 className="font-semibold">{userSub.subscription.channel.name}</h4>
                        </div>
                        <p className="text-sm text-white/60">
                          Valid until {formatDate(userSub.endDate)}
                        </p>
                      </div>
                      {userSub.code && (
                        <button
                          onClick={() => copyToClipboard(userSub.code, userSub.id)}
                          className="ml-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex-shrink-0"
                          title="Copy code"
                        >
                          {copiedCodeId === userSub.id ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {activeSubscriptions.length > 3 && (
                  <a
                    href="/profile/subscriptions"
                    className="mt-6 block text-center px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 font-medium transition-colors"
                  >
                    View All {activeSubscriptions.length} Subscriptions
                  </a>
                )}

                {activeSubscriptions.length <= 3 && activeSubscriptions.length > 0 && (
                  <a
                    href="/profile/subscriptions"
                    className="mt-6 block text-center px-4 py-2 rounded-lg text-green-400 font-medium hover:underline"
                  >
                    View Full Details →
                  </a>
                )}
              </section>
            )}

            {/* No Subscriptions */}
            {activeSubscriptions.length === 0 && (
              <section className="glass rounded-2xl border border-orange-500/30 bg-orange-500/5 p-8">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                  <h2 className="text-xl font-bold mb-2">No Active Subscriptions</h2>
                  <p className="text-white/70 mb-6">
                    Start exploring our streaming and IPTV channels to get your subscription codes
                  </p>
                  <div className="flex gap-4 justify-center flex-wrap">
                    <a href="/streaming" className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
                      Browse Streaming
                    </a>
                    <a href="/iptv" className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors">
                      Browse IPTV
                    </a>
                  </div>
                </div>
              </section>
            )}

            {/* Profile Info */}
            <section className="glass rounded-2xl border border-white/20 p-8">
              <h2 className="text-xl font-bold mb-6">Profile Information</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <span className="text-white/70">Username</span>
                  <span className="font-semibold">{data.username}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                  <span className="text-white/70">Email</span>
                  <span className="font-semibold">{data.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Member Since</span>
                  <span className="font-semibold">{formatDate(data.createdAt)}</span>
                </div>
              </div>
            </section>

          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Quick Links */}
            <section className="glass rounded-2xl border border-white/20 p-6">
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="/profile/subscriptions" className="block px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">My Subscriptions</a></li>
                <li><a href="/streaming" className="block px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">Browse Streaming</a></li>
                <li><a href="/iptv" className="block px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">Browse IPTV</a></li>
                <li><a href="/profile/settings" className="block px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">Settings</a></li>
              </ul>
            </section>

            {/* Account Stats */}
            <section className="glass rounded-2xl border border-white/20 p-6">
              <h3 className="text-lg font-bold mb-4">Account Stats</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between">
                  <span className="text-white/70">Total Videos</span>
                  <span className="font-semibold">{data.video?.length || 0}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-white/70">Subscriptions</span>
                  <span className="font-semibold">{data.userSubscriptions?.length || 0}</span>
                </li>
              </ul>
            </section>
          </aside>
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
