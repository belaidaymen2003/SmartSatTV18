'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Bell, User, LogOut, Settings, CreditCard } from 'lucide-react'

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const nodeRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (!res.ok) return
        const d = await res.json()
        setUser(d.user)
      } catch (e) {
        // ignore
      }
    }
    fetchMe()
  }, [])

  useEffect(() => {
    async function fetchNotifs() {
      try {
        const res = await fetch('/api/user/notifications', { credentials: 'include' })
        if (!res.ok) return
        const d = await res.json()
        setNotifications(d.notifications || [])
      } catch (e) {
        // ignore
      }
    }
    // always fetch notifications count in background (no list shown in dropdown)
    fetchNotifs()
  }, [])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (nodeRef.current && !nodeRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch (e) {
      // ignore
    }
    try {
      localStorage.removeItem('userEmail')
      localStorage.removeItem('userCredits')
      localStorage.removeItem('watchlist')
    } catch (e) {}
    window.location.href = '/'
  }

  return (
    <div className="relative" ref={nodeRef}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
        <div className="relative">
          <Bell className="w-5 h-5 text-white" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs rounded-full bg-red-500 text-white">{notifications.length}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-white" />
          <div className="text-white/90 text-sm">{user?.name || user?.email?.split('@')[0] || 'User'}</div>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-96 bg-slate-900/95 border border-white/10 rounded-lg shadow-2xl z-50 overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center gap-3">
            <User className="w-6 h-6 text-white/90" />
            <div className="flex-1">
              <div className="text-white font-semibold">{user?.name || user?.email}</div>
              <div className="text-xs text-white/60">{user?.email}</div>
            </div>
            <div className="ml-2 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-yellow-400" />
              <span className="text-white text-sm font-semibold">{user?.credits ?? 0} Credits</span>
            </div>
          </div>

          <div className="p-3">
            <div className="text-sm font-medium text-white/80 mb-2">Notifications</div>
            <div className="text-xs text-white/60">You have {notifications.length} notifications. View them using the bell icon.</div>
          </div>

          <div className="p-3 border-t border-white/5 grid grid-cols-2 gap-2">
            <Link href="/profile" className="block text-center py-2 rounded bg-white/5 hover:bg-white/10">Profile</Link>
            <Link href="/profile/settings" className="block text-center py-2 rounded bg-white/5 hover:bg-white/10">Settings</Link>
          </div>

          <div className="p-3 border-t border-white/5">
            <button onClick={handleLogout} className="w-full py-2 rounded bg-red-600 text-white hover:opacity-95">Logout</button>
          </div>
        </div>
      )}
    </div>
  )
}
