"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import Spinner from "@/components/UI/Spinner";
import Toast from "@/components/UI/Toast";

type Props = {
  channelId: number | null;
  open?: boolean;
  onClose?: () => void;
};

export default function SubscriptionModal({ channelId }: Props) {
  const [subs, setSubs] = useState<any[]>([]);
  const [sipinner1, setSipinner1] = useState(false);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"code" | "duration" | "credit">("code");
  const [asc, setAsc] = useState(true);
  const [pageSub, setPageSub] = useState(1);
  const perPage = 10;
  const [message, setMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<any>({});

  useEffect(() => {
    fetchSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelId]);

  const getAuthHeader = () => {
    try {
      const storedId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;
      const storedEmail = typeof window !== "undefined" ? localStorage.getItem("userEmail") : null;
      if (storedId) return { Authorization: `Bearer ${storedId}` };
      if (storedEmail) return { Authorization: `Bearer email:${storedEmail}` };
    } catch (e) {}
    return { Authorization: `Bearer email:admin@local` };
  };

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

  const fetchSubscriptions = async () => {
    if (!channelId) return;
    setSipinner1(true);
    try {
      const res = await fetch(`/api/admin/categories/category/subscription?channelId=${channelId}`);
      const data = await res.json().catch(()=>({}));
      setSubs(Array.isArray(data.subscriptions) ? data.subscriptions : []);
    } catch (e) {
      setSubs([]);
    } finally {
      setSipinner1(false);
    }
  };

  const startEdit = (s: any) => {
    setEditingId(s.id ?? null);
    setEditValues({ code: s.code, duration: toMonths(s.duration), credit: s.credit });
  };

  const saveEdit = async (id: number) => {
    try {
      const payload: any = { id };
      if (typeof editValues.code === "string") payload.code = editValues.code;
      if (typeof editValues.duration !== "undefined") payload.durationMonths = Number(editValues.duration);
      if (typeof editValues.credit !== "undefined") payload.credit = Number(editValues.credit);
      const res = await fetch("/api/admin/categories/category/subscription", { method: "PUT", headers: { "Content-Type": "application/json", ...getAuthHeader() }, body: JSON.stringify(payload) });
      const d = await res.json().catch(()=>({}));
      if (res.ok) {
        setEditingId(null);
        fetchSubscriptions();
      } else {
        setMessage(d?.error || "Failed to update");
      }
    } catch (e:any) {
      setMessage(String(e?.message || e));
    }
  };

  const removeSub = async (idOrCode: number | string) => {
    const qparam = typeof idOrCode === "number" ? `id=${idOrCode}` : `code=${encodeURIComponent(String(idOrCode))}`;
    const res = await fetch(`/api/admin/categories/category/subscription?${qparam}`, { method: "DELETE", headers: { ...getAuthHeader() } });
    const d = await res.json().catch(()=>({}));
    if (!res.ok) setMessage(d?.error || "Failed to delete");
    else setMessage("Deleted");
    fetchSubscriptions();
  };

  const filteredSubs = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const base = (subs || []).filter((s: any) => !qq || String(s.code).toLowerCase().includes(qq));
    const sorted = [...base].sort((a: any, b: any) => {
      const av = sort === "code" ? String(a.code) : sort === "duration" ? toMonths(a.duration) : Number(a.credit ?? 0);
      const bv = sort === "code" ? String(b.code) : sort === "duration" ? toMonths(b.duration) : Number(b.credit ?? 0);
      if (av < bv) return asc ? -1 : 1;
      if (av > bv) return asc ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [q, subs, sort, asc]);

  const total = filteredSubs.length;
  const start = (pageSub - 1) * perPage;
  const pageRows = filteredSubs.slice(start, start + perPage);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded px-2 py-1 w-full sm:w-64">
          <Search className="w-4 h-4 text-white/60" />
          <input className="bg-transparent text-white/80 text-sm w-full placeholder-white/40 focus:outline-none" placeholder="Search codes..." value={q} onChange={(e)=>{ setPageSub(1); setQ(e.target.value); }} />
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-black/30 border border-white/10 rounded px-2 py-1 text-white/80" value={sort} onChange={(e)=>setSort(e.target.value as any)}>
            <option value="code">Code</option>
            <option value="duration">Duration</option>
            <option value="credit">Credits</option>
          </select>
          <button className="px-2 py-1 rounded border border-white/10 text-white/80 hover:bg-white/10" onClick={()=>setAsc(v=>!v)} aria-label="Toggle sort order">{asc?"Asc":"Desc"}</button>
        </div>
        <div className="ml-auto text-xs text-white/60">{filteredSubs.length} items • Total credits {filteredSubs.reduce((acc:any,s:any)=>acc+Number(s.credit||0),0)}</div>
      </div>

      {sipinner1 ? <div className="py-6"><Spinner size={6} /></div> : !subs || subs.length === 0 ? (
        <div className="text-white/60 bg-white/5 border border-white/10 rounded p-4">No subscriptions yet.</div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="text-white/70 text-sm"><th className="px-3 py-2">Code</th><th className="px-3 py-2">Duration</th><th className="px-3 py-2">Credits</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Actions</th></tr>
            </thead>
            <tbody>
              {pageRows.map((s:any)=> (
                <tr key={s.id||s.code} className="bg-black/30 border border-white/10 rounded">
                  <td className="px-3 py-2 align-middle">{editingId===s.id? (
                    <input value={editValues.code||""} onChange={(e)=>setEditValues((ev:any)=>({...ev, code: e.target.value}))} className="bg-transparent border border-white/10 rounded px-2 py-1 text-white focus:outline-none" />
                  ):(<div className="flex items-center gap-2"><button onClick={()=>navigator.clipboard?.writeText?.(s.code)} className="text-white hover:underline" title="Copy code">{s.code}</button></div>)}</td>
                  <td className="px-3 py-2 align-middle text-white/80">{editingId===s.id? (
                    <select value={String(editValues.duration ?? toMonths(s.duration))} onChange={(e)=>setEditValues((ev:any)=>({...ev, duration: Number(e.target.value)}))} className="border border-white/10 rounded px-2 py-1 disabled:bg-transparent text-black"><option value={1}>1 month</option><option value={6}>6 months</option><option value={12}>12 months</option></select>
                  ):(`${toMonths(s.duration)}m`)}</td>
                  <td className="px-3 py-2 align-middle">{editingId===s.id? (
                    <input type="number" inputMode="numeric" pattern="[0-9]*" min={0} step={1} onWheel={(e)=> (e.currentTarget as HTMLInputElement).blur()} value={String(editValues.credit ?? s.credit)} onChange={(e)=>setEditValues((ev:any)=>({...ev, credit: Number(e.target.value)}))} className="bg-transparent border border-white/10 rounded px-2 py-1 text-white focus:outline-none" />
                  ):(<div className="text-white">{s.credit??0}</div>)}</td>
                  <td className="px-3 py-2"><span className="inline-flex items-center px-2 py-0.5 rounded border text-xs border-emerald-500/30 text-emerald-400">{s.status||"ACTIVE"}</span></td>
                  <td className="px-3 py-2"><div className="flex gap-2">{editingId===s.id? (<><button onClick={()=>saveEdit(s.id)} className="px-2 py-1 rounded border border-green-500 text-green-400">Save</button><button onClick={()=>{setEditingId(null); setEditValues({});}} className="px-2 py-1 rounded border border-white/10">Cancel</button></>) : (<><button onClick={()=>startEdit(s)} className="px-2 py-1 rounded border border-white/10 hover:bg-white/10 text-white/80">Edit</button><button onClick={()=>removeSub(s.id)} className="px-2 py-1 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10">Delete</button></>)}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > perPage && (
        <div className="flex items-center justify-between text-xs text-white/60"><div>Page {pageSub} of {Math.max(1, Math.ceil(total / perPage))}</div><div className="flex gap-2"><button disabled={pageSub<=1} onClick={()=>setPageSub(p=>Math.max(1,p-1))} className="px-3 py-1 rounded border border-white/10 disabled:opacity-50">Prev</button><button disabled={start+perPage>=total} onClick={()=>setPageSub(p=>p+1)} className="px-3 py-1 rounded border border-white/10 disabled:opacity-50">Next</button></div></div>
      )}

      {message && <Toast message={message} onClose={()=>setMessage(null)} />}
    </div>
  );
}
