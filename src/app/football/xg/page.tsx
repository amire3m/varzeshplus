"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity } from "lucide-react";

type Shot = { minute: number; team: string; player: string; x: number; y: number; outcome: string; xg: number };
type TPoint = { minute: number; home: number; away: number };
type Data = {
  meta: { home: string; away: string; hs: number; as: number; comp: string; date: string; matchId: string };
  totals: { homeXg: number; awayXg: number; homeShots: number; awayShots: number };
  shots: Shot[]; timeline: TPoint[];
  teams: Array<{ name: string; formation: string; starters: Array<{ name: string; number: number; position: string }> }>;
};

const MATCHES = [
  { id: "3869685", label: "فینال جام جهانی ۲۰۲۲" },
  { id: "3943043", label: "فینال یورو ۲۰۲۴" },
];

function Pitch({ shots, homeTeam, homeColor = "#005cfc", awayColor = "#E8385D" }: { shots: Shot[]; homeTeam: string; homeColor?: string; awayColor?: string }) {
  const W = 640, H = 427; // 120x80
  const X = (x: number) => (x / 120) * W;
  const Y = (y: number) => (y / 80) * H;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl border border-white/10" style={{ background: "#1d5c33" }}>
      <rect x="4" y="4" width={W - 8} height={H - 8} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
      <line x1={W / 2} y1="4" x2={W / 2} y2={H - 4} stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
      <circle cx={W / 2} cy={H / 2} r="45" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
      <rect x={W - 4 - W * 0.14} y={H * 0.28} width={W * 0.14} height={H * 0.44} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
      <rect x="4" y={H * 0.28} width={W * 0.14} height={H * 0.44} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
      {shots.map((s, i) => {
        const home = s.team === homeTeam;
        const goal = s.outcome === "Goal";
        const r = 3 + Math.min(9, s.xg * 22);
        return (
          <g key={i}>
            <circle cx={X(s.x)} cy={Y(s.y)} r={r} fill={goal ? "#bee503" : home ? homeColor : awayColor} opacity={goal ? 1 : 0.65} stroke="#fff" strokeWidth={goal ? 1.5 : 0.5}>
              <title>{`${s.player} — دقیقه ${s.minute} — xG ${s.xg} — ${s.outcome}`}</title>
            </circle>
          </g>
        );
      })}
    </svg>
  );
}

function XgChart({ timeline, homeColor = "#005cfc", awayColor = "#E8385D" }: { timeline: TPoint[]; homeColor?: string; awayColor?: string }) {
  const W = 640, H = 200, P = 28;
  const maxMin = Math.max(90, ...timeline.map((t) => t.minute));
  const maxXg = Math.max(0.5, ...timeline.map((t) => Math.max(t.home, t.away)));
  const X = (m: number) => P + (m / (maxMin + 5)) * (W - P * 2);
  const Y = (v: number) => H - P - (v / (maxXg * 1.1)) * (H - P * 2);
  const line = (key: "home" | "away") => timeline.map((t, i) => `${i === 0 ? "M" : "L"}${X(t.minute).toFixed(1)},${Y(t[key]).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl border border-white/10" style={{ background: "#2a2a2a" }}>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <g key={f}>
          <line x1={P} y1={Y(maxXg * 1.1 * f)} x2={W - P} y2={Y(maxXg * 1.1 * f)} stroke="rgba(255,255,255,0.07)" />
          <text x={W - P + 4} y={Y(maxXg * 1.1 * f) + 3} fontSize="9" fill="#64748b">{(maxXg * 1.1 * f).toFixed(1)}</text>
        </g>
      ))}
      <path d={line("away")} fill="none" stroke={awayColor} strokeWidth="2" opacity="0.9" />
      <path d={line("home")} fill="none" stroke={homeColor} strokeWidth="2.5" />
      {[45, 90].map((m) => (
        <text key={m} x={X(m)} y={H - 8} fontSize="9" fill="#64748b" textAnchor="middle">{m}′</text>
      ))}
    </svg>
  );
}

export default function XgPage() {
  const [mid, setMid] = useState("3869685");
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/football/xg?match=${mid}`)
      .then((r) => r.json())
      .then((res) => { if (res?.success) setData(res); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [mid]);

  return (
    <div className="min-h-screen pb-28" style={{ background: "#252525" }}>
      <div className="max-w-[900px] mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #005cfc, #bee503)" }}>
            <Activity size={20} />
          </div>
          <div>
            <h1 className="headline text-[22px] text-white">آنالیز xG</h1>
            <p className="text-[12px] text-slate-400">نقشه شوت و گل موردانتظار — دیتای واقعی StatsBomb</p>
          </div>
          <Link href="/" className="mr-auto text-xs text-slate-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-full">خانه</Link>
        </div>

        <div className="flex items-center gap-2 mb-4">
          {MATCHES.map((m) => (
            <button key={m.id} onClick={() => setMid(m.id)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-bold border transition-all ${mid === m.id ? "text-white" : "text-slate-400 border-white/10 hover:text-white"}`}
              style={mid === m.id ? { background: "linear-gradient(135deg, #005cfc, #bee503)", borderColor: "transparent" } : { background: "rgba(255,255,255,0.05)" }}>
              {m.label}
            </button>
          ))}
        </div>

        {loading || !data ? (
          <div className="space-y-4">
            <div className="h-10 w-48 rounded-full bg-white/10 animate-pulse" />
            <div className="rounded-2xl border border-white/10 h-[280px] animate-pulse" style={{ background: "#2a2a2a" }} />
            <div className="h-24 rounded-xl bg-white/10 animate-pulse" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 p-4 text-center" style={{ background: "#2a2a2a" }}>
              <div className="text-[11px] text-slate-500 mb-1">{data.meta.comp}</div>
              <div className="headline text-xl text-white">{data.meta.home} <b className="tabular">{data.meta.hs} - {data.meta.as}</b> {data.meta.away}</div>
              <div className="flex items-center justify-center gap-4 mt-2 text-[12px]">
                <span style={{ color: "#005cfc" }}>xG {data.totals.homeXg} <span className="text-slate-500">({data.totals.homeShots} شوت)</span></span>
                <span style={{ color: "#E8385D" }}>xG {data.totals.awayXg} <span className="text-slate-500">({data.totals.awayShots} شوت)</span></span>
              </div>
            </div>

            <div>
              <h3 className="headline text-sm text-white mb-2">نقشه شوت‌ها (سبز = گل)</h3>
              <Pitch shots={data.shots} homeTeam={data.teams[0]?.name ?? ""} />
            </div>

            <div>
              <h3 className="headline text-sm text-white mb-2">روند xG در طول بازی</h3>
              <XgChart timeline={data.timeline} />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {data.teams.map((t, i) => (
                <div key={i} className="rounded-2xl border border-white/10 p-4" style={{ background: "#2a2a2a" }}>
                  <h4 className="headline text-sm text-white mb-1">{t.name}</h4>
                  <p className="text-[10px] text-slate-500 mb-2 tabular">{t.formation}</p>
                  <div className="space-y-1 max-h-[220px] overflow-y-auto pl-1">
                    {t.starters.map((p, j) => (
                      <div key={j} className="flex items-center gap-2 text-[11px]">
                        <span className="tabular text-slate-500 w-5">{p.number}</span>
                        <span className="text-slate-200 font-bold truncate">{p.name}</span>
                        <span className="mr-auto text-slate-600 shrink-0">{p.position}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-[10px] text-slate-600">منبع: StatsBomb Open Data • مختصات شوت واقعی با xG هر ضربه</p>
          </div>
        )}
      </div>
    </div>
  );
}
