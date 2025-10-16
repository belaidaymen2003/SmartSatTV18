"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Mail, AtSign, BadgeDollarSign, CheckCircle2, Lock, Hash } from 'lucide-react'

const statuses = ['Approved', 'Banned'] as const

export default function AddUserPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [credits, setCredits] = useState(0)
  const [status, setStatus] = useState<typeof statuses[number]>('Approved')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const publish = async () => {
    if (!name.trim() || !email.trim() || !username.trim() || !password.trim()) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          username: username.trim(),
          password: password.trim(),
          credits: Math.max(0, credits),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create user')
        return
      }

      router.push('/admin/users')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && name.trim() && email.trim() && username.trim() && password.trim()) {
      publish()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Add User</h1>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">×</button>
        </div>
      )}

      <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Full name"
            disabled={loading}
            className="md:col-span-6 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30 disabled:opacity-50"
          />

          <label className="md:col-span-6 flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg px-3 py-2 focus-within:border-white/30 disabled:opacity-50">
            <Mail className="w-4 h-4 text-white/60" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Email"
              type="email"
              disabled={loading}
              className="bg-transparent text-white placeholder-white/30 w-full outline-none disabled:opacity-50"
            />
          </label>

          <label className="md:col-span-6 flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg px-3 py-2 focus-within:border-white/30 disabled:opacity-50">
            <AtSign className="w-4 h-4 text-white/60" />
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Username"
              disabled={loading}
              className="bg-transparent text-white placeholder-white/30 w-full outline-none disabled:opacity-50"
            />
          </label>

          <label className="md:col-span-6 flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg px-3 py-2 focus-within:border-white/30 disabled:opacity-50">
            <Lock className="w-4 h-4 text-white/60" />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Password"
              type="password"
              disabled={loading}
              className="bg-transparent text-white placeholder-white/30 w-full outline-none disabled:opacity-50"
            />
          </label>

          <label className="md:col-span-4 flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg px-3 py-2 focus-within:border-white/30 disabled:opacity-50">
            <BadgeDollarSign className="w-4 h-4 text-white/60" />
            <input
              value={credits}
              onChange={(e) => setCredits(Number(e.target.value))}
              onKeyDown={handleKeyDown}
              type="number"
              min={0}
              placeholder="Initial credits"
              disabled={loading}
              className="bg-transparent text-white placeholder-white/30 w-full outline-none disabled:opacity-50"
            />
          </label>

          <div className="md:col-span-8">
            <div className="text-white/70 text-sm mb-2">Status</div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              disabled={loading}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/30 disabled:opacity-50"
            >
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            disabled={loading}
            className="px-5 py-2 rounded-lg border border-white/10 text-white/70 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            disabled={loading || !name.trim() || !email.trim() || !username.trim() || !password.trim()}
            onClick={publish}
            className="px-5 py-2 rounded-lg border border-orange-500 text-orange-400 hover:bg-orange-500/10 disabled:opacity-60 inline-flex items-center gap-2 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Creating...' : 'Create user'}
          </button>
        </div>

        <p className="mt-4 text-xs text-white/50">
          All fields marked with * are required. The password will be used for the user's initial login.
        </p>
      </div>
    </div>
  )
}
