"use client"

import React from "react";
import { Image as ImageIcon, Upload } from "lucide-react";

type Props = {
  type: "image" | "video";
  label?: string;
  previewUrl?: string | null;
  file?: File | null;
  urlValue?: string;
  accept?: string;
  uploadProgress?: number | null;
  onFileChange: (f: File | null) => void;
  onUrlChange: (v: string) => void;
  onRemove?: () => void;
};

export default function UploadPreview({ type, label, previewUrl, file, urlValue, accept, uploadProgress, onFileChange, onUrlChange, onRemove }: Props) {
  const acceptAttr = accept || (type === "image" ? "image/*" : "video/*");

  return (
    <div>
      <label className="block text-sm text-white/70 mb-2">{label || (type === "image" ? "Thumbnail" : "Video")}</label>
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col items-center">
        {previewUrl ? (
          type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt={label || "preview"} className="h-28 w-28 rounded-lg bg-white/10 object-contain" />
          ) : (
            <video src={previewUrl} controls className="h-28 w-full rounded-md bg-black/20 object-cover" />
          )
        ) : (
          <div className={`h-28 ${type === "image" ? "w-28" : "w-full"} rounded-lg bg-white/10 grid place-items-center`}>
            {type === "image" ? <ImageIcon className="w-7 h-7 text-white/40" /> : <Upload className="w-7 h-7 text-white/40" />}
          </div>
        )}

        <div className="mt-3 flex items-center gap-2">
          <label className="px-3 py-2 border border-white/10 rounded cursor-pointer hover:bg-white/10 text-white/80 inline-flex items-center gap-2">
            Replace
            <input type="file" accept={acceptAttr} className="hidden" onChange={(e) => { const f = e.target.files?.[0] || null; onFileChange(f); }} />
          </label>
          {previewUrl && (
            <button type="button" onClick={() => { onRemove?.(); onFileChange(null); onUrlChange(""); }} className="px-3 py-2 border border-red-500/30 text-red-400 rounded hover:bg-red-500/10">Remove</button>
          )}
        </div>

        <input value={urlValue || ""} onChange={(e) => onUrlChange(e.target.value)} placeholder={type === "image" ? "Or paste image URL" : "Or paste video URL"} className="mt-3 w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white placeholder-white/40" />

        {uploadProgress != null && (
          <div className="mt-3 w-full">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div style={{ width: `${uploadProgress}%` }} className="h-2 bg-orange-500" />
            </div>
            <div className="text-xs text-white/60 mt-1">Uploading {type === "image" ? "thumbnail" : "video"}: {uploadProgress}%</div>
          </div>
        )}
      </div>
    </div>
  );
}
