"use client";

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
import { CATEGORIES } from "@/lib/constants";

// IPTV model
type IPTVChannel = {
  id: number;
  name: string;
  logo: string | null;
  description: string | null;
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
  });
  const [preview, setPreview] = useState<IPTVChannel | null>(null);
  const pageSize = 12;
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [logo, setLogo] = useState<logo>({ logourl: "", logofile: null });

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
            <select
              className="bg-black/30 border border-white/10 rounded px-2 py-1 text-white/80"
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
            >
              <option value="code">Code</option>
              <option value="duration">Duration</option>
              <option value="credit">Credits</option>
            </select>
            <button
              className="px-2 py-1 rounded border border-white/10 text-white/80 hover:bg-white/10"
              onClick={() => setAsc((v) => !v)}
              aria-label="Toggle sort order"
            >
              {asc ? "Asc" : "Desc"}
            </button>
          </div>
          <div className="ml-auto text-xs text-white/60">
            {stats.count} items • Total credits {stats.totalCredit}
          </div>
        </div>

        {sipinner1 ? (
          <div className="py-6"><Spinner size={6} /></div>
        ) : !subs || subs.length === 0 ? (
          <div className="text-white/60 bg-white/5 border border-white/10 rounded p-4">
            No subscriptions yet. <a className="underline" href="#">Add some</a> to get started.
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="text-white/70 text-sm">
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Duration</th>
                  <th className="px-3 py-2">Credits</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((s: any) => (
                  <tr
                    key={s.id || s.code}
                    className="bg-black/30 border border-white/10 rounded"
                  >
                    <td className="px-3 py-2 align-middle">
                      {editingId === s.id ? (
                        <input
                          value={editValues.code || ""}
                          onChange={(e) =>
                            setEditValues((ev) => ({ ...ev, code: e.target.value }))
                          }
                          className="bg-transparent border border-white/10 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/40"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyCode(s.code)}
                            className="text-white hover:underline"
                            title="Copy code"
                          >
                            {s.code}
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 align-middle text-white/80">
                      {editingId === s.id ? (
                        <select
                          value={String(
                            editValues.duration ?? toMonths(s.duration)
                          )}
                          onChange={(e) => {
                            setEditValues((ev) => ({
                              ...ev,
                              duration: Number(e.target.value),
                            }));
                          }}
                          className=" border border-white/10 rounded px-2 py-1 disabled:bg-transparent text-black"
                        >
                          <option value={1}>1 month</option>
                          <option value={6}>6 months</option>
                          <option value={12}>12 months</option>
                        </select>
                      ) : (
                        `${toMonths(s.duration)}m`
                      )}
                    </td>
                    <td className="px-3 py-2 align-middle">
                      {editingId === s.id ? (
                        <input
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          min={0}
                          step={1}
                          onWheel={(e)=> (e.currentTarget as HTMLInputElement).blur()}
                          value={String(editValues.credit ?? s.credit)}
                          onChange={(e) =>
                            setEditValues((ev) => ({
                              ...ev,
                              credit: Number(e.target.value),
                            }))
                          }
                          className="bg-transparent border border-white/10 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/40"
                        />
                      ) : (
                        <div className="text-white">{s.credit ?? 0}</div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded border text-xs border-emerald-500/30 text-emerald-400">
                        {s.status || "ACTIVE"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        {editingId === s.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(s.id)}
                              className="px-2 py-1 rounded border border-green-500 text-green-400"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-2 py-1 rounded border border-white/10"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(s)}
                              className="px-2 py-1 rounded border border-white/10 hover:bg-white/10 text-white/80"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => removeSubWithAuth(s.id)}
                              className="px-2 py-1 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {total > perPage && (
          <div className="flex items-center justify-between text-xs text-white/60">
            <div>
              Page {pageSub} of {Math.max(1, Math.ceil(total / perPage))}
            </div>
            <div className="flex gap-2">
              <button
                disabled={pageSub <= 1}
                onClick={() => setPageSub((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded border border-white/10 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                disabled={start + perPage >= total}
                onClick={() => setPageSub((p) => p + 1)}
                className="px-3 py-1 rounded border border-white/10 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
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

          <SubscriptionTable channelId={channelId} />
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
      const res = await fetch(`/api/admin/categories/category?slug=iptv&page=${page}&pageSize=${pageSize}`, {
        cache: "no-store",
      });
      let data: any = {};
      try {
        data = await res.clone().json();
      } catch (e) {
        console.log(e);
      }
      setChannels( data.channels ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions(channelId);
  }, [channelId]);
  useEffect(() => {
    fetchChannels();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return channels.filter((c) => {
      const matchesQuery = !q || c.name.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === "All" || (c.category ) === categoryFilter;
      return matchesQuery && matchesCategory;
    });
  }, [channels, query, categoryFilter]);

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const rows = filtered.slice(start, start + pageSize);

  const openEdit = (ch: IPTVChannel) => {
    setEdit(ch);
    setForm({
      name: ch.name || "",
      logo: ch.logo || "",
      description: ch.description || "",
      category: ch.category || "IPTV",
    });
  };

  const saveEdit = async () => {
    if (!edit) return;
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
          IPTV{" "}
          <span className="text-white/50 text-sm ml-2" suppressHydrationWarning>
            {total} Total
          </span>
        </h1>
        <button
          onClick={() => router.push("/admin/categories/add/iptv")}
          className="px-4 py-2 rounded-lg border border-orange-500 text-orange-400 hover:bg-orange-500/10 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          ADD ITEM
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2 w-full md:w-48">
          <select
            className="w-full bg-transparent text-white/80 text-sm focus:outline-none"
            value={categoryFilter}
            onChange={(e)=>{ setPage(1); setCategoryFilter(e.target.value); }}
          >
            <option>All</option>
            {CATEGORIES.map(c => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>
        <div className="ml-auto bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2 w-full md:w-80">
          <Search className="w-4 h-4 text-white/60" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search in IPTV...`}
            className="bg-transparent text-white/80 text-sm w-full placeholder-white/40 focus:outline-none"
          />
        </div>
      </div>

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
              <div
                key={ch.id}
                className="bg-black/30 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors cursor-pointer"
                onClick={() => {
                  setPreview(ch);
                  setChannelId(ch.id);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                    {ch.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ch.logo}
                        alt={ch.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-white/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">
                      {ch.name}
                    </div>
                    <div className="text-xs text-white/60 mt-0.5">
                      {ch.category}
                    </div>
                    {ch.description && (
                      <div className="text-xs text-white/50 mt-1 line-clamp-2">
                        {ch.description}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div
                    className="flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => openEdit(ch)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded border border-white/10 hover:bg-white/10 text-white/80"
                    >
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(ch.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between p-1">
          <div className="text-white/60 text-xs">
            Page {page} of {Math.max(1, Math.ceil(total / pageSize))}
          </div>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 rounded border border-white/10 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={start + pageSize >= total}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded border border-white/10 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {preview && (
        <PreviewModal
          channelId={channelId}
          channel={preview}
          onClose={() => setPreview(null)}
        />
      )}

      {edit && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          onClick={() => setEdit(null)}
        >
          <div
            className="w-full max-w-2xl bg-black/30 border border-white/10 rounded-xl p-6 backdrop-blur-md shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Edit Channel</h3>
              <button
                onClick={() => setEdit(null)}
                className="p-1 rounded hover:bg-white/10"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="sm:col-span-1">
                <label className="block text-sm text-white/70 mb-2">Logo</label>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col items-center">
                  {form.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logo.logourl !== '' ? logo.logourl : form.logo}
                      alt={form.name}
                      className="h-28 w-28 rounded-lg bg-white/10 object-contain"
                    />
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
                          if (f)
                            setLogo({
                              logofile: f,
                              logourl: URL.createObjectURL(f),
                            });
                        }}
                      />
                    </label>
                    {form.logo && (
                      <button
                        type="button"
                        onClick={deleteLogo}
                        className="px-3 py-2 border border-red-500/30 text-red-400 rounded hover:bg-red-500/10"
                      >
                        Remove
                      </button>
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
                    {CATEGORIES.map((c) => (
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
              <button
                onClick={() => setEdit(null)}
                className="px-4 py-2 rounded border border-white/20 text-white/80 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 rounded border border-orange-500 text-orange-400 hover:bg-orange-500/10"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
