"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";

type NewsItem = { id: number; title: string; summary: string | null; category: string; isBreaking: boolean; publishedAt: string | null; programTitle: string | null };

export default function NewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [selected, setSelected] = useState<{ title: string; body: string | null; summary: string | null } | null>(null);

  const load = useCallback(async (id?: string) => {
    if (id) {
      const res = await fetch(`/api/news?id=${id}`).then((r) => r.json());
      if (res.success) setSelected({ title: res.news.title, body: res.news.body, summary: res.news.summary });
      return;
    }
    const res = await fetch("/api/news").then((r) => r.json()).catch(() => null);
    if (res?.success) setItems(res.items ?? []);
  }, []);

  const initRef = useRef(false);
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      const q = new URLSearchParams(window.location.search).get("id");
      if (q) { load(q); } else { load(); }
    }
  }, [load]);

  return (
    <PageShell badge="اخبار" activeDock="home">
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-3">
        {selected ? (
          <article className="rounded-[14px] border p-6" style={{ background: "#0d1424", borderColor: "rgba(120,160,200,0.15)" }}>
            <h2 className="headline text-xl mb-3 text-white">{selected.title}</h2>
            <p className="text-sm leading-7" style={{ color: "#8FA1B5" }}>{selected.body ?? selected.summary}</p>
            <button onClick={() => { setSelected(null); window.history.replaceState({}, "", "/news"); }} className="mt-5 px-4 py-2 rounded-xl border text-sm font-bold transition-colors hover:bg-white/5" style={{ borderColor: "rgba(0,180,216,0.35)", color: "#00b4d8" }}>بازگشت به فهرست</button>
          </article>
        ) : items.map((n) => (
          <Link key={n.id} href={`/news?id=${n.id}`} onClick={(e) => { e.preventDefault(); load(String(n.id)); window.history.replaceState({}, "", `/news?id=${n.id}`); }} className="block rounded-[14px] border border-white/10 p-4 transition-colors hover:bg-white/[0.04]" style={{ background: "#0d1424", borderColor: "rgba(120,160,200,0.15)" }}>
            <div className="flex items-center gap-2 mb-1.5">
              {n.isBreaking && <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "#E8385D", color: "#fff" }}>فوری</span>}
              {n.programTitle && <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(0,180,216,0.12)", color: "#00b4d8" }}>{n.programTitle}</span>}
            </div>
            <h2 className="font-medium leading-6 text-white">{n.title}</h2>
            {n.summary && <p className="text-sm mt-1 line-clamp-2" style={{ color: "#8FA1B5" }}>{n.summary}</p>}
          </Link>
        ))}
        {!items.length && !selected && <p style={{ color: "#8FA1B5" }}>خبری برای نمایش نیست.</p>}
      </main>
    </PageShell>
  );
}
