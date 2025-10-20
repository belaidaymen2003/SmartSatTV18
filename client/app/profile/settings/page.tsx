'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Layout/Header'
import { Save, X, Eye, EyeOff, Mail, User, Lock } from 'lucide-react'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [credits, setCredits] = useState(0)
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '' })
  const router = useRouter()

  useEffect(() => {
    const storedCredits = localStorage.getItem('userCredits')
    const storedEmail = localStorage.getItem('userEmail')
    if (storedCredits) setCredits(parseInt(storedCredits))
    if (storedEmail) setUserEmail(storedEmail)
  }, [])

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
            password: ''
          })
        }
      } catch (e) {
        router.push('/')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchData()
    return () => {
      mounted = false
    }
  }, [router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include'
      })
      const d = await res.json()
      if (!res.ok) {
        setErrorMessage(d.error || 'Failed to save changes')
      } else {
        setSuccessMessage('Settings saved successfully!')
        setUser(d.user)
        setForm({ ...form, password: '' })
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (e) {
      setErrorMessage('An error occurred while saving')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value })
    setErrorMessage('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Header credits={credits} userEmail={userEmail} />
        <div className="flex items-center justify-center h-96">
          <div className="text-white/60">Loading...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <Header credits={credits} userEmail={userEmail} />
        <div className="flex items-center justify-center h-96">
          <div className="text-white/60">Not authenticated</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header credits={credits} userEmail={userEmail} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold">Account Settings</h1>
          <p className="text-white/60 mt-2">Manage your profile and account preferences</p>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-3">
            <div className="w-1 h-8 bg-green-500 rounded-full" />
            <div className="flex-1">{successMessage}</div>
            <button onClick={() => setSuccessMessage('')} className="text-white/60 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
            <div className="w-1 h-8 bg-red-500 rounded-full" />
            <div className="flex-1">{errorMessage}</div>
            <button onClick={() => setErrorMessage('')} className="text-white/60 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Settings Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Profile Section */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
              Profile Information
            </h2>

            {/* Name Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-3">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-3">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                />
              </div>
              <p className="text-xs text-white/40 mt-2">Your email is used for account recovery and notifications</p>
            </div>

            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                />
              </div>
              <p className="text-xs text-white/40 mt-2">Your unique username for logging in</p>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-500 rounded-full" />
              Security
            </h2>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Leave blank to keep current password"
                  className="w-full pl-12 pr-12 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-white/40 mt-2">Leave blank if you don't want to change your password</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/profile')}
              className="px-6 py-3 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all duration-300 font-semibold"
            >
              Cancel
            </button>
          </div>

          {/* Info Section */}
          <div className="mt-8 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <p className="text-sm text-white/70">
              <span className="font-semibold text-white">Pro Tip:</span> Your account is secure and protected. We never share your personal information with third parties.
            </p>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8 flex items-center justify-between text-sm text-white/60">
          <div>© 2025 SMART SAT TV. All rights reserved.</div>
          <div>Need help? <a href="/support" className="underline hover:text-white transition-colors">Contact Support</a></div>
        </div>
      </footer>
    </div>
  )
}
