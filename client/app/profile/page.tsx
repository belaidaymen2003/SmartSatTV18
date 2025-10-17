'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    async function fetchOverview() {
      try {
        const res = await fetch('/api/user/overview')
        const d = await res.json()
        if (!res.ok) {
          router.push('/')
          return
        }
        if (mounted) setData(d.user)
      } catch (e) {
        router.push('/')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchOverview()
    return () => { mounted = false }
  }, [router])

  if (loading) return <div className="p-8">Loading...</div>

  if (!data) return <div className="p-8">Not authenticated</div>

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Welcome, {data.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <section className="glass p-4 rounded">
            <h2 className="font-semibold mb-2">Profile</h2>
            <p><strong>Username:</strong> {data.username}</p>
            <p><strong>Email:</strong> {data.email}</p>
            <p><strong>Credits:</strong> {data.credits}</p>
            <p><strong>Status:</strong> {data.status}</p>
          </section>

          <section className="glass p-4 rounded">
            <h2 className="font-semibold mb-2">Owned Videos</h2>
            {data.video?.length ? (
              <ul className="space-y-3">
                {data.video.map((v: any) => (
                  <li key={v.id} className="flex items-center gap-3">
                    <img src={v.thumbnail || '/_next/static/media/image.png'} alt="thumb" className="w-24 h-14 object-cover rounded" />
                    <div>
                      <div className="font-medium">{v.title}</div>
                      <div className="text-xs text-white/60">{new Date(v.createdAt).toLocaleDateString()}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div>No videos yet.</div>
            )}
          </section>

          <section className="glass p-4 rounded">
            <h2 className="font-semibold mb-2">Owned Apps</h2>
            {data.appDownload?.length ? (
              <ul className="space-y-3">
                {data.appDownload.map((a: any) => (
                  <li key={a.id} className="flex items-center gap-3">
                    <img src={a.image || '/_next/static/media/image.png'} alt={a.name} className="w-12 h-12 object-cover rounded" />
                    <div>
                      <div className="font-medium">{a.name}</div>
                      <div className="text-xs text-white/60">Version {a.version}</div>
                    </div>
                    <a href={a.downloadLink} className="ml-auto text-blue-300">Download</a>
                  </li>
                ))}
              </ul>
            ) : (
              <div>No apps yet.</div>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="glass p-4 rounded">
            <h3 className="font-semibold mb-2">Subscriptions</h3>
            {data.subscriptionplan?.length ? (
              <ul className="space-y-2 text-sm">
                {data.subscriptionplan.map((p: any) => (
                  <li key={p.id} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{p.subscription?.channel?.name || 'Subscription'}</div>
                      <div className="text-xs text-white/60">{new Date(p.startDate).toLocaleDateString()} - {new Date(p.endDate).toLocaleDateString()}</div>
                    </div>
                    <div className="text-sm">{p.status}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div>No subscriptions</div>
            )}
          </section>

          <section className="glass p-4 rounded">
            <h3 className="font-semibold mb-2">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/profile/settings" className="text-blue-300">Settings</a></li>
              <li><a href="/profile/history" className="text-blue-300">History</a></li>
              <li><a href="/profile/favorites" className="text-blue-300">Favorites</a></li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  )
}
