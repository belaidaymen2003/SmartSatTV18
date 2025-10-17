'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '' })
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    async function fetchData() {
      try {
        const res = await fetch('/api/user/settings')
        const d = await res.json()
        if (!res.ok) {
          router.push('/')
          return
        }
        if (mounted) {
          setUser(d.user)
          setForm({ name: d.user.name || '', email: d.user.email || '', username: d.user.username || '', password: '' })
        }
      } catch (e) {
        router.push('/')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchData()
    return () => { mounted = false }
  }, [router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/user/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const d = await res.json()
      if (!res.ok) {
        alert(d.error || 'Failed')
      } else {
        alert('Saved')
        router.push('/profile')
      }
    } catch (e) {
      alert('Failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>
  if (!user) return <div className="p-8">Not authenticated</div>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm">Name</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded bg-white/5" />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 rounded bg-white/5" />
        </div>
        <div>
          <label className="block text-sm">Username</label>
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full px-3 py-2 rounded bg-white/5" />
        </div>
        <div>
          <label className="block text-sm">New password (leave blank to keep)</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 rounded bg-white/5" />
        </div>
        <div>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-500 rounded text-white">{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </form>
    </div>
  )
}
