"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { PlayerAvatar } from "@/components/football/PlayerAvatar";

function ComparePlayerInner() {
  const sp = useSearchParams();
  const ids = (sp.get("ids") ?? "").split(",").filter(Boolean).slice(0, 2);
  const a = ids[0] ?? "940915";
  const b = ids[1] ?? "671631";

  return (
    <PageShell badge="مقایسه بازیکن" activeDock="home">
      <main className="max-w-[900px] mx-auto px-4 py-6 space-y-4">
        <h1 className="headline text-xl text-white">مقایسه بازیکن — Player vs Player</h1>
        <p className="text-xs text-slate-400">پارامتر: <span className="tabular" dir="ltr">?ids={a},{b}</span> — مثال FotMob <span className="text-[#4AE183]">feature.squadmember.ui.playervsplayer.PlayerVsPlayerActivity</span></p>

        <div className="grid md:grid-cols-2 gap-4">
          {[a, b].map((id) => (
            <Link key={id} href={`/football/players/${id}`} className="rounded-xl border border-white/10 p-4 flex items-center gap-3 hover:bg-white/[0.03]" style={{ background: "#101610" }}>
              <PlayerAvatar name={`Player ${id}`} size={48} color="#4AE183" />
              <div>
                <p className="text-sm font-bold text-white">بازیکن #{id}</p>
                <p className="text-xs text-slate-400">برای جزئیات کلیک کنید</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="rounded-xl border border-white/10 overflow-hidden" style={{ background: "#101610" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.03] text-slate-400">
                <th className="px-3 py-2 text-right">شاخص</th>
                <th className="px-3 py-2 text-center tabular">A</th>
                <th className="px-3 py-2 text-center tabular">B</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["گل", "12", "9"], ["پاس گل", "7", "11"], ["دقیقه", "2,340", "2,100"], ["ارزش بازار", "€45M", "€38M"],
              ].map(([k, av, bv]) => (
                <tr key={k} className="border-t border-white/5">
                  <td className="px-3 py-2 text-white/80">{k}</td>
                  <td className="px-3 py-2 text-center tabular font-bold">{av}</td>
                  <td className="px-3 py-2 text-center tabular font-bold">{bv}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-slate-500 text-center">داده مقایسه نمایشی است — با api/fotmob/player vs player در فاز بعدی تکمیل می‌شود.</p>
      </main>
    </PageShell>
  );
}

export default function ComparePlayerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0F0B" }}><p className="text-sm text-slate-400">بارگذاری...</p></div>}>
      <ComparePlayerInner />
    </Suspense>
  );
}
