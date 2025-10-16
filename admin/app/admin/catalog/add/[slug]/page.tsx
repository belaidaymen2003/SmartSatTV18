"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, Image as ImageIcon, Link as LinkIcon, Upload } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function DynamicAddPage({ params }:{ params: { slug: string } }) {
  const { slug } = params
  const router = useRouter()
  const search = useSearchParams()

  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [version, setVersion] = useState('')
  const [credit, setCredit] = useState<number>(0)
  const [downloadLink, setDownloadLink] = useState('')
  const [image, setImage] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')

  const idParam = search?.get('id')
  const isDownloadApp = slug === 'downloadapp'

  useEffect(() => {
    if (!isDownloadApp) return
    if (!idParam) return
    let mounted = true
    setLoading(true)
    fetch(`/api/admin/catalog/appdownload?id=${idParam}`)
      .then((r) => r.json())
      .then((d:any) => {
        if (!mounted) return
        const app = d.app
        if (!app) return
        setName(app.name || '')
        setVersion(app.version || '')
        setCredit(app.credit ?? 0)
        setDownloadLink(app.downloadLink || '')
        setImage(app.image || '')
        setDescription(app.description || '')
      })
      .catch(console.error)
      .finally(() => setLoading(false))
    return () => { mounted = false }
  }, [idParam, slug])

  if (!isDownloadApp) {
    return (
      <div className="text-white">Unknown add page: {slug}</div>
    )
  }

  const onSubmit = async () => {
    if (!name.trim() || !downloadLink.trim()) return alert('Name and download link required')
    setLoading(true)
    try {
      const payload:any = { name, version, credit: Number(credit), downloadLink, image, description }

      // If an image file was selected upload it first
      if (imageFile) {
        const fd = new FormData()
        fd.append('file', imageFile)
        fd.append('fileName', imageFile.name)
        if (idParam) fd.append('appId', String(idParam))
        if (image) fd.append('oldImageUrl', String(image))
        const uploadMethod = idParam ? 'PUT' : 'POST'
        const upRes = await fetch('/api/admin/catalog/upload', { method: uploadMethod, body: fd })
        const upJson = await upRes.json().catch(()=>({}))
        if (!upRes.ok) return alert(upJson?.error || 'Image upload failed')
        payload.image = upJson.imageUrl || payload.image
      }

      const method = idParam ? 'PUT' : 'POST'
      if (idParam) payload.id = Number(idParam)
      const res = await fetch('/api/admin/catalog/appdownload', { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      const d = await res.json().catch(()=>({}))
      if (!res.ok) return alert(d?.error || 'Failed')
      router.push('/admin/catalog/downloadapp')
    } catch (err) {
      console.error(err)
      alert('Failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">{idParam ? 'Edit' : 'Add'} Downloadable App</h1>
      </div>

      <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        {loading ? (
          <div className="py-10 grid place-items-center">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="md:col-span-8 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white" />
            <input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="Version" className="md:col-span-2 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white" />
            <input value={String(credit)} onChange={(e) => setCredit(Number(e.target.value))} placeholder="Credit" className="md:col-span-2 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white" />

            <input value={downloadLink} onChange={(e) => setDownloadLink(e.target.value)} placeholder="Download link" className="md:col-span-12 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white" />

            <div className="md:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg px-3 py-2">
                <ImageIcon className="w-4 h-4 text-white/60" />
                <input value={image} onChange={(e) => setImage(e.target.value)} placeholder="Image URL" className="bg-transparent text-white placeholder-white/30 w-full outline-none" />
              </label>
              <label className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg px-3 py-2">
                <Upload className="w-4 h-4 text-white/60" />
                <span className="ml-2 text-white/70">Browse</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              </label>
            </div>

            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="md:col-span-12 h-28 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white" />

            <div className="md:col-span-12 flex items-center gap-3">
              <button onClick={onSubmit} className="px-4 py-2 rounded-lg border border-orange-500 text-orange-400 hover:bg-orange-500/10">{idParam ? 'Update' : 'Create'}</button>
              <button onClick={() => router.push('/admin/catalog/downloadapp')} className="px-4 py-2 rounded-lg border border-white/10 text-white/60">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
