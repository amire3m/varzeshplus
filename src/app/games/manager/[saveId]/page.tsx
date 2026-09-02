"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const POS_LABEL: Record<string, string> = { GK: "دروازه‌بان", DF: "مدافع", MF: "هافبک", FW: "مهاجم" };

export default function ManagerDashboard() {
  const { saveId } = useParams<{ saveId: string }>();
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState<"squad" | "matches" | "inbox">("squad");
  const [simResult, setSimResult] = useState<any>(null);

  async function load() {
    const res = await fetch(`/api/manager/saves/${saveId}`).then((r) => r.json()).catch(() => null);
    if (res?.success) setData(res);
  }
  useEffect(() => { load(); }, [saveId]);

  async function action(act: string, extra: any = {}) {
    const res = await fetch(`/api/manager/saves/${saveId}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: act, ...extra }) }).then((r) => r.json());
    if (!res?.success) alert(res?.error || "خطا");
    else {
      if (act === "simulate" && res.result) setSimResult(res.result);
      load();
    }
  }

  if (!data) return <div className="min-h-screen flex items-center justify-center" style={{ background: "#252525", color: "#8FA1B5" }}>بارگذاری...</div>;
  const { save, players, inbox, matches, nextMatch } = data;
  const starters = players.filter((p: any) => p.isStarter);

  return (
    <div className="min-h-screen pb-28" style={{ background: "#252525" }}>
      <div className="max-w-[1320px] mx-auto px-4 pt-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/games/manager" className="text-xs text-slate-400 hover:text-white">← ذخیره‌ها</Link>
          <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 text-white" style={{ background: "#005cfc" }}>{save.teamName}</span>
          <span className="text-xs text-slate-400">هفته {save.week} • فصل {save.season} • {save.points} امتیاز</span>
          <span className="mr-auto text-xs px-2 py-1 rounded-full" style={{ background: "rgba(190,229,3,0.15)", color: "#bee503" }}>{save.budget.toLocaleString("fa-IR")} بودجه</span>
        </div>

        {/* کارت بعدی */}
        {nextMatch && (
          <div className="rounded-2xl border border-white/10 p-4 mb-4 flex items-center justify-between" style={{ background: "linear-gradient(135deg, rgba(0,92,252,0.12), rgba(190,229,3,0.08))" }}>
            <div>
              <div className="text-xs text-slate-400">بازی بعدی — هفته {nextMatch.week}</div>
              <div className="headline text-sm text-white mt-1">{nextMatch.homeTeam} — {nextMatch.awayTeam}</div>
              <div className="text-xs text-slate-500">{starters.length}/11 فیکس • میانگین {Math.round(starters.reduce((s: number, p: any) => s + p.rating, 0) / Math.max(1, starters.length))}</div>
            </div>
            <button onClick={() => action("simulate")} className="px-6 py-2.5 rounded-full text-sm font-black text-white" style={{ background: "linear-gradient(135deg, #005cfc, #bee503)" }}>شبیه‌سازی →</button>
          </div>
        )}
        {simResult && (
          <div className="rounded-2xl border border-white/10 p-4 mb-4" style={{ background: "#2a2a2a" }}>
            <div className="headline text-sm text-white">{simResult.result === "win" ? "پیروزی!" : simResult.result === "loss" ? "شکست" : "تساوی"} — {simResult.oppName} {simResult.homeScore !== undefined ? `${simResult.homeScore}-${simResult.awayScore}` : ""}</div>
            <div className="text-xs text-slate-400 mt-2 space-y-1">{simResult.events.map((e: string, i: number) => <div key={i}>• {e}</div>)}</div>
            <button onClick={() => setSimResult(null)} className="mt-3 text-xs text-slate-400 border border-white/10 px-3 py-1 rounded-full">بستن</button>
          </div>
        )}

        <div className="flex gap-2 mb-4">
          {[
            { k: "squad", l: "ترکیب" },
            { k: "matches", l: "برنامه" },
            { k: "inbox", l: `صندوق (${inbox.filter((x: any) => !x.isRead).length})` },
          ].map((t) => (
            <button key={t.k} onClick={() => setTab(t.k as any)} className={`px-4 py-1.5 rounded-full text-xs font-bold border ${tab === t.k ? "text-white" : "text-slate-400 border-white/10"}`} style={tab === t.k ? { background: "#005cfc", borderColor: "transparent" } : { background: "rgba(255,255,255,0.05)" }}>{t.l}</button>
          ))}
          {tab === "inbox" && <button onClick={() => action("markRead")} className="mr-auto text-xs text-slate-400 border border-white/10 px-3 py-1 rounded-full">خوانده شد</button>}
        </div>

        {tab === "squad" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{starters.length}/11 فیکس — میانگین {starters.length ? Math.round(starters.reduce((s: number, p: any) => s + p.rating, 0) / starters.length) : 0}</span>
              <span className="text-[11px] text-slate-500">تمرین هر بازیکن ۵۰,۰۰۰ • کلیک برای فیکس/نیمکت</span>
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              {players.map((p: any) => (
                <div key={p.id} className={`rounded-xl border p-3 flex items-center gap-3 ${p.isStarter ? "border-[#005cfc]/30" : "border-white/10"}`} style={{ background: p.isStarter ? "rgba(0,92,252,0.08)" : "#2a2a2a" }}>
                  <button onClick={() => action("toggleStarter", { playerId: p.id })} className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${p.isStarter ? "text-white" : "text-slate-400 border border-white/10"}`} style={p.isStarter ? { background: "#005cfc" } : { background: "rgba(255,255,255,0.05)" }}>{POS_LABEL[p.position]?.[0] || p.position[0]}</button>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate">{p.name} <span className="font-normal text-slate-500">— {POS_LABEL[p.position]} • {p.age} سال</span></div>
                    <div className="text-[11px] text-slate-400">ریت {p.rating} • ارزش {p.value.toLocaleString("fa-IR")} • دستمزد {p.salary.toLocaleString("fa-IR")}</div>
                  </div>
                  <button onClick={() => action("train", { playerId: p.id })} className="text-[10px] px-2 py-1 rounded-full border border-white/10 text-slate-300 hover:bg-white/5">تمرین +1</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "matches" && (
          <div className="space-y-2">
            {matches.map((m: any) => (
              <div key={m.id} className={`rounded-xl border p-3 flex items-center justify-between ${m.status === "upcoming" ? "border-white/10" : "border-[#bee503]/20"}`} style={{ background: m.status === "upcoming" ? "#2a2a2a" : "rgba(190,229,3,0.06)" }}>
                <span className="text-xs text-slate-500">هـ {m.week}</span>
                <span className="text-xs font-bold text-white">{m.homeTeam} — {m.awayTeam}</span>
                <span className="text-xs font-black tabular" style={{ color: m.status === "upcoming" ? "#8FA1B5" : "#bee503" }}>{m.status === "upcoming" ? "—" : `${m.homeScore} : ${m.awayScore}`}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "inbox" && (
          <div className="space-y-2">
            {inbox.length === 0 ? <p className="text-xs text-slate-500 text-center py-6">صندوق خالی</p> : inbox.map((msg: any) => (
              <div key={msg.id} className={`rounded-xl border p-3 ${msg.isRead ? "border-white/5 opacity-70" : "border-white/10"}`} style={{ background: msg.isRead ? "rgba(255,255,255,0.03)" : "#2a2a2a" }}>
                <div className="text-xs font-bold text-white">{msg.title} <span className="font-normal text-slate-500">— {msg.category}</span></div>
                <div className="text-xs text-slate-400 mt-1 whitespace-pre-wrap leading-5">{msg.body}</div>
                <div className="text-[10px] text-slate-500 mt-1">{new Date(msg.createdAt).toLocaleString("fa-IR")}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
