"use client";
import React, { useEffect, useState } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import { CHANNEL_TYPES } from "@/lib/constants";
import Spinner from "@/components/UI/Spinner";
import Toast from "@/components/UI/Toast";
import UploadPreview from "@/components/UI/UploadPreview";

export type Channel = {
  id: number;
  name: string;
  logo?: string | null;
  description?: string | null;
  category?: string | null;
  type?: string | null;
};

type ChannelData = {
  id?: number;
  name?: string;
  logo?: string | null;
  description?: string | null;
  category?: string | null;
  type?: string | null;
};

type LegacyProps = {
  open: boolean;
  channel: Channel | null;
  onClose: () => void;
  onSaved?: () => void;
};

type NewProps = {
  open: boolean;
  onClose: () => void;
  initialData: ChannelData;
  categories?: string[];
  onSave?: (data: { id?: number; name: string; description: string; category: string, logo: string }, logoFile?: File | null) => Promise<void>;
  onDeleteLogo?: () => Promise<void>;
  saving?: boolean;
};

export default function EditChannelModal(props: LegacyProps | NewProps) {
  const legacyMode = (props as LegacyProps).hasOwnProperty("channel");

  // normalize props
  const open = props.open;
  const onClose = props.onClose;

  const legacyChannel = legacyMode ? (props as LegacyProps).channel : null;
  const onSaved = legacyMode ? (props as LegacyProps).onSaved : undefined;

  const initialData = legacyMode ? (legacyChannel ? {
    id: legacyChannel.id,
    name: legacyChannel.name,
    description: legacyChannel.description,
    category: legacyChannel.category,
    logo: legacyChannel.logo,
  } : {}) : (props as NewProps).initialData || {};

  const categories = legacyMode ? [] : ((props as NewProps).categories || []);
  const externalOnSave = legacyMode ? undefined : (props as NewProps).onSave;
  const externalOnDeleteLogo = legacyMode ? undefined : (props as NewProps).onDeleteLogo;
  const externalSaving = legacyMode ? false : !!(props as NewProps).saving;

  const [form, setForm] = useState({ name: "", description: "", category: "" });
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: string } | null>(null);

  useEffect(() => {
    setForm({
      name: initialData?.name || "",
      description: initialData?.description || "",
      category: initialData?.category || (categories?.[0] || ""),
      type: initialData?.type || (CHANNEL_TYPES?.[0] || ""),
    });
    setLogoPreview(initialData?.logo || "");
    setLogoFile(null);
    // reset toast when opening
    if (!open) setToast(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  // legacy upload flow used by older callers
  const replaceLogoLegacy = async (channelId: number | undefined) => {
    if (!channelId) return null;
    const fd = new FormData();
    fd.append("channelId", String(channelId));
    if (logoFile) fd.append("file", logoFile);
    fd.append("fileName", logoFile?.name || "");
    if (initialData?.logo) fd.append("oldLogoUrl", initialData.logo as string);
    const res = await fetch("/api/admin/categories/upload", { method: "PUT", body: fd });
    return res.json().catch(() => null);
  };

  const deleteLogoLegacy = async (channelId: number | undefined) => {
    if (!channelId) return;
    await fetch("/api/admin/categories/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channelId: channelId, logoUrl: initialData.logo || undefined }),
    });
  };

  const handleSave = async () => {
    if (legacyMode) {
      // legacy save: upload logo (if any) then PUT channel
      if (!legacyChannel) return;
      setSaving(true);
      try {
        const newLogo = await replaceLogoLegacy(legacyChannel.id);
        const payload: any = { id: legacyChannel.id, name: form.name, description: form.description, category: form.category };
        if (newLogo?.logoUrl) payload.logo = newLogo.logoUrl;
        const res = await fetch("/api/admin/categories/category", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(d?.error || "Failed to save channel");
        setToast({ message: "Channel updated", type: "success" });
        onSaved?.();
        onClose();
      } catch (e: any) {
        setToast({ message: e?.message || "Unexpected error", type: "error" });
      } finally {
        setSaving(false);
      }
    } else {
      // new API: delegate to external onSave
      if (externalOnSave) {
        setSaving(true);
        try {
          await externalOnSave({ id: initialData?.id, name: form.name.trim(), description: form.description.trim(), category: form.category || "", logo: logoPreview }, logoFile);
          onClose();
        } catch (e: any) {
          setToast({ message: e?.message || "Failed to save", type: "error" });
        } finally {
          setSaving(false);
        }
      }
    }
  };

  const handleDeleteLogo = async () => {
    if (legacyMode) {
      if (!legacyChannel) return;
      try {
        await deleteLogoLegacy(legacyChannel.id);
        setForm((f) => ({ ...f, logo: "" }));
        setLogoPreview("");
      } catch (e) {
        setToast({ message: "Failed to remove logo", type: "error" });
      }
    } else {
      if (externalOnDeleteLogo) {
        try {
          await externalOnDeleteLogo();
          setLogoPreview("");
        } catch (e) {
          setToast({ message: "Failed to remove logo", type: "error" });
        }
      }
    }
  };

  const isSaving = legacyMode ? saving : externalSaving;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl bg-black/30 border border-white/10 rounded-xl p-6 backdrop-blur-md shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Edit Channel</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10">
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="sm:col-span-1">
            <UploadPreview
              type="image"
              label="Logo"
              previewUrl={logoPreview || null}
              file={logoFile}
              urlValue={logoPreview || ''}
              accept="image/*"
              uploadProgress={null}
              onFileChange={(f) => { setLogoFile(f); if (f) setLogoPreview(URL.createObjectURL(f)); }}
              onUrlChange={(v) => { setLogoPreview(v || ''); }}
              onRemove={() => { setLogoFile(null); setLogoPreview(''); }}
            />
          </div>

          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm text-white/70 mb-1">Name</label>
              <input
                className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/40"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Channel name"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="block text-sm text-white/70 mb-1">Category</label>
              {legacyMode ? (
                <input className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white focus:outline-none" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              ) : (
                <select
                  className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/40"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="sm:col-span-1">
              <label className="block text-sm text-white/70 mb-1">Type</label>
              {legacyMode ? (
                <input className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white focus:outline-none" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
              ) : (
                <select
                  className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/40"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {CHANNEL_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-white/70 mb-1">Description</label>
              <textarea
                className="h-32 w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/40"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short description"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded border border-white/20 text-white/80 hover:bg-white/10">Cancel</button>
          <button onClick={legacyMode ? handleSave : handleSave} disabled={isSaving} className="px-4 py-2 rounded border border-orange-500 text-orange-400 hover:bg-orange-500/10 disabled:opacity-60">{isSaving ? <Spinner size={4} /> : "Save"}</button>
        </div>

        {toast && <Toast message={toast.message} type={toast.type as any} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}
