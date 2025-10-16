import React from "react";
import EntityModal from "@/components/UI/EntityModal";

type AppItem = {
  id?: number;
  name?: string;
  description?: string | null;
  downloadLink?: string;
  image?: string | null;
  credit?: number;
  version?: string | null;
};

export default function EditAppModal(props: {
  open: boolean;
  onClose: () => void;
  initialData: AppItem;
  saving?: boolean;
  onSave?: (data: any, files?: Record<string, File | null>) => Promise<void>;
}) {
  const { open, onClose, initialData, onSave, saving } = props;

  const fields = [
    { name: "name", label: "Name", type: "text" },
    { name: "version", label: "Version", type: "text" },
    { name: "credit", label: "Credit", type: "number" },
    { name: "downloadLink", label: "Download Link", type: "url" },
    { name: "image", label: "Image", type: "file" },
    { name: "description", label: "Description", type: "textarea" },
  ];

  const initialValues = {
    id: initialData?.id,
    name: initialData?.name || "",
    version: initialData?.version || "",
    credit: typeof initialData?.credit !== "undefined" ? initialData.credit : 0,
    downloadLink: initialData?.downloadLink || "",
    image: initialData?.image || "",
    description: initialData?.description || "",
  };

  const handleSave = async (values: Record<string, any>, files?: Record<string, File | null>) => {
    const payload: any = {
      id: values.id,
      name: values.name,
      version: values.version,
      credit: Number(values.credit || 0),
      downloadLink: values.downloadLink,
      image: values.image || undefined,
      description: values.description || undefined,
    };

    if (onSave) return onSave(payload, files || {});

    const method = payload.id ? "PUT" : "POST";
    const res = await fetch("/api/admin/catalog/appdownload", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(d?.error || "Failed to save app");
    return d;
  };

  return (
    <EntityModal open={open} title={initialData?.id ? "Edit App" : "Add App"} fields={fields} initialValues={initialValues} saving={saving} onClose={onClose} onSave={handleSave} />
  );
}
