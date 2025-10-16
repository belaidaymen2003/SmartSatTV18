import React from "react";
import EditChannelModal from "@/components/Categories/EditChannelModal";

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
  onSave?: (data: any, logoFile?: File | null) => Promise<void>;
}) {
  // Map fields between CatalogApp and the Channel modal
  const { open, onClose, initialData, onSave, saving } = props;

  const mappedInitial = {
    id: initialData?.id,
    name: initialData?.name,
    description: initialData?.description,
    category: initialData?.version || "",
    logo: initialData?.image || undefined,
  };

  const externalOnSave = async (data: { id?: number; name: string; description: string; category: string; logo: string }, logoFile?: File | null) => {
    // data.category holds version, data.logo holds image URL
    const payload: any = {
      name: data.name,
      description: data.description,
      version: data.category,
      image: data.logo,
      credit: initialData?.credit ?? 0,
    };
    if (initialData?.id) payload.id = initialData.id;
    // If onSave provided by caller, let it handle API
    if (onSave) return onSave(payload, logoFile);

    // Default behavior: call admin API
    const method = initialData?.id ? "PUT" : "POST";
    if (initialData?.id) payload.id = initialData.id;
    const res = await fetch("/api/admin/catalog/appdownload", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, downloadLink: initialData?.downloadLink || "" }),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(d?.error || "Failed to save app");
    return d;
  };

  const externalOnDeleteLogo = async () => {
    // No special delete endpoint for images; just set to empty
    // Caller could call API to remove image; here we do nothing.
    return;
  };

  return (
    <EditChannelModal
      open={open}
      onClose={onClose}
      initialData={mappedInitial}
      categories={[]}
      saving={saving}
      onSave={externalOnSave}
      onDeleteLogo={externalOnDeleteLogo}
    />
  );
}
