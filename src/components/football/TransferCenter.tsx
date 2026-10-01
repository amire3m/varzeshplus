"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchFotMob } from "@/lib/fotmob";

// نمایش ساده مرکز نقل‌وانتقالات — داده هیبریدی (fotmob -> fallback به /api/football/transfers)
type Transfer = { id: string; player: string; from: string; to: string; fee?: string; date?: string };

export default function TransferCenter({ leagueSlug }: { leagueSlug?: string }) {
  const [items, setItems] = useState<Transfer[]>([]);
  const [source, setSource] = useState<"fotmob" | "fallback" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      // تلاش fotmob (نمونه: transfers?league=... — اگر 404 ، fallback)
      try {
        const r = await fetchFotMob("transfers", leagueSlug ? `league=${leagueSlug}` : "");
        if (!cancelled && r?.data && Array.isArray((r.data as any)?.transfers)) {
          const list = (r.data as any).transfers.slice(0, 8).map((t: any, i: number) => ({
            id: String(t.id ?? i),
            player: t.playerName ?? t.name ?? "—",
            from: t.fromTeam ?? t.from ?? "—",
            to: t.toTeam ?? t.to ?? "—",
            fee: t.fee ?? t.price ?? undefined,
            date: t.date ?? undefined,
          }));
          setItems(list);
          setSource(r.source);
          setLoading(false);
          return;
        }
      } catch {}
      // fallback داخلی
      try {
        const res = await fetch(`/api/football/transfers${leagueSlug ? `?league=${leagueSlug}` : ""}`).then((x) => x.json());
        if (!cancelled && res?.success && Array.isArray(res.items)) {
          setItems(res.items.slice(0, 8).map((t: any) => ({ id: String(t.id), player: t.player, from: t.fromTeam, to: t.toTeam, fee: t.fee })));
          setSource("fallback");
        }
      } catch {}
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [leagueSlug]);

  if (loading) return <div className="rounded-xl border border-white/10 p-6 text-center text-sm text-slate-400 animate-pulse" style={{ background: "#101610" }}>در حال بارگذاری نقل‌وانتقالات...</div>;

  if (!items.length) return <div className="rounded-xl border border-white/10 p-6 text-center text-sm text-slate-400" style={{ background: "#101610" }}>نقل‌وانتقالی یافت نشد</div>;

  return (
    <div className="rounded-xl border border-white/10 overflow-hidden" style={{ background: "#101610" }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-black">مرکز نقل‌وانتقالات</h3>
        {source && <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-slate-400">{source === "fotmob" ? "FotMob" : "داخلی"}</span>}
      </div>
      <div className="divide-y divide-white/5">
        {items.map((t) => (
          <div key={t.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors">
            <span className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black shrink-0">{t.player.slice(0, 2)}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold truncate">{t.player}</p>
              <p className="text-[11px] text-slate-400 truncate">
                <span className="text-white/60">{t.from}</span> <span className="text-white/20">→</span> <span className="text-[#4AE183]">{t.to}</span>
              </p>
            </div>
            {t.fee && <span className="text-[11px] font-bold px-2 py-1 rounded-full shrink-0" style={{ background: "rgba(74,225,131,0.12)", color: "#4AE183" }}>{t.fee}</span>}
          </div>
        ))}
      </div>
      <Link href="/football/transfers" className="block text-center text-xs font-bold py-3 border-t border-white/5 hover:bg-white/[0.03]" style={{ color: "#FFD34D" }}>
        مشاهده همه
      </Link>
    </div>
  );
}
