"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { LEAGUES, TEAMS } from "@/lib/football/leagues";
import { toggleFavorite, getFavorites } from "@/lib/favorites";

const STEPS = ["لیگ‌ها", "تیم‌ها", "بازیکنان"] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pickedLeagues, setPickedLeagues] = useState<string[]>(() => getFavorites("league"));
  const [pickedTeams, setPickedTeams] = useState<string[]>(() => getFavorites("team"));

  const toggleLeague = (slug: string) => {
    setPickedLeagues((prev) => (prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug]));
  };
  const toggleTeam = (slug: string) => {
    setPickedTeams((prev) => (prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug]));
  };

  const next = () => {
    if (step === 0) {
      // ذخیره لیگ‌ها
      pickedLeagues.forEach((s) => { if (!getFavorites("league").includes(s)) toggleFavorite("league", s); });
      setStep(1);
    } else if (step === 1) {
      pickedTeams.forEach((s) => { if (!getFavorites("team").includes(s)) toggleFavorite("team", s); });
      setStep(2);
    } else {
      router.push("/");
    }
  };

  const skip = () => router.push("/");

  return (
    <PageShell badge="شروع" activeDock="home">
      <main className="max-w-[700px] mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="headline text-2xl text-white">خوش آمدی — شخصی‌سازی</h1>
          <button onClick={skip} className="text-xs text-slate-400 hover:text-white">رد کردن</button>
        </div>

        <div className="flex gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? "bg-[#4AE183]" : "bg-white/10"}`} />
          ))}
        </div>
        <p className="text-xs text-slate-400">مرحله {step + 1} از 3 — {STEPS[step]}</p>

        {step === 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {LEAGUES.slice(0, 9).map((l) => {
              const active = pickedLeagues.includes(l.slug);
              return (
                <button
                  key={l.id}
                  onClick={() => toggleLeague(l.slug)}
                  className={`relative rounded-2xl border p-4 flex flex-col items-center gap-2 text-center transition-all ${active ? "border-[#4AE183] bg-[#4AE183]/10" : "border-white/10 bg-white/[0.03] hover:bg-white/5"}`}
                >
                  <img src={l.logo} alt={l.name} className="w-10 h-10 object-contain" loading="lazy" />
                  <span className={`text-xs font-bold ${active ? "text-[#4AE183]" : "text-white"}`}>{l.name}</span>
                  {active && <span className="absolute top-2 left-2 w-5 h-5 rounded-full bg-[#4AE183] flex items-center justify-center"><Check size={12} className="text-[#0A0F0B]" /></span>}
                </button>
              );
            })}
          </div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(pickedLeagues.length ? TEAMS.filter((t) => LEAGUES.find((l) => l.slug === pickedLeagues[0])?.id === t.leagueId).slice(0, 9) : TEAMS.slice(0, 9)).map((t) => {
              const active = pickedTeams.includes(t.slug);
              return (
                <button
                  key={t.id}
                  onClick={() => toggleTeam(t.slug)}
                  className={`relative rounded-2xl border p-4 flex flex-col items-center gap-2 text-center transition-all ${active ? "border-[#4AE183] bg-[#4AE183]/10" : "border-white/10 bg-white/[0.03] hover:bg-white/5"}`}
                >
                  <img src={t.logo} alt={t.name} className="w-10 h-10 object-contain" loading="lazy" />
                  <span className={`text-xs font-bold truncate w-full ${active ? "text-[#4AE183]" : "text-white"}`}>{t.name}</span>
                  {active && <span className="absolute top-2 left-2 w-5 h-5 rounded-full bg-[#4AE183] flex items-center justify-center"><Check size={12} className="text-[#0A0F0B]" /></span>}
                </button>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <div className="rounded-2xl border border-white/10 p-8 text-center" style={{ background: "#101610" }}>
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-2xl" style={{ background: "linear-gradient(135deg, #4AE183, #FFD34D)" }}>✓</div>
            <h3 className="headline text-lg text-white mt-4">آماده‌ای!</h3>
            <p className="text-sm text-slate-400 mt-2">علاقه‌مندی‌هایت ذخیره شد — اخبار و نتایج مرتبط برایت شخصی‌سازی می‌شود.</p>
            <p className="text-[11px] text-slate-500 mt-3">ذخیره در localStorage (favorites) — بعداً در پروفایل قابل ویرایش است.</p>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={next} className="flex-1 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2" style={{ background: "#4AE183", color: "#0A0F0B" }}>
            {step === 2 ? "شروع" : "بعدی"} <ChevronLeft size={16} />
          </button>
          {step > 0 && <button onClick={() => setStep((s) => s - 1)} className="px-6 py-3 rounded-xl border border-white/10 text-sm font-bold text-slate-300 hover:text-white">قبلی</button>}
        </div>
      </main>
    </PageShell>
  );
}
