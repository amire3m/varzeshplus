"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Profile = {
  user: { displayName: string | null; phoneMasked: string; points: number; coins: number; xp: number; level: number };
  history: Array<{ gameId: number; gameTitle: string; gameType: string; score: number; at: string }>;
  badges: Array<{ code: string; title: string; description: string | null; color: string; awardedAt: string }>;
  lockedBadges: Array<{ code: string; title: string; description: string | null; color: string }>;
};

export default function ProfilePage() {
  const [data, setData] = useState<Profile | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    fetch("/api/me").then((r) => {
      if (r.status === 401) setDenied(true);
      return r.json();
    }).then((d) => { if (d?.success) setData(d); });
  }, []);

  if (denied) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="panel p-8 text-center max-w-sm">
          <p className="mb-4">برای مشاهده پروفایل وارد شوید.</p>
          <Link href="/login" className="btn-green inline-block px-5 py-2.5 text-sm">ورود</Link>
        </div>
      </div>
    );
  }
  if (!data) return <div className="min-h-screen flex items-center justify-center" style={{ color: "var(--color-muted)" }}>...</div>;

  const { user, history, badges, lockedBadges } = data;
  const xpInLevel = user.xp % 1000;

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/5" style={{ background: "var(--color-panel-dark)" }}>
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="btn-ghost px-3 py-1.5 text-sm">بازگشت</Link>
          <h1 className="headline">پروفایل من</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* کاربر */}
        <section className="panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="headline text-lg">{user.displayName}</h2>
              <p className="text-sm tabular" style={{ color: "var(--color-muted)" }}>{user.phoneMasked}</p>
            </div>
            <div className="text-center">
              <div className="headline text-2xl">سطح <span className="tabular">{user.level}</span></div>
              <div className="w-32 h-1.5 mt-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="h-full" style={{ width: `${xpInLevel / 10}%`, background: "var(--color-club-green)" }} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="panel py-3"><div className="tabular headline text-lg">{user.points}</div><div style={{ color: "var(--color-muted)" }}>امتیاز</div></div>
            <div className="panel py-3"><div className="tabular headline text-lg">{user.coins}</div><div style={{ color: "var(--color-muted)" }}>سکه</div></div>
            <div className="panel py-3"><div className="tabular headline text-lg">{history.length}</div><div style={{ color: "var(--color-muted)" }}>بازی</div></div>
          </div>
        </section>

        {/* نشان‌ها */}
        <section className="panel p-5">
          <h3 className="headline text-sm mb-3">نشان‌ها</h3>
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
        <section className="panel p-5">
          <h3 className="headline text-sm mb-3">تاریخچه بازی‌ها</h3>
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
      </main>
    </div>
  );
}
