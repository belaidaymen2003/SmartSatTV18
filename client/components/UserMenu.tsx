import { useState } from 'react'
import Link from 'next/link'
import { User, LogOut, Settings, Clock, Heart } from 'lucide-react'

export default function UserMenu({ email }: { email?: string }) {
  const [open, setOpen] = useState(false)
  const username = email ? email.split('@')[0] : 'User'

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/'
    } catch (e) {
      window.location.href = '/'
    }
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
        <User className="w-4 h-4 text-white" />
        <span className="text-white text-sm">{username}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-slate-800/90 border border-white/10 rounded-lg shadow-lg py-2 z-50">
          <Link href="/profile" className="block px-4 py-2 hover:bg-white/5">Profile</Link>
          <Link href="/profile/settings" className="block px-4 py-2 hover:bg-white/5">Settings</Link>
          <Link href="/profile/history" className="block px-4 py-2 hover:bg-white/5">History</Link>
          <Link href="/profile/favorites" className="block px-4 py-2 hover:bg-white/5">Favorites</Link>
          <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-white/5">Logout</button>
        </div>
      )}
    </div>
  )
}
