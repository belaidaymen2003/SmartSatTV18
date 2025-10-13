"use client";
import React, { useEffect, useState } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import Spinner from "@/components/UI/Spinner";
import Toast from "@/components/UI/Toast";

export type Channel = {
  id: number;
  name: string;
  logo?: string | null;
  description?: string | null;
  category?: string | null;
};

type Props = {
  open: boolean;
  channel: Channel | null;
  onClose: () => void;
  onSaved?: () => void;
};

export default function EditChannelModal({ open, channel, onClose, onSaved }: Props) {
  const [form, setForm] = useState({ name: "", category: "", description: "", logo: "" });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: string } | null>(null);

  useEffect(() => {
    if (!channel) return setForm({ name: "", category: "", description: "", logo: "" });
    setForm({ name: channel.name || "", category: channel.category || "", description: channel.description || "", logo: channel.logo || "" });
    setLogoFile(null);
    setLogoPreview("");
  }, [channel]);

  if (!open || !channel) return null;

  const replaceLogo = async () => {
    const fd = new FormData();
    fd.append("channelId", String(channel.id));
    if (logoFile) fd.append("file", logoFile);
    fd.append("fileName", logoFile?.name || "");
    if (channel.logo) fd.append("oldLogoUrl", channel.logo);
    const res = await fetch("/api/admin/categories/upload", { method: "PUT", body: fd });
    return res.json();
  };

  const deleteLogo = async () => {
    if (!channel) return;
    await fetch("/api/admin/categories/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelId: channel.id, logoUrl: channel.logo || undefined }),
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const newLogo = await replaceLogo();
      const payload: any = { id: channel.id, name: form.name, description: form.description, category: form.category };
      if (newLogo?.logoUrl) payload.logo = newLogo.logoUrl;
      const res = await fetch("/api/admin/categories/category", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(d?.error || "Failed to save channel");
      setToast({ message: "Channel updated", type: "success" });
      onSaved?.();
      onClose();
    } catch (e:any) {
      setToast({ message: e?.message || "Unexpected error", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl bg-black/30 border border-white/10 rounded-xl p-6 backdrop-blur-md shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e)=>e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Edit Channel</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10"><X className="w-5 h-5 text-white/70" /></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="sm:col-span-1">
            <label className="block text-sm text-white/70 mb-2">Logo</label>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col items-center">
              {form.logo || logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoPreview || form.logo || ""} alt={form.name} className="h-28 w-28 rounded-lg bg-white/10 object-contain" />
              ) : (
                <div className="h-28 w-28 rounded-lg bg-white/10 grid place-items-center">
                  <ImageIcon className="w-7 h-7 text-white/40" />
                </div>
              )}
              <div className="mt-3 flex items-center gap-2">
                <label className="px-3 py-2 border border-white/10 rounded cursor-pointer hover:bg-white/10 text-white/80 inline-flex items-center gap-2">
                  Replace
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setLogoFile(f);
                        setLogoPreview(URL.createObjectURL(f));
                      }
                    }}
                  />
                </label>
                {form.logo && (
                  <button type="button" onClick={async () => { await deleteLogo(); setForm((f)=>({ ...f, logo: ""})); }} className="px-3 py-2 border border-red-500/30 text-red-400 rounded hover:bg-red-500/10">Remove</button>
                )}
              </div>
              <p className="mt-2 text-xs text-white/50 text-center">PNG/SVG recommended. Square images look best.</p>
            </div>
          </div>

          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm text-white/70 mb-1">Name</label>
              <input className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white placeholder-white/40 focus:outline-none" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} placeholder="Channel name" />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-sm text-white/70 mb-1">Category</label>
              <input className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white focus:outline-none" value={form.category} onChange={(e)=>setForm({...form, category:e.target.value})} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-white/70 mb-1">Description</label>
              <textarea className="h-32 w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white placeholder-white/40 focus:outline-none" value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} placeholder="Short description" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded border border-white/20 text-white/80 hover:bg-white/10">Cancel</button>
          <button onClick={save} disabled={saving} className="px-4 py-2 rounded border border-orange-500 text-orange-400 hover:bg-orange-500/10 disabled:opacity-60">{saving ? <Spinner size={4} /> : "Save"}</button>
        </div>

        {toast && <Toast message={toast.message} type={toast.type as any} onClose={()=>setToast(null)} />}
      </div>
    </div>
  );
}
