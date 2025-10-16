"use client"

import { useEffect, useMemo, useState } from 'react'
import { Search, Calendar, Eye, Edit2, Trash2, User, UserPlus, Coins, Plus, Pencil, X } from 'lucide-react'
import Pagination from '../../../components/Admin/Pagination'
import { useRouter } from 'next/navigation'

interface AdminUser {
  id: number
  name: string
  email: string
  username: string
  plan: 'Free' | 'Basic' | 'Premium' | 'Cinematic'
  comments: number
  reviews: number
  credits: number
  status: 'Approved' | 'Banned'
  createdAt: string
}

export default function UsersContent() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'date' | 'comments' | 'reviews' | 'name'>('date')
  const [page, setPage] = useState(1)
  const [creditModal, setCreditModal] = useState<{ id: number; mode: 'add' | 'edit' } | null>(null)
  const [creditAmount, setCreditAmount] = useState<string>('')
  const [active, setActive] = useState<AdminUser | null>(null)
  const [userModal, setUserModal] = useState<{ mode: 'add' | 'edit'; data: Partial<AdminUser> } | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const pageSize = 10

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError('')
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(query && { search: query }),
      })

      const response = await fetch(`/api/admin/users?${params}`)
      if (!response.ok) throw new Error('Failed to fetch users')
      
      const data = await response.json()
      setUsers(data.users || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, query])

  const sorted = useMemo(() => {
    const rows = [...users]
    if (sort === 'date') return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    if (sort === 'comments') return rows.sort((a, b) => b.comments - a.comments)
    if (sort === 'reviews') return rows.sort((a, b) => b.reviews - a.reviews)
    return rows.sort((a, b) => a.name.localeCompare(b.name))
  }, [users, sort])

  const total = users.length
  const nf = new Intl.NumberFormat('en-US')

  const toggleStatus = async (id: number) => {
    const user = users.find(u => u.id === id)
    if (!user) return
    
    try {
      setSaving(true)
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: user.status === 'Approved' ? 'Banned' : 'Approved',
        }),
      })
      
      if (!response.ok) throw new Error('Failed to update user')
      
      setUsers(users.map(u => 
        u.id === id ? { ...u, status: u.status === 'Approved' ? 'Banned' : 'Approved' } : u
      ))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const removeUser = async (id: number) => {
    if (!confirm('Delete this user?')) return
    
    try {
      setSaving(true)
      const response = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to delete user')
      
      setUsers(users.filter(u => u.id !== id))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const addCredits = async (id: number, amount: number) => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/users/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, amount }),
      })
      
      if (!response.ok) throw new Error('Failed to add credits')
      
      const data = await response.json()
      setUsers(users.map(u => u.id === id ? { ...u, credits: data.credits } : u))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const setCredits = async (id: number, amount: number) => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/users/credits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, amount }),
      })
      
      if (!response.ok) throw new Error('Failed to update credits')
      
      const data = await response.json()
      setUsers(users.map(u => u.id === id ? { ...u, credits: data.credits } : u))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const resetCredits = async (id: number) => {
    try {
      setSaving(true)
      const response = await fetch(`/api/admin/users/credits?userId=${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to reset credits')
      
      const data = await response.json()
      setUsers(users.map(u => u.id === id ? { ...u, credits: data.credits } : u))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const openAddCredits = (id: number) => { setCreditAmount(''); setCreditModal({ id, mode: 'add' }) }
  const openEditCredits = (id: number, current: number) => { setCreditAmount(String(current)); setCreditModal({ id, mode: 'edit' }) }

  const saveCredits = () => {
    if (!creditModal) return
    const value = Number(creditAmount)
    if (Number.isNaN(value)) return
    if (creditModal.mode === 'add') addCredits(creditModal.id, value)
    else setCredits(creditModal.id, value)
    setCreditModal(null)
  }

  const openAddUser = () => router.push('/admin/users/add')
  const openEditUser = (u: AdminUser) => setUserModal({ mode: 'edit', data: { ...u } })

  const saveUser = async () => {
    if (!userModal) return
    const d = userModal.data
    if (!d.name || !d.email || !d.username || !d.status) return

    try {
      setSaving(true)
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: d.id,
          name: d.name,
          email: d.email,
          username: d.username,
          status: d.status,
        }),
      })

      if (!response.ok) throw new Error('Failed to update user')

      const updatedUser = await response.json()
      setUsers(users.map(u => u.id === d.id ? updatedUser.user : u))
      setUserModal(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number)
    const dd = String(d).padStart(2, '0')
    const mm = String(m).padStart(2, '0')
    return `${dd}.${mm}.${y}`
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
          {error}
          <button onClick={() => setError('')} className="float-right text-red-400 hover:text-red-300">×</button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Users <span suppressHydrationWarning className="text-white/50 text-sm align-middle ml-2">{nf.format(total)} Total</span></h1>
        <button onClick={openAddUser} className="px-4 py-2 rounded-lg border border-orange-500 text-orange-400 hover:bg-orange-500/10 transition-colors flex items-center gap-2 disabled:opacity-50" disabled={saving}>
          <UserPlus className="w-4 h-4" />
          ADD USER
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-white/60" />
          <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="bg-transparent text-white/80 text-sm focus:outline-none">
            <option value="date">Date created</option>
            <option value="comments">Comments</option>
            <option value="reviews">Reviews</option>
            <option value="name">Name</option>
          </select>
        </div>
        <div className="ml-auto bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2 w-full md:w-80">
          <Search className="w-4 h-4 text-white/60" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users..." className="bg-transparent text-white/80 text-sm w-full placeholder-white/40 focus:outline-none" />
        </div>
      </div>

      <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
        {loading ? (
          <div className="p-8 text-center text-white/60">Loading users...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/60 border-b border-white/10">
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Username</th>
                    <th className="px-4 py-3 text-left">Plan</th>
                    <th className="px-4 py-3 text-left">Comments</th>
                    <th className="px-4 py-3 text-left">Reviews</th>
                    <th className="px-4 py-3 text-left">Credits</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Created Date</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-8 text-center text-white/50">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    sorted.map((row) => (
                      <tr key={row.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-4 py-3 text-white/70">{row.id}</td>
                        <td className="px-4 py-3 text-white hover:underline cursor-pointer" onClick={() => setActive(row)}>{row.name}</td>
                        <td className="px-4 py-3 text-white/80">{row.email}</td>
                        <td className="px-4 py-3 text-white/80">{row.username}</td>
                        <td className="px-4 py-3 text-white/80">{row.plan}</td>
                        <td className="px-4 py-3 text-white/80">{nf.format(row.comments)}</td>
                        <td className="px-4 py-3 text-white/80">{nf.format(row.reviews)}</td>
                        <td className="px-4 py-3 text-white/80">{nf.format(row.credits)}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleStatus(row.id)} disabled={saving} className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors disabled:opacity-50 ${row.status === 'Approved' ? 'text-green-400 border-green-500/40 bg-green-500/10 hover:bg-green-500/20' : 'text-white/70 border-white/20 bg-white/5 hover:bg-white/10'}`}>{row.status}</button>
                        </td>
                        <td className="px-4 py-3 text-white/60">{formatDate(row.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setActive(row)} disabled={saving} className="p-2 rounded-md bg-white/5 hover:bg-white/10 disabled:opacity-50 transition-colors" aria-label="Preview"><Eye className="w-4 h-4 text-white" /></button>
                            <button onClick={() => openEditUser(row)} disabled={saving} className="p-2 rounded-md bg-white/5 hover:bg-white/10 disabled:opacity-50 transition-colors" aria-label="Edit"><Edit2 className="w-4 h-4 text-blue-300" /></button>
                            <button onClick={() => (row.credits ? openEditCredits(row.id, row.credits) : openAddCredits(row.id))} disabled={saving} className="p-2 rounded-md bg-white/5 hover:bg-white/10 disabled:opacity-50 transition-colors" aria-label="Credits"><Coins className="w-4 h-4 text-yellow-300" /></button>
                            {row.credits > 0 && (
                              <button onClick={() => resetCredits(row.id)} disabled={saving} className="p-2 rounded-md bg-white/5 hover:bg-white/10 disabled:opacity-50 transition-colors" aria-label="Reset credits"><Pencil className="w-4 h-4 text-emerald-300 rotate-90" /></button>
                            )}
                            <button onClick={() => removeUser(row.id)} disabled={saving} className="p-2 rounded-md bg-white/5 hover:bg-white/10 disabled:opacity-50 transition-colors" aria-label="Delete"><Trash2 className="w-4 h-4 text-red-400" /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between p-4 border-t border-white/10">
              <div className="text-xs text-white/50">{total === 0 ? 0 : 1}–{Math.min(pageSize, total)} of {total}</div>
              <Pagination total={total} pageSize={pageSize} page={page} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      {active && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setActive(null)}>
          <div className="w-full max-w-md bg-black/30 border border-white/10 rounded-xl p-5 backdrop-blur-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">{active.name}</h3>
              <button className="p-1 hover:bg-white/10 rounded-md" onClick={() => setActive(null)}><X className="w-4 h-4 text-white/70" /></button>
            </div>
            <div className="text-white/80 text-sm space-y-2">
              <div>Email: {active.email}</div>
              <div>Username: {active.username}</div>
              <div>Plan: {active.plan}</div>
              <div>Comments: {nf.format(active.comments)}</div>
              <div>Reviews: {nf.format(active.reviews)}</div>
              <div>Credits: {nf.format(active.credits)}</div>
              <div>Status: {active.status}</div>
              <div>Created: {formatDate(active.createdAt)}</div>
            </div>
          </div>
        </div>
      )}

      {creditModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setCreditModal(null)}>
          <div className="w-full max-w-sm bg-black/30 border border-white/10 rounded-xl p-5 backdrop-blur-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">{creditModal.mode === 'add' ? 'Add credits' : 'Set credits'}</h3>
              <button className="p-1 hover:bg-white/10 rounded-md" onClick={() => setCreditModal(null)}><X className="w-4 h-4 text-white/70" /></button>
            </div>
            <div className="grid gap-3 text-sm">
              <input value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} placeholder="Amount" type="number" className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30" />
              <div className="flex items-center justify-end gap-2 mt-1">
                <button onClick={() => setCreditModal(null)} className="px-3 py-2 rounded-md border border-white/10 text-white/70 hover:bg-white/10 transition-colors disabled:opacity-50" disabled={saving}>Cancel</button>
                <button onClick={saveCredits} className="px-3 py-2 rounded-md border border-orange-500 text-orange-400 hover:bg-orange-500/10 transition-colors disabled:opacity-50" disabled={saving || Number.isNaN(Number(creditAmount))}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {userModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setUserModal(null)}>
          <div className="w-full max-w-md bg-black/30 border border-white/10 rounded-xl p-5 backdrop-blur-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold">{userModal.mode === 'add' ? 'Add user' : 'Edit user'}</h3>
              <button className="p-1 hover:bg-white/10 rounded-md" onClick={() => setUserModal(null)}><X className="w-4 h-4 text-white/70" /></button>
            </div>
            <div className="grid gap-3 text-sm">
              <input value={userModal.data.name as any} onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, name: e.target.value } })} placeholder="Full name" className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30" />
              <input value={userModal.data.email as any} onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, email: e.target.value } })} placeholder="Email" className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30" />
              <input value={userModal.data.username as any} onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, username: e.target.value } })} placeholder="Username" className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/30" />
              <div className="grid grid-cols-2 gap-3">
                <select value={userModal.data.status as any} onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, status: e.target.value as any } })} className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/30">
                  <option>Approved</option>
                  <option>Banned</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 mt-1">
                <button onClick={() => setUserModal(null)} className="px-3 py-2 rounded-md border border-white/10 text-white/70 hover:bg-white/10 transition-colors disabled:opacity-50" disabled={saving}>Cancel</button>
                <button onClick={saveUser} className="px-3 py-2 rounded-md border border-orange-500 text-orange-400 hover:bg-orange-500/10 transition-colors disabled:opacity-50" disabled={saving || !userModal.data.name || !userModal.data.email || !userModal.data.username}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
