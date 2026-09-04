"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Users, Medal, Search, X } from "lucide-react";

type P = {
  id: number; name: string; fullName: string; teamId: number; team: string; teamName: string;
  pos: number; posFa: string; cost: number; points: number;
  goals: number; assists: number; cs: number; minutes: number;
};
type BoardRow = { rank: number; name: string; points: number; me: boolean };

const POS_TABS = [
  { v: 0, label: "همه" }, { v: 1, label: "دروازه‌بان" }, { v: 2, label: "مدافع" },
  { v: 3, label: "هافبک" }, { v: 4, label: "مهاجم" },
];
const NEED = [0, 2, 5, 5, 3];

export default function FantasyPage() {
  const [q, setQ] = useState("");
  const [pos, setPos] = useState(0);
  const [search, setSearch] = useState<P[]>([]);
  const [team, setTeam] = useState<P[]>([]);
  const [myPoints, setMyPoints] = useState(0);
  const [myValue, setMyValue] = useState(0);
  const [board, setBoard] = useState<BoardRow[]>([]);
  const [authed, setAuthed] = useState(false);
  const [gw, setGw] = useState("");
  const [msg, setMsg] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadAll = useCallback(async () => {
    const res = await fetch("/api/games/fantasy").then((r) => r.json()).catch(() => null);
    if (res?.success) {
      setAuthed(!!res.authed);
      setBoard(res.leaderboard ?? []);
      setGw(res.gw ?? "");
      setMyPoints(res.myPoints ?? 0);
      setMyValue(res.myValue ?? 0);
      if (Array.isArray(res.mineIds)) {
        // تیم ذخیره‌شده را با جزئیات کامل برگردان
      }
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2) { setSearch([]); return; }
    timer.current = setTimeout(async () => {
      const res = await fetch(`/api/games/fantasy?q=${encodeURIComponent(q.trim())}&pos=${pos}`).then((r) => r.json()).catch(() => null);
      if (res?.success) setSearch(res.search ?? []);
    }, 300);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [q, pos]);

  // بارگذاری تیم ذخیره‌شده با جزئیات
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/games/fantasy?mine=1").then((r) => r.json()).catch(() => null);
      if (res?.success && Array.isArray(res.myTeam) && res.myTeam.length) {
        setTeam(res.myTeam);
      }
    })();
  }, []);

  const cost = team.reduce((s, p) => s + p.cost, 0);
  const counts = [0, 0, 0, 0, 0];
  for (const p of team) counts[p.pos]++;
  const perClub: Record<string, number> = {};
  for (const p of team) perClub[p.team] = (perClub[p.team] ?? 0) + 1;
  const valid = team.length === 15 && counts[1] === 2 && counts[2] === 5 && counts[3] === 5 && counts[4] === 3
    && cost <= 100 && !Object.values(perClub).some((c) => c > 3);

  function toggle(p: P) {
    if (team.some((t) => t.id === p.id)) setTeam(team.filter((t) => t.id !== p.id));
    else if (team.length < 15) setTeam([...team, p]);
  }

  async function save() {
    setMsg("");
    const res = await fetch("/api/games/fantasy", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerIds: team.map((t) => t.id) }),
    }).then((r) => r.json()).catch(() => null);
    if (!res?.success) { setMsg(res?.needLogin ? "برای ذخیره وارد شوید" : (res?.error ?? "خطا")); return; }
    setMsg("✓ تیم ذخیره شد!");
    loadAll();
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: "#252525" }}>
      <div className="max-w-[900px] mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #005cfc, #bee503)" }}>
            <Users size={20} />
          </div>
          <div>
            <h1 className="headline text-[22px] text-white">فانتزی لیگ برتر</h1>
            <p className="text-[12px] text-slate-400">۱۵ بازیکن • سقف £100m • امتیاز واقعی FPL {gw && `• ${gw}`}</p>
          </div>
          <Link href="/games" className="mr-auto text-xs text-slate-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-full">همه بازی‌ها</Link>
        </div>

        {!authed && (
          <Link href="/login" className="block rounded-2xl border border-white/10 p-3 mb-4 text-center text-xs text-slate-300 hover:border-[#005cfc]/40" style={{ background: "rgba(0,92,252,0.08)" }}>
            برای ذخیره تیم و حضور در جدول <b style={{ color: "#005cfc" }}>وارد شوید ←</b>
          </Link>
        )}

        {/* نوار بودجه */}
        <div className="rounded-2xl border border-white/10 p-4 mb-4" style={{ background: "#2a2a2a" }}>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400">بازیکن: <b className="tabular text-white">{team.length}/15</b></span>
            <span className="text-slate-400">بودجه: <b className="tabular" style={{ color: cost > 100 ? "#E8385D" : "#bee503" }}>£{cost.toFixed(1)}m / £100m</b></span>
            <span className="text-slate-400">امتیاز تیم: <b className="tabular" style={{ color: "#005cfc" }}>{myPoints}</b></span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-3">
            {[1, 2, 3, 4].map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-full border" style={{ borderColor: counts[t] === NEED[t] ? "#bee503" : "rgba(255,255,255,0.1)", color: counts[t] === NEED[t] ? "#bee503" : "#64748b" }}>
                {["", "دروازه‌بان", "مدافع", "هافبک", "مهاجم"][t]} {counts[t]}/{NEED[t]}
              </span>
            ))}
          </div>
          {/* تیم انتخابی */}
          {team.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {team.map((p) => (
                <button key={p.id} onClick={() => toggle(p)} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200 hover:border-[#E8385D]">
                  {p.name} <X size={11} className="text-slate-500" />
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2">
            <button onClick={save} disabled={!valid} className="px-5 py-2 rounded-full text-xs font-black text-white disabled:opacity-40" style={{ background: "#005cfc" }}>
              ذخیره تیم
            </button>
            {msg && <span className="text-[11px]" style={{ color: msg.startsWith("✓") ? "#bee503" : "#E8385D" }}>{msg}</span>}
          </div>
        </div>

        {/* جست‌وجو */}
        <div className="relative mb-2">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جست‌وجوی بازیکن (حداقل ۲ حرف)..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pr-9 px-3 text-sm placeholder-slate-500 focus:outline-none focus:border-[#005cfc] text-white" />
        </div>
        <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
          {POS_TABS.map((t) => (
            <button key={t.v} onClick={() => setPos(t.v)}
              className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold border transition-all ${pos === t.v ? "text-white" : "text-slate-400 border-white/10"}`}
              style={pos === t.v ? { background: "#005cfc", borderColor: "transparent" } : { background: "rgba(255,255,255,0.05)" }}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="space-y-1.5 mb-6 max-h-[380px] overflow-y-auto pl-1">
          {search.map((p) => {
            const inTeam = team.some((t) => t.id === p.id);
            return (
              <button key={p.id} onClick={() => toggle(p)} disabled={!inTeam && team.length >= 15}
                className="w-full flex items-center gap-3 rounded-xl border p-2.5 text-right transition-colors disabled:opacity-40"
                style={{ background: inTeam ? "rgba(0,92,252,0.12)" : "#2a2a2a", borderColor: inTeam ? "#005cfc" : "rgba(255,255,255,0.08)" }}>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-bold text-white truncate" dir="ltr" style={{ textAlign: "left" }}>{p.name}</span>
                  <span className="block text-[10px] text-slate-500">{p.team} • {p.posFa} • ⚽{p.goals} 🅰{p.assists}</span>
                </span>
                <span className="text-[11px] tabular text-slate-300 shrink-0">£{p.cost.toFixed(1)}m</span>
                <span className="tabular font-black text-sm shrink-0 w-10" style={{ color: "#bee503" }}>{p.points}</span>
              </button>
            );
          })}
          {q.trim().length >= 2 && search.length === 0 && (
            <div className="text-xs text-slate-500 text-center py-4">بازیکنی پیدا نشد.</div>
          )}
        </div>

        {/* لیدربورد */}
        <h2 className="headline text-[15px] text-white mb-2 flex items-center gap-2"><Medal size={15} style={{ color: "#bee503" }} /> جدول فانتزی‌بازها</h2>
        {board.length === 0 ? (
          <div className="rounded-2xl border border-white/10 p-6 text-center text-xs text-slate-500">هنوز تیمی ثبت نشده — اولین نفر باش!</div>
        ) : (
          <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: "#2a2a2a" }}>
            {board.map((b) => (
              <div key={b.rank} className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 last:border-0" style={b.me ? { background: "rgba(0,92,252,0.1)" } : undefined}>
                <span className="tabular font-black text-sm w-6 text-center" style={{ color: b.rank <= 3 ? "#bee503" : "#64748b" }}>{b.rank}</span>
                <span className="text-[13px] font-bold text-white truncate flex-1">{b.name}{b.me ? " (شما)" : ""}</span>
                <span className="tabular font-black text-sm" style={{ color: "#bee503" }}>{b.points}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
