"use client"

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Pagination from "../../../../components/Admin/Pagination";
import Spinner from "../../../../components/UI/Spinner";
import EntityModal from "../../../../components/UI/EntityModal";
import ConfirmModal from "../../../../components/UI/ConfirmModal";
import Toast from "../../../../components/UI/Toast";

export const dynamic = "force-dynamic";

type VideoItem = {
  id: number;
  title: string;
  description: string | null;
  thumbnail: string | null;
  videoUrl: string;
  price: number;
  createdAt: string;
};

export default function DemonstrationVideoAdminPage() {
  const router = useRouter();
  const [items, setItems] = useState<VideoItem[]>([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      const res = await fetch(`/api/admin/catalog/demonstrationvideo?${params.toString()}`);
      const d = await res.json().catch(() => ({}));
      setItems(d.videos || []);
      setTotal(d.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, page, pageSize]);

  const [editing, setEditing] = useState<VideoItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: any } | null>(null);
  const [saving, setSaving] = useState(false);

  const openCreate = () => router.push("/admin/catalog/add/demonstrationvideo");

  const openEdit = (it: VideoItem) => {
    setEditing(it);
    setIsModalOpen(true);
  };

  const remove = (id: number) => {
    setEditing({ id } as any);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!editing?.id) return setIsConfirmOpen(false);
    try {
      const res = await fetch(`/api/admin/catalog/demonstrationvideo?id=${editing.id}`, { method: "DELETE" });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) return setToast({ message: d?.error || "Delete failed", type: "error" });
      setToast({ message: "Deleted", type: "success" });
      setIsConfirmOpen(false);
      setIsModalOpen(false);
      fetchList();
    } catch (err: any) {
      console.error(err);
      setToast({ message: err?.message || "Failed", type: "error" });
    }
  };

  const fields = useMemo(() => [
    { name: "title", label: "Title", type: "text" },
    { name: "price", label: "Price", type: "number" },
    { name: "thumbnail", label: "Thumbnail", type: "file" },
    { name: "videoFile", label: "Video", type: "file", accept: "video/*" },
    { name: "videoUrl", label: "Video URL", type: "url" },
    { name: "description", label: "Description", type: "textarea" },
  ], []);

  const handleSave = async (values: Record<string, any>, files?: Record<string, File | null>) => {
    setSaving(true);
    try {
      const payload: any = {
        id: values.id,
        title: values.title,
        price: Number(values.price || 0),
        description: values.description || undefined,
        thumbnail: values.thumbnail || undefined,
        videoUrl: values.videoUrl || undefined,
      };

      // Upload thumbnail if provided
      const thumbFile = files?.thumbnail || null;
      if (thumbFile) {
        const fd = new FormData();
        fd.append("file", thumbFile);
        fd.append("fileName", thumbFile.name || `thumb_${Date.now()}.png`);
        const up = await fetch("/api/admin/catalog/upload", { method: "POST", body: fd });
        const upJson = await up.json().catch(() => ({}));
        if (!up.ok) throw new Error(upJson?.error || "Thumbnail upload failed");
        payload.thumbnail = upJson.imageUrl;
      }

      // Upload video file if provided
      const videoFile = files?.videoFile || null;
      if (videoFile) {
        const fd = new FormData();
        fd.append("file", videoFile);
        fd.append("fileName", videoFile.name || `video_${Date.now()}.mp4`);
        if (payload.id) {
          fd.append("id", String(payload.id));
          if (editing?.videoUrl) fd.append("oldUrl", editing.videoUrl);
          const up = await fetch("/api/admin/catalog/demonstrationvideo/upload", { method: "PUT", body: fd });
          const upJson = await up.json().catch(() => ({}));
          if (!up.ok) throw new Error(upJson?.error || "Video upload failed");
          payload.videoUrl = upJson.videoUrl || payload.videoUrl;
        } else {
          const up = await fetch("/api/admin/catalog/demonstrationvideo/upload", { method: "POST", body: fd });
          const upJson = await up.json().catch(() => ({}));
          if (!up.ok) throw new Error(upJson?.error || "Video upload failed");
          payload.videoUrl = upJson.videoUrl || payload.videoUrl;
        }
      }

      const method = payload.id ? "PUT" : "POST";
      const res = await fetch("/api/admin/catalog/demonstrationvideo", { method, headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d?.error || "Failed to save");
      setToast({ message: payload.id ? "Updated" : "Created", type: "success" });
      setIsModalOpen(false);
      fetchList();
    } catch (err: any) {
      setToast({ message: err?.message || "Failed", type: "error" });
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(() => ["Title", "Price", "Created", "Actions"], []);

  const initialValues = editing ? {
    id: editing.id,
    title: editing.title || "",
    price: editing.price ?? 0,
    thumbnail: editing.thumbnail || "",
    videoUrl: editing.videoUrl || "",
    description: editing.description || "",
  } : {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Demonstration Videos</h1>
        <div className="flex items-center gap-3">
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search title" className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30" />
          <button onClick={openCreate} className="px-4 py-2 rounded-lg border border-orange-500 text-orange-400 hover:bg-orange-500/10">Add Video</button>
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
                        {it.thumbnail ? (<img src={it.thumbnail} alt="thumb" className="w-10 h-10 rounded-md object-cover"/>) : (<div className="w-10 h-10 rounded-md bg-white/5 grid place-items-center text-xs">No</div>)}
                        <div>
                          <div className="font-medium">{it.title}</div>
                          <a className="text-xs text-white/50 hover:underline break-all" href={it.videoUrl} target="_blank" rel="noreferrer">Open video</a>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-white/80">{it.price ?? 0}</td>
                    <td className="py-3 pr-4 text-white/80">{new Date(it.createdAt).toLocaleString()}</td>
                    <td className="py-3 pr-4 text-white/80">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(it)} className="px-3 py-1 text-sm rounded border border-white/10 hover:bg-white/5">Edit</button>
                        <button onClick={() => remove(it.id)} className="px-3 py-1 text-sm rounded border border-red-600 text-red-400 hover:bg-red-600/10">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-white/60">No items</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div>
            <label className="text-white/60 text-sm">Page size: </label>
            <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="ml-2 bg-black/40 border border-white/10 rounded px-2 py-1 text-white">
              {[6,12,24,48].map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>
          <Pagination total={total} pageSize={pageSize} page={page} onPageChange={(p) => setPage(p)} />
        </div>
      </div>

      {isModalOpen && (
        <EntityModal open={isModalOpen} title={editing ? "Edit Video" : "Add Video"} fields={fields} initialValues={initialValues} saving={saving} onClose={() => setIsModalOpen(false)} onSave={handleSave} />
      )}

      {isConfirmOpen && (
        <ConfirmModal message="Delete this video?" onCancel={() => setIsConfirmOpen(false)} onConfirm={confirmDelete} />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
