"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Program = { id: number; title: string; slug: string; description: string | null; onAirDay: string | null; onAirTime: string | null };
type Game = { id: number; title: string; description: string | null; gameType: string; prize: string | null; startsAt: string | null; endsAt: string | null };

function fmt(iso: string | null) {
  if (!iso) return "";
  try { return new Intl.DateTimeFormat("fa-IR", { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)); }
  catch { return ""; }
}

export default function ProgramPage() {
  const { slug } = useParams<{ slug: string }>();
  const [program, setProgram] = useState<Program | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/programs/${slug}`).then((r) => r.json()).catch(() => null);
    if (res?.success) {
      setProgram(res.program);
      setGames(res.games ?? []);
    } else setError(res?.error ?? "خطا در بارگذاری برنامه");
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  if (error && !program) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="panel p-8 text-center">
          <p className="mb-4">{error}</p>
          <Link href="/" className="btn-green inline-block px-5 py-2.5 text-sm">بازگشت به خانه</Link>
        </div>
      </div>
    );
  }
  if (!program) return <div className="min-h-screen flex items-center justify-center" style={{ color: "var(--color-muted)" }}>...</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-white/5" style={{ background: "var(--color-panel-dark)" }}>
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="btn-ghost px-3 py-1.5 text-sm">بازگشت</Link>
          <h1 className="headline truncate">{program.title}</h1>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 space-y-6">
        {/* معرفی برنامه */}
        <section className="panel p-5">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h2 className="headline text-lg">{program.title}</h2>
            {(program.onAirDay || program.onAirTime) && (
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: "rgba(46,204,113,0.12)", color: "var(--color-club-green)" }}>
                پخش: {program.onAirDay ?? ""} {program.onAirTime ?? ""}
              </span>
            )}
          </div>
          {program.description && <p className="text-sm" style={{ color: "var(--color-muted)" }}>{program.description}</p>}
        </section>

        {/* بازی‌های فعال این برنامه — طبق سند: بازی برنامه در صفحه خودش هم نمایش داده می‌شود */}
        <section>
          <h2 className="headline text-base mb-3">بازی‌های فعال این برنامه</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {games.map((g) => (
              <Link key={g.id} href={`/games/${g.id}`} className="game-card panel p-4 block">
                <h3 className="font-medium">{g.title}</h3>
                {g.description && <p className="text-sm mt-1 line-clamp-2" style={{ color: "var(--color-muted)" }}>{g.description}</p>}
                <div className="flex items-center justify-between mt-3 text-xs" style={{ color: "var(--color-muted)" }}>
                  {g.prize && <span style={{ color: "var(--color-gold-medal)" }}>🏆 {g.prize}</span>}
                  {g.endsAt && <span className="tabular">تا {fmt(g.endsAt)}</span>}
                </div>
              </Link>
            ))}
            {!games.length && (
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                فعلاً بازی فعالی برای این برنامه وجود ندارد. بازی‌ها هم‌زمان با پخش برنامه فعال می‌شوند.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
