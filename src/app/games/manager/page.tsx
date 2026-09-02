"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LEAGUES, TEAMS } from "@/lib/football/leagues";

export default function ManagerPickerPage() {
  const router = useRouter();
  const [saves, setSaves] = useState<any[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<string>(LEAGUES[0].slug);
  const [selectedTeam, setSelectedTeam] = useState<string>("");

  async function load() {
    const res = await fetch("/api/manager/saves").then((r) => r.json()).catch(() => null);
    if (res?.success) setSaves(res.saves);
  }
  useEffect(() => { load(); }, []);

  const leagueTeams = TEAMS.filter((t) => {
    const l = LEAGUES.find((x) => x.slug === selectedLeague);
    return l ? t.leagueId === l.id : false;
  });

  async function createSave() {
    if (!selectedTeam) return alert("تیم را انتخاب کنید");
    const res = await fetch("/api/manager/saves", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teamSlug: selectedTeam }) }).then((r) => r.json());
    if (res?.success) router.push(`/games/manager/${res.save.id}`);
    else alert(res?.error || "خطا — وارد شوید");
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: "#252525" }}>
      <div className="max-w-[1320px] mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #005cfc, #bee503)" }}>FM</div>
          <div>
            <h1 className="headline text-xl text-white">فوتبالیست منیجر — بومی OFM</h1>
            <p className="text-xs text-slate-400">تیم بردار، ترکیب بچین، فصل را شبیه‌سازی کن — کاملاً فارسی</p>
          </div>
          <Link href="/games" className="mr-auto text-xs text-slate-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-full">← مینی‌گیم‌ها</Link>
        </div>

        {saves.length > 0 && (
          <div className="mb-6">
            <h2 className="headline text-sm text-white mb-2">ذخیره‌های شما</h2>
            <div className="grid md:grid-cols-3 gap-3">
              {saves.map((s) => (
                <Link key={s.id} href={`/games/manager/${s.id}`} className="rounded-2xl border border-white/10 p-4 hover:border-[#005cfc]/30 transition-colors" style={{ background: "#2a2a2a" }}>
                  <div className="headline text-sm text-white">{s.teamName}</div>
                  <div className="text-xs text-slate-400 mt-1">فصل {s.season} • هفته {s.week} • {s.points} امتیاز ({s.wins} برد)</div>
                  <div className="text-xs mt-1" style={{ color: "#bee503" }}>{s.budget.toLocaleString("fa-IR")} بودجه</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-white/10 p-5" style={{ background: "#2a2a2a" }}>
          <h2 className="headline text-sm text-white mb-3">شروع فصل جدید</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400">لیگ</label>
              <select value={selectedLeague} onChange={(e) => { setSelectedLeague(e.target.value); setSelectedTeam(""); }} className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white">
                {LEAGUES.map((l) => (
                  <option key={l.slug} value={l.slug} className="bg-[#252525]">{l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400">تیم ({leagueTeams.length} تیم)</label>
              <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white">
                <option value="" className="bg-[#252525]">— انتخاب کنید —</option>
                {leagueTeams.map((t) => (
                  <option key={t.slug} value={t.slug} className="bg-[#252525]">{t.name} — {t.city}</option>
                ))}
              </select>
            </div>
          </div>
          <button onClick={createSave} disabled={!selectedTeam} className="w-full mt-4 py-2.5 rounded-full text-sm font-black text-white disabled:opacity-40" style={{ background: "linear-gradient(135deg, #005cfc, #bee503)" }}>
            شروع مربیگری
          </button>
          <p className="text-[11px] text-slate-500 mt-2 text-center">۱۸ بازیکن با ریتینگ ۶۶-۸۴، ۱۴ هفته، بودجه ۵M — الهام از OpenFootManager</p>
        </div>
      </div>
    </div>
  );
}
