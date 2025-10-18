'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any>({ videos: [], apps: [] })
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    async function fetchFav() {
      try {
        const res = await fetch('/api/user/favorites', { credentials: 'include' })
        const d = await res.json()
        if (!res.ok) {
          router.push('/')
          return
        }
        if (mounted) setFavorites(d.favorites || { videos: [], apps: [] })
      } catch (e) {
        router.push('/')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchFav()
    return () => { mounted = false }
  }, [router])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Favorites</h1>
      <section className="mb-6">
        <h2 className="font-semibold mb-2">Videos</h2>
        {favorites.videos.length ? (
          <ul className="space-y-3">
            {favorites.videos.map((v: any) => (
              <li key={v.id} className="flex items-center gap-3">
                <img src={v.thumbnail || '/_next/static/media/image.png'} className="w-24 h-14 object-cover rounded" />
                <div>
                  <div className="font-medium">{v.title}</div>
                  <div className="text-xs text-white/60">{new Date(v.createdAt).toLocaleDateString()}</div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div>No favorites</div>
        )}
      </section>

      <section>
        <h2 className="font-semibold mb-2">Apps</h2>
        {favorites.apps.length ? (
          <ul className="space-y-3">
            {favorites.apps.map((a: any) => (
              <li key={a.id} className="flex items-center gap-3">
                <img src={a.image || '/_next/static/media/image.png'} className="w-12 h-12 object-cover rounded" />
                <div>
                  <div className="font-medium">{a.name}</div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div>No apps</div>
        )}
      </section>
    </div>
  )
}
