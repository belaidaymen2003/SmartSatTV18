"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Pagination from '../../../../components/Admin/Pagination'
import Spinner from '../../../../components/UI/Spinner'
import EditAppModal from '../../../../components/Categories/EditAppModal'
import ConfirmModal from '../../../../components/UI/ConfirmModal'
import Toast from '../../../../components/UI/Toast'

export const dynamic = 'force-dynamic'

type AppItem = {
  id: number
  name: string
  description: string | null
  downloadLink: string
  image: string | null
  credit: number
  version: string | null
  createdAt: string
}

export default function DownloadAppAdminPage() {
  const router = useRouter()
  const [items, setItems] = useState<AppItem[]>([])
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchList = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q.trim()) params.set('q', q.trim())
      params.set('page', String(page))
      params.set('pageSize', String(pageSize))
      const res = await fetch(`/api/admin/catalog/appdownload?${params.toString()}`)
      const d = await res.json().catch(() => ({}))
      setItems(d.apps || [])
      setTotal(d.total || 0)
    } catch (err) {
      console.error(err)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchList() }, [q, page, pageSize])

  const openCreate = () => {
    router.push('/admin/catalog/add/downloadapp')
  }

  const openEdit = (it: AppItem) => {
    router.push(`/admin/catalog/add/downloadapp?id=${it.id}`)
  }

  const remove = async (id: number) => {
    if (!confirm('Delete this item?')) return
    try {
      const res = await fetch(`/api/admin/catalog/appdownload?id=${id}`, { method: 'DELETE' })
      const d = await res.json().catch(()=>({}))
      if (!res.ok) return alert(d?.error || 'Delete failed')
      fetchList()
    } catch (err) { console.error(err); alert('Failed') }
  }

  const columns = useMemo(() => ['Name', 'Version', 'Credit', 'Created', 'Actions'], [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Downloadable Apps</h1>
        <div className="flex items-center gap-3">
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} placeholder="Search name or version" className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30" />
          <button onClick={openCreate} className="px-4 py-2 rounded-lg border border-orange-500 text-orange-400 hover:bg-orange-500/10">Add App</button>
        </div>
      </div>

      <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-4">
        {loading ? (
          <div className="py-10 grid place-items-center"><Spinner /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-white/50 border-b border-white/10">
                  {columns.map((c) => (<th key={c} className="py-3 pr-4 font-medium text-xs uppercase tracking-wider">{c}</th>))}
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-3 pr-4 text-white/80">
                      <div className="flex items-center gap-3">
                        {it.image ? (<img src={it.image} alt="img" className="w-10 h-10 rounded-md object-cover"/>) : (<div className="w-10 h-10 rounded-md bg-white/5 grid place-items-center text-xs">No</div>)}
                        <div>
                          <div className="font-medium">{it.name}</div>
                          <a className="text-xs text-white/50 hover:underline" href={it.downloadLink} target="_blank" rel="noreferrer">Open link</a>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-white/80">{it.version || '-'}</td>
                    <td className="py-3 pr-4 text-white/80">{it.credit ?? 0}</td>
                    <td className="py-3 pr-4 text-white/80">{new Date(it.createdAt).toLocaleString()}</td>
                    <td className="py-3 pr-4 text-white/80">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(it)} className="px-3 py-1 text-sm rounded border border-white/10 hover:bg-white/5">Edit</button>
                        <button onClick={() => remove(it.id)} className="px-3 py-1 text-sm rounded border border-red-600 text-red-400 hover:bg-red-600/10">Delete</button>
                        <a href={it.downloadLink} target="_blank" rel="noreferrer" className="px-3 py-1 text-sm rounded border border-green-600 text-green-400 hover:bg-green-600/10">Download</a>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-white/60">No items</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div>
            <label className="text-white/60 text-sm">Page size: </label>
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }} className="ml-2 bg-black/40 border border-white/10 rounded px-2 py-1 text-white">
              {[6,12,24,48].map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>
          <Pagination total={total} pageSize={pageSize} page={page} onPageChange={(p) => setPage(p)} />
        </div>
      </div>
    </div>
  )
}
