'use client'
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../../components/Layout/Header'
import { User as UserIcon, KeyRound, Save, ArrowLeft } from 'lucide-react'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [credits, setCredits] = useState(0)
  const [userEmail, setUserEmail] = useState('')

  const [form, setForm] = useState({ name: '', username: '', password: '', confirmPassword: '' })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
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
          setForm({ name: d.user.name || '', username: d.user.username || '', password: '', confirmPassword: '' })
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
    setError(null)
    setSuccess(null)

    if (form.password && form.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }
    if (form.password && form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSaving(true)
    try {
      const payload: any = { name: form.name, username: form.username }
      if (form.password) payload.password = form.password

      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      })
      const d = await res.json()
      if (!res.ok) {
        setError(d.error || 'Failed to save changes')
      } else {
        setSuccess('Your settings have been updated successfully.')
        setForm(prev => ({ ...prev, password: '', confirmPassword: '' }))
        setTimeout(() => router.push('/profile'), 800)
      }
    } catch (e) {
      setError('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header credits={credits} userEmail={userEmail} />
      <main className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p className="text-white/60">Loading...</p>
      </main>
    </div>
  )

  if (!user) return (
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button onClick={() => router.push('/profile')} className="mb-6 inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Profile
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-white/70">Update your profile details and password</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-300">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Details */}
          <section className="glass rounded-2xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-white/80" /> Profile Details
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-white/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Username</label>
                <input
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="Choose a unique username"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-white/30 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-white disabled:opacity-60"
                >
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </section>

          {/* Change Password */}
          <section className="glass rounded-2xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-white/80" /> Change Password
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-1">New Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter a new password"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-white/30 focus:outline-none"
                />
                <p className="mt-1 text-xs text-white/50">Leave blank to keep your current password.</p>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-white/30 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-60"
                >
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}
