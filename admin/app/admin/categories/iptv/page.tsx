'use client'
import { use, useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Image as ImageIcon,
  Play,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Hls from "hls.js";
import Spinner from "@/components/UI/Spinner";
import Toast from "@/components/UI/Toast";
import ConfirmModal from "@/components/UI/ConfirmModal";
import Pagination from "@/components/Admin/Pagination";
import FiltersBar from "@/components/Categories/FiltersBar";
import ChannelCard from "@/components/Categories/ChannelCard";
import EditChannelModal from "@/components/Categories/EditChannelModal";
import SubscriptionModal from "@/components/Categories/SubscriptionModal";
import { CATEGORIES } from "@/lib/constants";

// IPTV model
type IPTVChannel = {
  id: number;
  name: string;
  logo: string | null;
  description: string | null;
  type: string | null;
  category: string | null;
  createdAt: string;
  updatedAt: string;
};
type logo = {
  logourl: string;
  logofile: File | null;
};
export default function IPTVPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [channels, setChannels] = useState<IPTVChannel[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [toast, setToast] = useState<{message: string; type?: "success"|"error"|"info"|"warning"}|null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number|null>(null);
  const [loading, setLoading] = useState(false);
  const [edit, setEdit] = useState<IPTVChannel | null>(null);
  const [channelId, setChannelId] = useState<number | null>(null);
  const [sipinner1, setSipinner1] = useState<boolean>(false);
  const [subs, setSubs] = useState<
    { id?: number; code: string; duration: number; credit: number }[]
  >([{ id: undefined, code: "", duration: 1, credit: 0 }]);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    logo: "",
    description: "",
    category: "IPTV",
    type: "OTHER",
  });
  const [preview, setPreview] = useState<IPTVChannel | null>(null);
  const pageSize = 12;
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [logo, setLogo] = useState<logo>({ logourl: "", logofile: null });
  const [savingEdit, setSavingEdit] = useState(false);

  function SubscriptionTable({ channelId }: { channelId: number | null }) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValues, setEditValues] = useState<{
      code?: string;
      duration?: number;
      credit?: number;
    }>({});
    const [q, setQ] = useState("");
    const [sort, setSort] = useState<"code" | "duration" | "credit">(
      "code"
    );
    const [asc, setAsc] = useState(true);
    const [pageSub, setPageSub] = useState(1);
    const perPage = 10;

    const toMonths = (d: any) =>
      typeof d === "number"
        ? d
        : d === "ONE_MONTH"
        ? 1
        : d === "SIX_MONTHS"
        ? 6
        : d === "ONE_YEAR"
        ? 12
        : 1;

    if (!channelId) return null;

    const getAuthHeader = () => {
      try {
        const storedId =
          typeof window !== "undefined" ? localStorage.getItem("userId") : null;
        const storedEmail =
          typeof window !== "undefined"
            ? localStorage.getItem("userEmail")
            : null;
        if (storedId) return { Authorization: `Bearer ${storedId}` };
        if (storedEmail)
          return { Authorization: `Bearer email:${storedEmail}` };
      } catch (e) {}
      return { Authorization: `Bearer email:admin@local` };
    };

    const startEdit = (s: any) => {
      setEditingId(s.id ?? null);
      setEditValues({
        code: s.code,
        duration: toMonths(s.duration),
        credit: s.credit,
      });
    };

    const cancelEdit = () => {
      setEditingId(null);
      setEditValues({});
    };

    const saveEdit = async (id: number) => {
      try {
        const payload: any = { id };
        if (typeof editValues.code === "string") payload.code = editValues.code;
        if (typeof editValues.duration !== "undefined")
          payload.durationMonths = Number(editValues.duration);
        if (typeof editValues.credit !== "undefined")
          payload.credit = Number(editValues.credit);
        const res = await fetch("/api/admin/categories/category/subscription", {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...getAuthHeader() },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setEditingId(null);
          fetchSubscriptions(channelId);
        } else {
          const d = await res.json().catch(()=>({error:'Failed to update'}));
          setMessage(d?.error || "Failed to update");
        }
      } catch (e) {
        console.log(e);
      }
    };

    const removeSubWithAuth = async (idOrCode: number | string) => {
      const q = `id=${Number(idOrCode)}`
        
      await fetch(`/api/admin/categories/category/subscription?${q}`, {
        method: "DELETE",
        headers: { ...getAuthHeader() },
      });
      fetchSubscriptions(channelId);
    };

    const filteredSubs = useMemo(() => {
      const qq = q.trim().toLowerCase();
      const base = (subs || []).filter((s: any) =>
        !qq || String(s.code).toLowerCase().includes(qq)
      );
      const sorted = [...base].sort((a: any, b: any) => {
        const av =
          sort === "code"
            ? String(a.code)
            : sort === "duration"
            ? toMonths(a.duration)
            : Number(a.credit ?? 0);
        const bv =
          sort === "code"
            ? String(b.code)
            : sort === "duration"
            ? toMonths(b.duration)
            : Number(b.credit ?? 0);
        if (av < bv) return asc ? -1 : 1;
        if (av > bv) return asc ? 1 : -1;
        return 0;
      });
      return sorted;
    }, [q, subs, sort, asc]);

    const total = filteredSubs.length;
    const start = (pageSub - 1) * perPage;
    const pageRows = filteredSubs.slice(start, start + perPage);

    const stats = useMemo(() => {
      const totalCredit = filteredSubs.reduce(
        (acc: number, s: any) => acc + Number(s.credit ?? 0),
        0
      );
      return { count: filteredSubs.length, totalCredit };
    }, [filteredSubs]);

    const copyCode = async (code: string) => {
      try {
        await navigator.clipboard.writeText(code);
        setMessage(`Copied: ${code}`);
        setTimeout(() => setMessage(null), 1500);
      } catch {}
    };

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded px-2 py-1 w-full sm:w-64">
            <Search className="w-4 h-4 text-white/60" />
            <input
              className="bg-transparent text-white/80 text-sm w-full placeholder-white/40 focus:outline-none"
              placeholder="Search codes..."
              value={q}
              onChange={(e) => {
                setPageSub(1);
                setQ(e.target.value);
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <select className="bg-black/30 border border-white/10 rounded px-2 py-1 text-white/80" value={sort} onChange={(e) => setSort(e.target.value as any)}>
              <option value="code">Code</option>
              <option value="duration">Duration</option>
              <option value="credit">Credits</option>
            </select>
            <button className="px-2 py-1 rounded border border-white/10 text-white/80 hover:bg-white/10" onClick={() => setAsc((v) => !v)} aria-label="Toggle sort order">{asc?"Asc":"Desc"}</button>
          </div>
          <div className="ml-auto text-xs text-white/60">{stats.count} items • Total credits {stats.totalCredit}</div>
        </div>

        {sipinner1 ? (
          <div className="py-6"><Spinner size={6} /></div>
        ) : !subs || subs.length === 0 ? (
          <div className="text-white/60 bg-white/5 border border-white/10 rounded p-4">No subscriptions yet. <a className="underline" href="#">Add some</a> to get started.</div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="text-white/70 text-sm"><th className="px-3 py-2">Code</th><th className="px-3 py-2">Duration</th><th className="px-3 py-2">Credits</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Actions</th></tr>
              </thead>
              <tbody>
                {pageRows.map((s: any) => (
                  <tr key={s.id||s.code} className="bg-black/30 border border-white/10 rounded">
                    <td className="px-3 py-2 align-middle">{editingId===s.id? (
                      <input value={editValues.code||""} onChange={(e)=>setEditValues(ev=>({...ev, code: e.target.value}))} className="bg-transparent border border-white/10 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/40" />
                    ):(<div className="flex items-center gap-2"><button onClick={()=>copyCode(s.code)} className="text-white hover:underline" title="Copy code">{s.code}</button></div>)}</td>
                    <td className="px-3 py-2 align-middle text-white/80">{editingId===s.id? (
                      <select value={String(editValues.duration ?? toMonths(s.duration))} onChange={(e)=>setEditValues(ev=>({...ev, duration: Number(e.target.value)}))} className=" border border-white/10 rounded px-2 py-1 disabled:bg-transparent text-black"><option value={1}>1 month</option><option value={6}>6 months</option><option value={12}>12 months</option></select>
                    ):(`${toMonths(s.duration)}m`)}</td>
                    <td className="px-3 py-2 align-middle">{editingId===s.id? (<input type="number" inputMode="numeric" pattern="[0-9]*" min={0} step={1} onWheel={(e)=>(e.currentTarget as HTMLInputElement).blur()} value={String(editValues.credit ?? s.credit)} onChange={(e)=>setEditValues(ev=>({...ev, credit: Number(e.target.value)}))} className="bg-transparent border border-white/10 rounded px-2 py-1 text-white focus:outline-none" />):(<div className="text-white">{s.credit??0}</div>)}</td>
                    <td className="px-3 py-2"><span className="inline-flex items-center px-2 py-0.5 rounded border text-xs border-emerald-500/30 text-emerald-400">{s.status||"ACTIVE"}</span></td>
                    <td className="px-3 py-2"><div className="flex gap-2">{editingId===s.id? (<><button onClick={()=>saveEdit(s.id)} className="px-2 py-1 rounded border border-green-500 text-green-400">Save</button><button onClick={cancelEdit} className="px-2 py-1 rounded border border-white/10">Cancel</button></>) : (<><button onClick={()=>startEdit(s)} className="px-2 py-1 rounded border border-white/10 hover:bg-white/10 text-white/80">Edit</button><button onClick={()=>removeSubWithAuth(s.id)} className="px-2 py-1 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10">Delete</button></>)}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > perPage && (
          <div className="flex items-center justify-between text-xs text-white/60"><div>Page {pageSub} of {Math.max(1, Math.ceil(total / perPage))}</div><div className="flex gap-2"><button disabled={pageSub<=1} onClick={()=>setPageSub(p=>Math.max(1,p-1))} className="px-3 py-1 rounded border border-white/10 disabled:opacity-50">Prev</button><button disabled={start+perPage>=total} onClick={()=>setPageSub(p=>p+1)} className="px-3 py-1 rounded border border-white/10 disabled:opacity-50">Next</button></div></div>
        )}
      </div>
    );
  }

  function PreviewModal({
    channelId,
    channel,
    onClose,
  }: {
    channel: IPTVChannel;
    onClose: () => void;
    channelId: number | null;
  }) {
    return (
      <div
        className="fixed inset-0  z-50 grid place-items-center bg-black/70 p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-4xl bg-black/40 border border-white/10 rounded-xl p-5 backdrop-blur-md shadow-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 min-w-0">
              {channel.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={channel.logo}
                  alt={channel.name}
                  className="h-10 w-10 rounded bg-white/10 object-contain"
                />
              ) : (
                <div className="h-10 w-10 rounded bg-white/10 grid place-items-center">
                  <ImageIcon className="w-5 h-5 text-white/40" />
                </div>
              )}
              <div className="truncate">
                <div className="text-white font-semibold truncate">{channel.name}</div>
                <div className="text-white/60 text-xs truncate">
                  {channel.category}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`/admin/categories/add/iptv/subscription/${channel.id}`}
                rel="noreferrer"
              >
                <button className="inline-flex items-center gap-1 px-2 py-1 rounded border border-white/10 hover:bg-white/10 text-white/80">
                  <Edit2 className="w-4 h-4" /> Add Subscription
                </button>
              </a>
              <button onClick={onClose} className="p-1 rounded hover:bg-white/10" aria-label="Close">
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
          </div>

          {message && (
            <div className="mb-3 text-xs rounded border border-emerald-500/30 text-emerald-300 bg-emerald-500/10 px-3 py-2">
              {message}
            </div>
          )}

          <SubscriptionModal channelId={channelId} />
        </div>
      </div>
    );
  }
  const fetchSubscriptions = async (channelId: number | null) => {
    if (!channelId) return;
    setSipinner1(true);
    let headers: any = {};
    try {
      const storedId =
        typeof window !== "undefined" ? localStorage.getItem("userId") : null;
      const storedEmail =
        typeof window !== "undefined"
          ? localStorage.getItem("userEmail")
          : null;
      if (storedId) headers.Authorization = `Bearer ${storedId}`;
      else if (storedEmail)
        headers.Authorization = `Bearer email:${storedEmail}`;
      else headers.Authorization = `Bearer email:admin@local`;
    } catch (e) {
      headers.Authorization = `Bearer email:admin@local`;
    }

    const res = await fetch(
      `/api/admin/categories/category/subscription?channelId=${channelId}`,
      { headers }
    );
    const data = await res.json();
    if (!data) {
      setSipinner1(false);
      return;
    }
    setSubs(data.subscriptions);
    setSipinner1(false);
  };
  const fetchChannels = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("slug", "iptv");
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      const q = query.trim();
      if (q) params.set("q", q);
      if (categoryFilter && categoryFilter !== "All") params.set("category", categoryFilter);
      const res = await fetch(`/api/admin/categories/category?${params.toString()}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setToast({ message: data?.error || "Failed to load channels", type: "error" });
      }
      setChannels(Array.isArray(data.channels) ? data.channels : []);
      setTotalCount(Number(data.total) || 0);
    } catch (e: any) {
      setToast({ message: e?.message || "Network error while loading channels", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions(channelId);
  }, [channelId]);
  useEffect(() => {
    fetchChannels();
  }, [page, pageSize, query, categoryFilter]);

  const start = (page - 1) * pageSize;
  const rows = channels;

  const openEdit = (ch: IPTVChannel) => {
    setEdit(ch);
    setForm({
      name: ch.name || "",
      logo: ch.logo || "",
      description: ch.description || "",
      category: ch.category || "IPTV",
      type: ch.type || "OTHER",
    });
  };

  const saveEdit = async () => {
    if (!edit) return;
    setSavingEdit(true);
    try {
      const newlogourl = await replaceLogo();
      const payload: any = { id: edit.id, ...form };
      if (newlogourl?.logoUrl) payload.logo = newlogourl.logoUrl;
      const res = await fetch("/api/admin/categories/category", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(()=>({error: 'Failed to save'}));
        setToast({ message: d?.error || "Failed to save changes", type: "error" });
        return;
      }
      setToast({ message: "Channel updated successfully", type: "success" });
      setEdit(null);
      fetchChannels();
    } catch (e:any) {
      setToast({ message: e?.message || "Unexpected error while saving", type: "error" });
    } finally {
      setSavingEdit(false);
    }
  };

  const removeChannel = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/categories/category?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(()=>({error:'Failed to delete'}));
        setToast({ message: d?.error || "Failed to delete channel", type: "error" });
        return;
      }
      setToast({ message: "Channel deleted", type: "success" });
      fetchChannels();
    } catch (e:any) {
      setToast({ message: e?.message || "Unexpected error while deleting", type: "error" });
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const replaceLogo = async () => {
    if (!edit) return;
    const fd = new FormData();
    fd.append("channelId", String(edit.id));
    if (logo.logofile) {
      fd.append("file", logo.logofile);
    }

    fd.append("fileName", logo.logofile?.name || "");
    if (edit.logo) fd.append("oldLogoUrl", edit.logo);
    const res = await fetch("/api/admin/categories/upload", { method: "PUT", body: fd });
    return res.json();
  };

  const deleteLogo = async () => {
    if (!edit) return;
    await fetch("/api/admin/categories/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channelId: edit.id,
        logoUrl: edit.logo || undefined,
      }),
    });
    setForm((f) => ({ ...f, logo: "" }));
    fetchChannels();
  };
  useEffect(() => {
    if (!edit) {
      setLogo({ logourl: "", logofile: null });
    }
  }, [edit]);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">
          IPTV
          <span className="text-white/50 text-sm ml-2" suppressHydrationWarning>
            {totalCount} Total
          </span>
        </h1>
      </div>

      <FiltersBar
        categories={CATEGORIES}
        category={categoryFilter}
        onCategoryChange={(v) => { setPage(1); setCategoryFilter(v); }}
        query={query}
        onQueryChange={(v) => { setPage(1); setQuery(v); }}
        onAdd={() => router.push("/admin/categories/add/iptv")}
      />

      {confirmDeleteId !== null && (
        <ConfirmModal
          title="Delete Channel"
          message="Are you sure you want to delete this channel? This action cannot be undone."
          confirmText="Delete"
          onConfirm={() => removeChannel(confirmDeleteId)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="text-white/60">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="text-white/60">No channels</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rows.map((ch) => (
              <ChannelCard
                key={ch.id}
                channel={ch}
                onPreview={(c) => { setPreview(c as any); setChannelId(c.id); }}
                onEdit={(c) => openEdit(c as any)}
                onDelete={(id) => setConfirmDeleteId(id)}
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between p-1">
          <div />
          <Pagination total={totalCount} pageSize={pageSize} page={page} onPageChange={setPage} />
        </div>
      </div>

      {preview && (
        <PreviewModal
          channelId={channelId}
          channel={preview}
          onClose={() => setPreview(null)}
        />
      )}

      <EditChannelModal
        open={!!edit}
        onClose={() => setEdit(null)}
        initialData={{ id: edit?.id, name: form.name, description: form.description, category: form.category, logo: form.logo , type: form.type}}
        categories={CATEGORIES}
        saving={savingEdit}
        onDeleteLogo={async () => {
          await deleteLogo();
        }}
        onSave={async (d, file) => {
          if (!edit) return;
          setSavingEdit(true);
          try {
            // upload file if present
            let fileUrl: any = null; 
            if (file) {
              const fd = new FormData();
              fd.append("channelId", String(edit.id));
              fd.append("file", file);
              fd.append("fileName", file.name);
              if (edit.logo) fd.append("oldLogoUrl", edit.logo);
              fileUrl = await fetch("/api/admin/categories/upload", { method: "PUT", body: fd }).then((res) => res.json());
            }
            const payload: any = { id: edit.id, name: d.name, description: d.description, category: d.category, type: d.type, logo: fileUrl?.logoUrl };
            const res = await fetch("/api/admin/categories/category", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            if (!res.ok) {
              const cd = await res.json().catch(()=>({}));
              throw new Error(cd?.error || "Failed to save");
            }
            setToast({ message: "Channel updated successfully", type: "success" });
            setEdit(null);
            fetchChannels();
          } catch (e:any) {
            setToast({ message: e?.message || "Unexpected error while saving", type: "error" });
          } finally { setSavingEdit(false); }
        }}
      />
    </div>
  );
}
