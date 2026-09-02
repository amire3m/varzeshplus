"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlayerAvatar } from "@/components/football/PlayerAvatar";

type Profile = {
  user: { displayName: string | null; phoneMasked: string; points: number; coins: number; xp: number; level: number };
  history: Array<{ gameId: number; gameTitle: string; gameType: string; score: number; at: string }>;
  badges: Array<{ code: string; title: string; description: string | null; color: string; awardedAt: string }>;
  lockedBadges: Array<{ code: string; title: string; description: string | null; color: string }>;
};
type ManagerSave = { id: number; teamName: string; season: number; week: number; points: number; budget: number };

export default function ProfilePage() {
  const [data, setData] = useState<Profile | null>(null);
  const [saves, setSaves] = useState<ManagerSave[]>([]);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    fetch("/api/me").then((r) => {
      if (r.status === 401) setDenied(true);
      return r.json();
    }).then((d) => { if (d?.success) setData(d); });
    fetch("/api/manager/saves").then((r) => r.json()).then((d) => { if (d?.success) setSaves(d.saves ?? []); }).catch(() => {});
  }, []);

  if (denied) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#252525" }}>
        <div className="panel p-8 text-center max-w-sm">
          <p className="mb-4">برای مشاهده پروفایل وارد شوید.</p>
          <Link href="/login" className="btn-green inline-block px-5 py-2.5 text-sm">ورود</Link>
        </div>
      </div>
    );
  }
  if (!data) return <div className="min-h-screen flex items-center justify-center" style={{ background: "#252525", color: "var(--color-muted)" }}>...</div>;

  const { user, history, badges, lockedBadges } = data;
  const xpInLevel = user.xp % 1000;
  const best = Math.max(0, ...history.map((h) => h.score));

  return (
    <div className="min-h-screen pb-24" style={{ background: "#252525" }}>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* کارت هویت */}
        <section className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: "linear-gradient(160deg, rgba(0,92,252,0.15), #2a2a2a 60%)", borderColor: "rgba(0,92,252,0.25)" }}>
          <div className="p-5 flex items-center gap-4">
            <PlayerAvatar name={user.displayName || "کاربر"} size={72} color="#005cfc" round />
            <div className="min-w-0 flex-1">
              <h1 className="headline text-lg text-white">{user.displayName}</h1>
              <p className="text-sm tabular text-slate-400">{user.phoneMasked}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-black text-white" style={{ background: "linear-gradient(135deg,#005cfc,#bee503)" }}>سطح {user.level}</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden max-w-[140px]" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div className="h-full rounded-full" style={{ width: `${xpInLevel / 10}%`, background: "linear-gradient(90deg, #005cfc, #bee503)" }} />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 border-t border-white/5 text-center" style={{ background: "rgba(0,0,0,0.25)" }}>
            {[
              { label: "امتیاز", value: user.points, color: "#005cfc" },
              { label: "سکه", value: user.coins, color: "#bee503" },
              { label: "بازی", value: history.length, color: "#8FA1B5" },
              { label: "رکورد", value: Math.round(best), color: "#8FA1B5" },
            ].map((s) => (
              <div key={s.label} className="py-3">
                <div className="headline text-lg tabular" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ذخیره‌های منیجر */}
        {saves.length > 0 && (
          <section className="rounded-2xl border border-white/10 p-4" style={{ background: "#2a2a2a" }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="headline text-sm text-white">حرفه منیگری</h3>
              <Link href="/games/manager" className="text-[11px] font-bold" style={{ color: "#005cfc" }}>مدیریت ←</Link>
            </div>
            <div className="space-y-1.5">
              {saves.slice(0, 3).map((s) => (
                <Link key={s.id} href={`/games/manager/${s.id}`} className="flex items-center gap-3 p-2.5 rounded-xl border border-white/5 hover:border-[#005cfc]/30 transition-colors" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white shrink-0" style={{ background: "linear-gradient(135deg,#005cfc,#bee503)" }}>FM</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{s.teamName}</p>
                    <p className="text-[10px] text-slate-500">فصل {s.season} • هفته {s.week}</p>
                  </div>
                  <span className="text-[11px] font-black tabular" style={{ color: "#bee503" }}>{s.points} امتیاز</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* نشان‌ها */}
        <section className="rounded-2xl border border-white/10 p-4" style={{ background: "#2a2a2a" }}>
          <h3 className="headline text-sm text-white mb-3">نشان‌ها</h3>
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <span key={b.code} className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: `${b.color}22`, color: b.color, border: `1px solid ${b.color}55` }} title={b.description ?? ""}>
                ★ {b.title}
              </span>
            ))}
            {lockedBadges.map((b) => (
              <span key={b.code} className="text-xs px-3 py-1.5 rounded-full line-through" style={{ color: "var(--color-muted)", border: "1px dashed rgba(255,255,255,0.15)" }} title={b.description ?? ""}>
                {b.title}
              </span>
            ))}
            {!badges.length && !lockedBadges.length && <span className="text-sm" style={{ color: "var(--color-muted)" }}>هنوز نشان‌ای ندارید.</span>}
          </div>
        </section>

        {/* تاریخچه */}
        <section className="rounded-2xl border border-white/10 p-4" style={{ background: "#2a2a2a" }}>
          <h3 className="headline text-sm text-white mb-3">تاریخچه بازی‌ها</h3>
          <div className="space-y-1.5">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm" style={{ background: "rgba(255,255,255,0.03)" }}>
                <Link href={`/games/${h.gameId}`} className="hover:underline truncate">{h.gameTitle}</Link>
                <span className="tabular font-bold" style={{ color: "var(--color-club-green)" }}>+{Math.round(h.score)}</span>
              </div>
            ))}
            {!history.length && <p className="text-sm" style={{ color: "var(--color-muted)" }}>هنوز در بازی‌ای شرکت نکرده‌اید.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
