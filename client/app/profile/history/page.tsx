'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    async function fetchHistory() {
      try {
        const res = await fetch('/api/user/history')
        const d = await res.json()
        if (!res.ok) {
          router.push('/')
          return
        }
        if (mounted) setHistory(d.history || [])
      } catch (e) {
        router.push('/')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchHistory()
    return () => { mounted = false }
  }, [router])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Subscription History</h1>
      {history.length ? (
        <ul className="space-y-3">
          {history.map((h: any) => (
            <li key={h.id} className="glass p-3 rounded flex items-center justify-between">
              <div>
                <div className="font-medium">{h.subscription?.channel?.name || 'Subscription'}</div>
                <div className="text-xs text-white/60">{new Date(h.startDate).toLocaleDateString()} - {new Date(h.endDate).toLocaleDateString()}</div>
              </div>
              <div>{h.status}</div>
            </li>
          ))}
        </ul>
      ) : (
        <div>No history yet.</div>
      )}
    </div>
  )
}
