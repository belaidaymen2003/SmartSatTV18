import React, { useEffect, useState } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import Spinner from "@/components/UI/Spinner";
import Toast from "@/components/UI/Toast";
import MultiSelectDropdown from "@/components/UI/MultiSelectDropdown";

type Field =
  | { name: string; label: string; type: "text" | "number" | "textarea" | "select" | "multiselect" | "file" | "url" | "checkbox"; options?: string[] }
  | any;

type Props = {
  open: boolean;
  title?: string;
  fields: Field[];
  initialValues?: Record<string, any>;
  saving?: boolean;
  onClose: () => void;
  onSave: (values: Record<string, any>, files?: Record<string, File | null>) => Promise<void>;
};

export default function EntityModal({ open, title = "Edit", fields, initialValues = {}, saving = false, onClose, onSave }: Props) {
  const [values, setValues] = useState<Record<string, any>>({});
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});
  const [fileObjects, setFileObjects] = useState<Record<string, File | null>>({});
  const [toast, setToast] = useState<{ message: string; type?: any } | null>(null);

  useEffect(() => {
    setValues({ ...initialValues });
    const previews: Record<string, string> = {};
    Object.keys(initialValues).forEach((k) => {
      const v = initialValues[k];
      if (typeof v === "string" && (v.startsWith("http://") || v.startsWith("https://"))) previews[k] = v;
    });
    setFilePreviews(previews);
    setFileObjects({});
  }, [open]);

  if (!open) return null;

  const onFileChange = (fieldName: string, file?: File | null) => {
    if (!file) return;
    setFileObjects((s) => ({ ...s, [fieldName]: file }));
    setFilePreviews((s) => ({ ...s, [fieldName]: URL.createObjectURL(file) }));
  };

  const renderField = (f: Field) => {
    const name = f.name;
    const label = f.label || name;
    const type = f.type || "text";
    const val = values[name] ?? (type === "multiselect" ? [] : type === "checkbox" ? false : "");

    if (type === "textarea") {
      return (
        <div key={name} className="w-full">
          <label className="block text-sm text-white/70 mb-1">{label}</label>
          <textarea value={val} onChange={(e) => setValues({ ...values, [name]: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white" />
        </div>
      );
    }

    if (type === "checkbox") {
      return (
        <div key={name} className="w-full">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(val)}
              onChange={(e) => setValues({ ...values, [name]: e.target.checked })}
              className="w-4 h-4 rounded border border-white/20 bg-black/40 accent-orange-500 cursor-pointer"
            />
            <span className="text-sm text-white/70">{label}</span>
          </label>
        </div>
      );
    }

    if (type === "multiselect") {
      return (
        <div key={name} className="w-full">
          <label className="block text-sm text-white/70 mb-1">{label}</label>
          <MultiSelectDropdown
            options={f.options || []}
            selected={Array.isArray(val) ? val : []}
            onChange={(selected) => setValues({ ...values, [name]: selected })}
            placeholder={`Select ${label.toLowerCase()}...`}
          />
        </div>
      );
    }

    if (type === "select") {
      return (
        <div key={name} className="w-full">
          <label className="block text-sm text-white/70 mb-1">{label}</label>
          <select value={val} onChange={(e) => setValues({ ...values, [name]: e.target.value })} className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white">
            <option value="">Select an option...</option>
            {(f.options || []).map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    }

    if (type === "file") {
      return (
        <div key={name} className="w-full">
          <label className="block text-sm text-white/70 mb-1">{label}</label>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col items-center">
            {filePreviews[name] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={filePreviews[name]} alt="preview" className="h-28 w-28 rounded-lg bg-white/10 object-contain" />
            ) : (
              <div className="h-28 w-28 rounded-lg bg-white/10 grid place-items-center"><ImageIcon className="w-7 h-7 text-white/40" /></div>
            )}
            <div className="mt-3 flex items-center gap-2">
              <label className="px-3 py-2 border border-white/10 rounded cursor-pointer hover:bg-white/10 text-white/80 inline-flex items-center gap-2">
                Replace
                <input type="file" accept={(f as any).accept || "image/*"} className="hidden" onChange={(e) => onFileChange(name, e.target.files?.[0] || null)} />
              </label>
              {filePreviews[name] && (
                <button type="button" onClick={() => { setFilePreviews((s) => ({ ...s, [name]: "" })); setFileObjects((s) => ({ ...s, [name]: null })); setValues((s) => ({ ...s, [name]: "" })); }} className="px-3 py-2 border border-red-500/30 text-red-400 rounded hover:bg-red-500/10">Remove</button>
              )}
            </div>
            <p className="mt-2 text-xs text-white/50 text-center">PNG/SVG recommended. Square images look best.</p>
          </div>
        </div>
      );
    }

    // default input types: text, number, url
    return (
      <div key={name} className="w-full">
        <label className="block text-sm text-white/70 mb-1">{label}</label>
        <input value={val} onChange={(e) => setValues({ ...values, [name]: type === "number" ? Number(e.target.value) : e.target.value })} type={type === "url" ? "url" : type === "number" ? "number" : "text"} className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white" />
      </div>
    );
  };

  const submit = async () => {
    try {
      await onSave(values, fileObjects);
    } catch (e:any) {
      setToast({ message: e?.message || "Failed to save", type: "error" });
      throw e;
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-2xl bg-black/30 border border-white/10 rounded-xl p-6 backdrop-blur-md shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10"><X className="w-5 h-5 text-white/70" /></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((f: Field) => renderField(f))}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} disabled={saving} className="px-4 py-2 rounded border border-white/20 text-white/80 hover:bg-white/10">Cancel</button>
          <button onClick={submit} disabled={saving} className="px-4 py-2 rounded border border-orange-500 text-orange-400 hover:bg-orange-500/10 disabled:opacity-60">{saving ? <Spinner size={4} /> : "Save"}</button>
        </div>

        {toast && <Toast message={toast.message} type={toast.type as any} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}
