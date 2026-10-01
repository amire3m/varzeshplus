"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { TeamBadge } from "@/components/football/TeamBadge";
import { LEAGUES, TEAMS } from "@/lib/football/leagues";

function CompareTeamInner() {
  const sp = useSearchParams();
  const slugs = (sp.get("slugs") ?? "").split(",").filter(Boolean).slice(0, 2);
  const aSlug = slugs[0] ?? "arsenal";
  const bSlug = slugs[1] ?? "man-city";
  const a = TEAMS.find((t) => t.slug === aSlug);
  const b = TEAMS.find((t) => t.slug === bSlug);

  return (
    <PageShell badge="مقایسه تیم" activeDock="home">
      <main className="max-w-[900px] mx-auto px-4 py-6 space-y-4">
        <h1 className="headline text-xl text-white">مقایسه تیم — Team vs Team</h1>
        <p className="text-xs text-slate-400">پارامتر: <span className="tabular" dir="ltr">?slugs={aSlug},{bSlug}</span> — مثال <span className="text-[#4AE183]">feature.team.ui.teamvsteam.TeamVsTeamActivity</span></p>

        <div className="grid md:grid-cols-2 gap-4">
          {[a, b].map((t, i) => (
            t ? (
              <Link key={t.slug} href={`/football/teams/${t.slug}`} className="rounded-xl border border-white/10 p-4 flex items-center gap-3 hover:bg-white/[0.03]" style={{ background: "#101610" }}>
                <TeamBadge team={t} size={48} />
                <div>
                  <p className="text-sm font-bold text-white">{t.name}</p>
                  <p className="text-xs text-slate-400">{LEAGUES.find((l) => l.id === t.leagueId)?.name}</p>
                </div>
              </Link>
            ) : (
              <div key={i} className="rounded-xl border border-white/10 p-4 text-sm text-slate-500" style={{ background: "#101610" }}>تیم یافت نشد: {i === 0 ? aSlug : bSlug}</div>
            )
          ))}
        </div>

        <div className="rounded-xl border border-white/10 overflow-hidden" style={{ background: "#101610" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.03] text-slate-400">
                <th className="px-3 py-2 text-right">شاخص</th>
                <th className="px-3 py-2 text-center">A</th>
                <th className="px-3 py-2 text-center">B</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["امتیاز", "68", "65"], ["گل زده", "54", "49"], ["کلین‌شیت", "12", "9"], ["میانگین مالکیت", "58%", "54%"],
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

        <p className="text-[11px] text-slate-500 text-center">H2H واقعی از /api/football/leagues در فاز بعدی تکمیل می‌شود.</p>
      </main>
    </PageShell>
  );
}

export default function CompareTeamPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0F0B" }}><p className="text-sm text-slate-400">بارگذاری...</p></div>}>
      <CompareTeamInner />
    </Suspense>
  );
}
