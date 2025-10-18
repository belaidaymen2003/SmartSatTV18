'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  Satellite, 
  Search, 
  User, 
  Settings, 
  Bell, 
  LogOut,
  Coins,
  Menu,
  X
} from 'lucide-react'
import logo from '../../public/Logo2.png'
import ProfileDropdown from '../ProfileDropdown'

interface HeaderProps {
  credits?: number
  userEmail?: string
  onLogout?: () => void
}

export default function Header({ credits = 0, userEmail = '', onLogout }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  const [sessionEmail, setSessionEmail] = useState(userEmail)
  const [sessionCredits, setSessionCredits] = useState(credits)

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' })
        if (!res.ok) return
        const data = await res.json()
        setSessionEmail(data.user?.email || '')
        setSessionCredits(data.user?.credits || 0)
      } catch (err) {
        // ignore
      }
    }
    fetchMe()
  }, [])

  const handleLogout = async () => {
    if (onLogout) {
      onLogout()
    } else {
      try {
        await fetch('/api/auth/logout', { method: 'POST' })
      } catch (e) {
        // ignore
      }
      localStorage.removeItem('userCredits')
      localStorage.removeItem('userEmail')
      window.location.href = '/'
    }
  }

  return (
    <header className="glass-dark border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image 
              src={logo} 
              alt="SmartSatTV Logo" 
              width={60} 
              height={60} 
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="/dashboard" className="text-white/80 hover:text-white transition-colors">Home</a>
            <a href="/catalog" className="text-white/80 hover:text-white transition-colors">Catalog</a>
            <a href="/shop" className="text-white/80 hover:text-white transition-colors">Shop</a>
            <a href="/live" className="text-white/80 hover:text-white transition-colors">Live TV</a>
            <a href="/search" className="text-white/80 hover:text-white transition-colors">Search</a>
            <a href="/profile" className="text-white/80 hover:text-white transition-colors">My Space</a>
          </nav>

          {/* User Info & Actions */}
          <div className="flex items-center gap-4">
            {/* Credits Display */}
            {/* Credits are shown inside the profile dropdown only */}
            
            {/* Desktop Actions: single profile dropdown */}
            <div className="hidden md:flex items-center gap-3">
              {sessionEmail && (
                <div>
                  <ProfileDropdown />
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <nav className="flex flex-col gap-4">
              <button
                onClick={() => { setIsMenuOpen(false); window.location.href = '/dashboard' }}
                className="text-white/80 hover:text-white transition-colors text-left"
              >
                Home
              </button>
              <button
                onClick={() => { setIsMenuOpen(false); window.location.href = '/catalog' }}
                className="text-white/80 hover:text-white transition-colors text-left"
              >
                Catalog
              </button>
              <button
                onClick={() => { setIsMenuOpen(false); window.location.href = '/shop' }}
                className="text-white/80 hover:text-white transition-colors text-left"
              >
                Shop
              </button>
              <button
                onClick={() => { setIsMenuOpen(false); window.location.href = '/live' }}
                className="text-white/80 hover:text-white transition-colors text-left"
              >
                Live TV
              </button>
              <button
                onClick={() => { setIsMenuOpen(false); window.location.href = '/search' }}
                className="text-white/80 hover:text-white transition-colors text-left"
              >
                Search
              </button>
              <button
                onClick={() => { setIsMenuOpen(false); window.location.href = '/profile' }}
                className="text-white/80 hover:text-white transition-colors text-left"
              >
                My Space
              </button>
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-colors"
                >
                  <LogOut className="w-5 h-5 text-red-400" />
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
