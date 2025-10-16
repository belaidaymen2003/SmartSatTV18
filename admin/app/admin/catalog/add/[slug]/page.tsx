"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Image as ImageIcon, Upload } from 'lucide-react'
import UploadPreview from '@/components/UI/UploadPreview'
import { uploadWithProgress } from '@/lib/upload'

export const dynamic = 'force-dynamic'

export default function DynamicAddPage({ params }:{ params: { slug: string } }) {
  const { slug } = params
  const router = useRouter()
  const search = useSearchParams()

  const idParam = search?.get('id')
  const isDownloadApp = slug === 'downloadapp'
  const isDemoVideo = slug === 'demonstrationvideo'

  // Download app state
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [version, setVersion] = useState('')
  const [credit, setCredit] = useState<number>(0)
  const [downloadLink, setDownloadLink] = useState('')
  const [image, setImage] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [imageUploadProgress, setImageUploadProgress] = useState<number | null>(null)
  const [description, setDescription] = useState('')

  // Demonstration video state
  const [vTitle, setVTitle] = useState('')
  const [vPrice, setVPrice] = useState<number>(0)
  const [vThumb, setVThumb] = useState('')
  const [vThumbFile, setVThumbFile] = useState<File | null>(null)
  const [vUrl, setVUrl] = useState('')
  const [vFile, setVFile] = useState<File | null>(null)
  const [vDesc, setVDesc] = useState('')
  const [thumbPreviewUrl, setThumbPreviewUrl] = useState<string | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [thumbUploadProgress, setThumbUploadProgress] = useState<number | null>(null)
  const [videoUploadProgress, setVideoUploadProgress] = useState<number | null>(null)

  useEffect(() => {
    if (!isDownloadApp && !isDemoVideo) return
    if (!idParam) return
    let mounted = true
    setLoading(true)
    const url = isDownloadApp ? `/api/admin/catalog/appdownload?id=${idParam}` : `/api/admin/catalog/demonstrationvideo?id=${idParam}`
    fetch(url)
      .then((r) => r.json())
      .then((d:any) => {
        if (!mounted) return
        if (isDownloadApp) {
          const app = d.app
          if (!app) return
          setName(app.name || '')
          setVersion(app.version || '')
          setCredit(app.credit ?? 0)
          setDownloadLink(app.downloadLink || '')
          setImage(app.image || '')
          setImagePreviewUrl(app.image || null)
          setDescription(app.description || '')
        } else if (isDemoVideo) {
          const video = d.video
          if (!video) return
          setVTitle(video.title || '')
          setVPrice(video.price ?? 0)
          setVThumb(video.thumbnail || '')
          setVUrl(video.videoUrl || '')
          setVDesc(video.description || '')
          setThumbPreviewUrl(video.thumbnail || null)
          setVideoPreviewUrl(video.videoUrl || null)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
    return () => { mounted = false }
  }, [idParam, slug])

  // cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (thumbPreviewUrl && thumbPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(thumbPreviewUrl)
      if (videoPreviewUrl && videoPreviewUrl.startsWith('blob:')) URL.revokeObjectURL(videoPreviewUrl)
    }
  }, [thumbPreviewUrl, videoPreviewUrl])

  if (!isDownloadApp && !isDemoVideo) {
    return (
      <div className="text-white">Unknown add page: {slug}</div>
    )
  }

  const onSubmitDownloadApp = async () => {
    if (!name.trim() || !downloadLink.trim()) return alert('Name and download link required')
    setLoading(true)
    try {
      const payload:any = { name, version, credit: Number(credit), downloadLink, image, description }

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

  const onSubmitDemoVideo = async () => {
    if (!vTitle.trim()) return alert('Title required')
    setLoading(true)
    try {
      const payload:any = { title: vTitle, price: Number(vPrice || 0), description: vDesc, thumbnail: vThumb, videoUrl: vUrl }

      // Upload thumbnail if selected
      if (vThumbFile) {
        const fd = new FormData()
        fd.append('file', vThumbFile)
        fd.append('fileName', vThumbFile.name || `thumb_${Date.now()}.png`)
        try {
          setThumbUploadProgress(0)
          const upJson = await uploadWithProgress('/api/admin/catalog/upload', fd, (p) => setThumbUploadProgress(p), 'POST')
          payload.thumbnail = upJson.imageUrl
          setVThumb(upJson.imageUrl)
        } catch (err:any) {
          console.error(err)
          return alert(err?.error || err?.message || 'Thumbnail upload failed')
        } finally {
          setThumbUploadProgress(null)
        }
      }

      // Upload video if selected
      if (vFile) {
        const fd = new FormData()
        fd.append('file', vFile)
        fd.append('fileName', vFile.name || `video_${Date.now()}.mp4`)
        try {
          setVideoUploadProgress(0)
          if (idParam) {
            fd.append('id', String(idParam))
            if (vUrl) fd.append('oldUrl', vUrl)
            const upJson = await uploadWithProgress('/api/admin/catalog/demonstrationvideo/upload', fd, (p) => setVideoUploadProgress(p), 'PUT')
            payload.videoUrl = upJson.videoUrl || payload.videoUrl
          } else {
            const upJson = await uploadWithProgress('/api/admin/catalog/demonstrationvideo/upload', fd, (p) => setVideoUploadProgress(p), 'POST')
            payload.videoUrl = upJson.videoUrl || payload.videoUrl
          }
        } catch (err:any) {
          console.error(err)
          return alert(err?.error || err?.message || 'Video upload failed')
        } finally {
          setVideoUploadProgress(null)
        }
      }

      const method = idParam ? 'PUT' : 'POST'
      if (idParam) payload.id = Number(idParam)
      const res = await fetch('/api/admin/catalog/demonstrationvideo', { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
      const d = await res.json().catch(()=>({}))
      if (!res.ok) return alert(d?.error || 'Failed')
      router.push('/admin/catalog/demonstrationvideo')
    } catch (err) {
      console.error(err)
      alert('Failed')
    } finally { setLoading(false) }
  }

  if (isDownloadApp) {
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
                <button onClick={onSubmitDownloadApp} className="px-4 py-2 rounded-lg border border-orange-500 text-orange-400 hover:bg-orange-500/10">{idParam ? 'Update' : 'Create'}</button>
                <button onClick={() => router.push('/admin/catalog/downloadapp')} className="px-4 py-2 rounded-lg border border-white/10 text-white/60">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Demonstration video form
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">{idParam ? 'Edit' : 'Add'} Demonstration Video</h1>
      </div>

      <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        {loading ? (
          <div className="py-10 grid place-items-center">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <input value={vTitle} onChange={(e) => setVTitle(e.target.value)} placeholder="Title" className="md:col-span-8 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white" />
            <input value={String(vPrice)} onChange={(e) => setVPrice(Number(e.target.value))} placeholder="Price" className="md:col-span-4 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white" />

            <input value={vUrl} onChange={(e) => setVUrl(e.target.value)} placeholder="Video URL (optional if uploading file)" className="md:col-span-12 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white" />

            <div className="md:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="sm:col-span-1">
                {/* Image preview component */}
                <UploadPreview
                  type="image"
                  label="Thumbnail"
                  previewUrl={thumbPreviewUrl}
                  file={vThumbFile}
                  urlValue={vThumb}
                  accept="image/*"
                  uploadProgress={thumbUploadProgress}
                  onFileChange={(f) => { setVThumbFile(f); if (f) setThumbPreviewUrl(URL.createObjectURL(f)); }}
                  onUrlChange={(v) => { setVThumb(v); setThumbPreviewUrl(v || null); }}
                  onRemove={() => { setVThumbFile(null); setThumbPreviewUrl(''); setVThumb(''); }}
                />
              </div>

              <div className="sm:col-span-1">
                {/* Video preview component */}
                <UploadPreview
                  type="video"
                  label="Video"
                  previewUrl={videoPreviewUrl}
                  file={vFile}
                  urlValue={vUrl}
                  accept="video/*"
                  uploadProgress={videoUploadProgress}
                  onFileChange={(f) => { setVFile(f); if (f) setVideoPreviewUrl(URL.createObjectURL(f)); }}
                  onUrlChange={(v) => { setVUrl(v); setVideoPreviewUrl(v || null); }}
                  onRemove={() => { setVFile(null); setVideoPreviewUrl(''); setVUrl(''); }}
                />
              </div>
            </div>

            <textarea value={vDesc} onChange={(e) => setVDesc(e.target.value)} placeholder="Description" className="md:col-span-12 h-28 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white" />

            <div className="md:col-span-12 flex items-center gap-3">
              <button onClick={onSubmitDemoVideo} className="px-4 py-2 rounded-lg border border-orange-500 text-orange-400 hover:bg-orange-500/10">{idParam ? 'Update' : 'Create'}</button>
              <button onClick={() => router.push('/admin/catalog/demonstrationvideo')} className="px-4 py-2 rounded-lg border border-white/10 text-white/60">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
