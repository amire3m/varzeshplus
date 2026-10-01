"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchFotMob } from "@/lib/fotmob";

type NewsItem = { title: string; link: string; image: string | null; time: string; category?: string; isMustRead?: boolean };

export default function NewsCenter() {
  const [tab, setTab] = useState<"foryou" | "world">("foryou");
  const [items, setItems] = useState<NewsItem[]>([]);
  const [mustRead, setMustRead] = useState<NewsItem[]>([]);
  const [source, setSource] = useState<"fotmob" | "fallback" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      // try fotmob
      try {
        const r = await fetchFotMob<any>("news", `lang=fa&id=${tab === "foryou" ? "for_you" : "world"}`);
        if (!cancelled && r?.data && (Array.isArray(r.data) || Array.isArray((r.data as any).items))) {
          const arr = Array.isArray(r.data) ? r.data : (r.data as any).items;
          const mapped: NewsItem[] = arr.slice(0, 12).map((n: any) => ({
            title: n.title ?? n.headline ?? "—",
            link: n.link ?? n.url ?? "#",
            image: n.image ?? n.imageUrl ?? null,
            time: n.time ?? "",
            isMustRead: !!n.mustRead,
          }));
          setItems(mapped.filter((x) => !x.isMustRead));
          setMustRead(mapped.filter((x) => x.isMustRead).slice(0, 6));
          setSource(r.source);
          setLoading(false);
          return;
        }
      } catch {}
      // fallback RSS mixed
      try {
        const res = await fetch("/api/news/mixed").then((x) => x.json());
        if (!cancelled && res?.success && Array.isArray(res.items)) {
          const mapped: NewsItem[] = res.items.slice(0, 12).map((n: any) => ({
            title: n.title, link: n.link, image: n.image, time: n.time, category: n.category,
          }));
          setItems(mapped.slice(2));
          setMustRead(mapped.slice(0, 2).map((x) => ({ ...x, isMustRead: true })));
          setSource("fallback");
        }
      } catch {}
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [tab]);

  if (loading) return <div className="rounded-xl border border-white/10 p-6 text-center text-sm text-slate-400 animate-pulse" style={{ background: "#101610" }}>در حال بارگذاری اخبار...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-white/10">
        {(["foryou", "world"] as const).map((k) => (
          <button key={k} onClick={() => setTab(k)} className={`pb-2 pt-1 text-sm font-bold border-b-2 transition-colors ${tab === k ? "border-[#4AE183] text-white" : "border-transparent text-white/50 hover:text-white/80"}`}>
            {k === "foryou" ? "برای شما" : "جهان"}
          </button>
        ))}
        {source && <span className="mr-auto text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-slate-400">{source === "fotmob" ? "FotMob" : "داخلی"}</span>}
      </div>

      {mustRead.length > 0 && (
        <div>
          <h4 className="text-xs font-black text-[#FFD34D] mb-2">باید بخوانید</h4>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {mustRead.map((n, i) => (
              <a key={i} href={n.link} target="_blank" rel="noreferrer" className="shrink-0 w-[240px] rounded-xl overflow-hidden border border-white/10 hover:border-[#4AE183]/30 transition-colors" style={{ background: "#101610" }}>
                {n.image && <img src={n.image} alt="" className="w-full h-28 object-cover" loading="lazy" />}
                <div className="p-2.5">
                  <p className="text-xs font-bold leading-5 line-clamp-2 text-white">{n.title}</p>
                  {n.time && <span className="text-[10px] text-slate-500">{n.time}</span>}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-2">
        {items.map((n, i) => (
          <a key={i} href={n.link} target="_blank" rel="noreferrer" className="flex gap-3 p-3 rounded-xl border border-white/10 hover:bg-white/[0.03] transition-colors" style={{ background: "rgba(16,22,16,0.9)" }}>
            {n.image && <img src={n.image} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" loading="lazy" />}
            <div className="min-w-0">
              <p className="text-[13px] font-bold leading-5 line-clamp-2 text-white">{n.title}</p>
              <span className="text-[10px] text-slate-400">{n.time}</span>
            </div>
          </a>
        ))}
        {!items.length && <p className="text-sm text-slate-500 text-center py-6">خبری یافت نشد</p>}
      </div>
    </div>
  );
}
