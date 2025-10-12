"use client";
import React, { useEffect, useState } from "react";
import { X, Image as ImageIcon } from "lucide-react";

type ChannelData = {
  id?: number;
  name?: string;
  logo?: string | null;
  description?: string | null;
  category?: string | null;
};

export default function EditChannelModal({
  open,
  onClose,
  initialData,
  categories = [],
  onSave,
  onDeleteLogo,
  saving = false,
}: {
  open: boolean;
  onClose: () => void;
  initialData: ChannelData;
  categories?: string[];
  onSave: (data: { id?: number; name: string; description: string; category: string }, logoFile?: File | null) => Promise<void>;
  onDeleteLogo?: () => Promise<void>;
  saving?: boolean;
}) {
  const [form, setForm] = useState({ name: "", description: "", category: "" });
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    setForm({
      name: initialData?.name || "",
      description: initialData?.description || "",
      category: initialData?.category || (categories?.[0] || ""),
    });
    setLogoPreview(initialData?.logo || "");
    setLogoFile(null);
  }, [initialData, open, categories]);

  if (!open) return null;

  const handleFile = (f?: File | null) => {
    if (!f) return;
    setLogoFile(f);
    setLogoPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    await onSave({ id: initialData?.id, name: form.name.trim(), description: form.description.trim(), category: form.category || "" }, logoFile);
  };

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
            <label className="block text-sm text-white/70 mb-2">Logo</label>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col items-center">
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoPreview} alt={form.name} className="h-28 w-28 rounded-lg bg-white/10 object-contain" />
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
                      if (f) handleFile(f);
                    }}
                  />
                </label>
                {logoPreview && onDeleteLogo && (
                  <button type="button" onClick={onDeleteLogo} className="px-3 py-2 border border-red-500/30 text-red-400 rounded hover:bg-red-500/10">Remove</button>
                )}
              </div>
              <p className="mt-2 text-xs text-white/50 text-center">PNG/SVG recommended. Square images look best.</p>
            </div>
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
              <select
                className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/40"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
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
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded border border-orange-500 text-orange-400 hover:bg-orange-500/10 disabled:opacity-60">{saving ? "Saving..." : "Save"}</button>
        </div>
      </div>
    </div>
  );
}
