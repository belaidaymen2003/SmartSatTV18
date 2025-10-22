'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, User, Mail, Check } from 'lucide-react'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', username: '', currentPassword: '', newPassword: '', confirmPassword: '' })
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    async function fetchData() {
      try {
        const res = await fetch('/api/user/settings', { credentials: 'include' })
        const d = await res.json()
        if (!res.ok) {
          router.push('/')
          return
        }
        if (mounted) {
          setUser(d.user)
          setForm({
            name: d.user.name || '',
            email: d.user.email || '',
            username: d.user.username || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          })
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
    // Validate
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      alert('New passwords do not match')
      return
    }

    setSaving(true)
    try {
      // Only send fields that should be updated
      const payload: any = { name: form.name }
      if (form.newPassword) payload.password = form.newPassword

      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      })
      const d = await res.json()
      if (!res.ok) {
        alert(d.error || 'Failed to save settings')
      } else {
        alert('Settings saved successfully')
        router.push('/profile')
      }
    } catch (e) {
      alert('Failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center"><div className="text-white/70">Loading...</div></div>
  if (!user) return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center"><div className="text-white/70">Not authenticated</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-12">
      <main className="max-w-3xl mx-auto px-4">
        <div className="glass rounded-2xl border border-white/20 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Account Settings</h1>
              <p className="text-white/70 mt-1">Update your profile name or change your password. Username and email are read-only.</p>
            </div>
            <div className="flex items-center gap-3">
              <img src="/avatar.png" alt="avatar" className="w-12 h-12 rounded-full object-cover bg-black/20" />
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <label className="text-white/70">Username</label>
              <div className="md:col-span-2 flex items-center gap-3">
                <User className="w-5 h-5 text-white/60" />
                <input readOnly value={form.username} className="w-full px-3 py-2 rounded bg-black/20 border border-white/10 text-white/80" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <label className="text-white/70">Email</label>
              <div className="md:col-span-2 flex items-center gap-3">
                <Mail className="w-5 h-5 text-white/60" />
                <input readOnly value={form.email} className="w-full px-3 py-2 rounded bg-black/20 border border-white/10 text-white/80" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <label className="text-white/70">Full name</label>
              <div className="md:col-span-2 flex items-center gap-3">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded bg-black/20 border border-white/10 text-white" />
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <h3 className="text-lg font-semibold mb-3">Change password</h3>
              <p className="text-white/70 text-sm mb-4">Leave blank to keep your current password. Password must be at least 6 characters.</p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-white/60" />
                  <input type="password" placeholder="New password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} className="w-full px-3 py-2 rounded bg-black/20 border border-white/10 text-white" />
                </div>
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-white/60" />
                  <input type="password" placeholder="Confirm new password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="w-full px-3 py-2 rounded bg-black/20 border border-white/10 text-white" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-white/70">Last updated: <span className="font-medium text-white">{new Date(user.updatedAt || user.createdAt).toLocaleString()}</span></div>
              <div className="flex items-center gap-3">
                <a href="/profile" className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white">Cancel</a>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-green-500 rounded-lg text-white font-medium flex items-center gap-2">
                  {saving ? 'Saving...' : (<><Check className="w-4 h-4" /> Save Changes</>)}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
