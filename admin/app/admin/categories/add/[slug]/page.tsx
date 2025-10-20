"use client";
import {
  Calendar,
  Film,
  ImageIcon,
  LinkIcon,
  Upload,
  Video,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Hls from "hls.js";
import { CATEGORIES as categories, CHANNEL_TYPES } from "@/lib/constants";
import Toast from "@/components/UI/Toast";
type Props = { params: { category: string } };
type data = {
  title: string;
  category: string;
  description: string;
  type?: string;
};
const formData = new FormData();
export default function CategoryPage({ params }: { params: { slug: string } }) {
  const search = useSearchParams();
  const [localurl, setLocalUrl] = useState("");

  const [data, setData] = useState<data>({
    title: "",
    category: "",
    description: "",
    type: "",
  });
  const [gift, setGift] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: "success"|"error"|"info"|"warning" }|null>(null);

  const onFileImage = (file?: File) => {
    if (!file) return;
    const urlLogo = URL.createObjectURL(file);
    setLocalUrl(urlLogo);
    formData.append("file", file);
    formData.append("fileName", file.name);
  };

  async function submitData() {
    setLoading(true);
    try {
      if (params.slug === "gift-cards") {
        let uploaded: any = null;
        if (formData.get("file")) {
          const up = await fetch("/api/admin/gift-cards/upload", { method: "POST", body: formData });
          const upData = await up.json().catch(()=>({}));
          if (!up.ok) throw new Error(upData?.error || "Failed to upload cover");
          uploaded = upData;
        }
        const create = await fetch("/api/admin/gift-cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: gift.title,
            description: gift.description,
            coverUrl: uploaded?.url || null,
          }),
        });
        const cd = await create.json().catch(()=>({}));
        if (!create.ok) throw new Error(cd?.error || "Failed to create gift card");
        setToast({ message: "Gift card created", type: "success" });
      } else {
        const up = await fetch("/api/admin/categories/upload", { method: "POST", body: formData });
        const response = await up.json().catch(()=>({}));
        if (!up.ok) throw new Error(response?.error || "Failed to upload logo");
        const create = await fetch(
          `/api/admin/categories/category?slug=${params.slug}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...data,
              logoUrl: response.logoUrl,
              fileId: response.fileId,
            }),
          }
        );
        const cd = await create.json().catch(()=>({}));
        if (!create.ok) throw new Error(cd?.error || "Failed to create channel");
        setToast({ message: "Channel created", type: "success" });
      }
    } catch (e:any) {
      setToast({ message: e?.message || "Unexpected error", type: "error" });
    } finally {
      setLoading(false);
    }
  }
  const videoRef = useRef(null);

  return (
    <div className="space-y-6">
      <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        {params.slug === "gift-cards" ? (
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-sm text-white/70 mb-1">Title</label>
              <input
                value={gift.title}
                onChange={(e) => setGift({ ...gift, title: e.target.value })}
                placeholder="Enter gift card title"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/40"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1">Description</label>
              <textarea
                value={gift.description}
                onChange={(e) =>
                  setGift({ ...gift, description: e.target.value })
                }
                placeholder="Short description"
                className="h-32 w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/40"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Cover</label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-24 rounded-lg bg-white/5 border border-white/10 grid place-items-center overflow-hidden">
                  {localurl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={localurl}
                      alt="Cover preview"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-white/40" />
                  )}
                </div>
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-white/80 hover:bg-white/10 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Upload cover</span>
                  <input
                    onChange={(e) => {
                      onFileImage(e.target.files?.[0]);
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-7">
              <label className="block text-sm text-white/70 mb-1">Title</label>
              <input
                value={data.title}
                onChange={(e) =>
                  setData({ ...data, title: e.target.value.trim() })
                }
                placeholder="Enter channel title"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/40"
              />
            </div>
            <div className="md:col-span-5">
              <label className="block text-sm text-white/70 mb-1">Category</label>
              <select
                value={data.category}
                onChange={(e) =>
                  setData({ ...data, category: e.target.value.trim() })
                }
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/40"
              >
                <option value="">Select a category</option>
                {categories.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-5">
              <label className="block text-sm text-white/70 mb-1">Type</label>
              <select
                value={data.type}
                onChange={(e) => setData({ ...data, type: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/40"
              >
                <option value="">Select a type</option>
                {CHANNEL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-12">
              <label className="block text-sm text-white/70 mb-2">Logo</label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-24 rounded-lg bg-white/5 border border-white/10 grid place-items-center overflow-hidden">
                  {localurl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={localurl}
                      alt="Logo preview"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-white/40" />
                  )}
                </div>
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-white/80 hover:bg-white/10 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Upload logo</span>
                  <input
                    onChange={(e) => {
                      onFileImage(e.target.files?.[0]);
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="md:col-span-12">
              <label className="block text-sm text-white/70 mb-1">Description</label>
              <textarea
                value={data.description}
                onChange={(e) =>
                  setData({ ...data, description: e.target.value.trim() })
                }
                placeholder="Describe the channel"
                className="h-32 w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/40"
              />
            </div>
          </div>
        )}

        <div className="mt-6">
          <button
            disabled={
              loading ||
              (params.slug === "gift-cards"
                ? !gift.title.trim()
                : !data.title.trim())
            }
            onClick={submitData}
            className="px-5 py-2 rounded-lg border border-orange-500 text-orange-400 hover:bg-orange-500/10 disabled:opacity-60 inline-flex items-center gap-2"
          >
            <Film className="w-4 h-4" />
            {loading ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
