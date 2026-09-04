"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Download, RotateCcw, Save } from "lucide-react";

/**
 * تخته تاکتیک — با الهام از pitchboard (Canvas2D، مختصات نرمال زمین ۱۰۵×۶۸)
 * درگ بازیکن/توپ، presets ترکیب، ذخیره localStorage، خروجی PNG
 */

type Pt = { x: number; y: number }; // 0..1
type Player = { id: string; team: 0 | 1; num: number; pos: Pt };
type Ball = Pt;

const FORMATIONS: Record<string, number[][]> = {
  "4-4-2": [[1], [2, 5, 6, 3], [7, 11, 8, 10], [9, 10]],
  "4-3-3": [[1], [2, 5, 6, 3], [8, 6, 10], [7, 9, 11]],
  "3-5-2": [[1], [4, 5, 6], [2, 8, 6, 10, 3], [9, 10]],
  "4-2-3-1": [[1], [2, 5, 6, 3], [6, 8], [7, 10, 11], [9]],
  "5-3-2": [[1], [2, 5, 6, 4, 3], [7, 8, 11], [9, 10]],
};

const TEAM_COLORS = ["#005cfc", "#E8385D"];

function formationPlayers(formation: string, team: 0 | 1): Player[] {
  const lines = FORMATIONS[formation];
  const out: Player[] = [];
  lines.forEach((nums, li) => {
    const depth = 0.08 + (li / Math.max(1, lines.length - 1)) * 0.34; // نیمه خودی
    const n = nums.length;
    nums.forEach((num, i) => {
      const spread = n === 1 ? 0.5 : 0.5 - 0.33 + (i * 0.66) / (n - 1);
      let x = spread;
      if (team === 1) x = 1 - x;
      out.push({ id: `${team}-${li}-${i}`, team, num, pos: { x, y: team === 0 ? 1 - depth : depth } });
    });
  });
  return out;
}

export default function TacticsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [formation, setFormation] = useState("4-3-3");
  const [players, setPlayers] = useState<Player[]>(() => [...formationPlayers("4-3-3", 0), ...formationPlayers("4-3-3", 1)]);
  const [ball, setBall] = useState<Ball>({ x: 0.5, y: 0.5 });
  const [drag, setDrag] = useState<{ kind: "p" | "b"; id?: string } | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("tactics-board");
      if (raw) {
        const s = JSON.parse(raw);
        if (Array.isArray(s.players) && s.ball) {
          setPlayers(s.players); setBall(s.ball);
          if (s.formation) setFormation(s.formation);
        }
      }
    } catch { /* ignore */ }
  }, []);

  function applyFormation(f: string) {
    setFormation(f);
    setPlayers([...formationPlayers(f, 0), ...formationPlayers(f, 1)]);
    setBall({ x: 0.5, y: 0.5 });
  }

  function draw() {
    const cv = canvasRef.current;
    const wrap = wrapRef.current;
    if (!cv || !wrap) return;
    const W = wrap.clientWidth;
    const H = Math.round((W * 68) / 105);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = `${W}px`; cv.style.height = `${H}px`;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // چمن راه‌راه
    ctx.fillStyle = "#1d5c33";
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 14; i += 2) {
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.fillRect((i / 14) * W, 0, (W / 14), H);
    }
    // خطوط
    ctx.strokeStyle = "rgba(255,255,255,0.75)";
    ctx.lineWidth = 2;
    const X = (v: number) => v * W;
    const Y = (v: number) => v * H;
    ctx.strokeRect(8, 8, W - 16, H - 16);
    ctx.beginPath(); ctx.moveTo(W / 2, 8); ctx.lineTo(W / 2, H - 8); ctx.stroke();
    ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.min(W, H) * 0.11, 0, Math.PI * 2); ctx.stroke();
    // محوطه‌ها
    const boxW = W * 0.14, boxH = H * 0.44, sixW = W * 0.05, sixH = H * 0.24;
    ctx.strokeRect(8, (H - boxH) / 2, boxW, boxH);
    ctx.strokeRect(W - 8 - boxW, (H - boxH) / 2, boxW, boxH);
    ctx.strokeRect(8, (H - sixH) / 2, sixW, sixH);
    ctx.strokeRect(W - 8 - sixW, (H - sixH) / 2, sixW, sixH);

    // توپ
    ctx.beginPath(); ctx.arc(X(ball.x), Y(ball.y), 7, 0, Math.PI * 2);
    ctx.fillStyle = "#fff"; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = "#111"; ctx.stroke();

    // بازیکنان
    for (const p of players) {
      const px = X(p.pos.x), py = Y(p.pos.y);
      ctx.beginPath(); ctx.arc(px, py, 13, 0, Math.PI * 2);
      ctx.fillStyle = TEAM_COLORS[p.team]; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = "#fff"; ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px Tahoma";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(String(p.num), px, py + 0.5);
    }
  }

  useEffect(() => {
    draw();
    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players, ball]);

  function toNorm(e: React.PointerEvent) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: Math.min(0.98, Math.max(0.02, (e.clientX - rect.left) / rect.width)),
      y: Math.min(0.98, Math.max(0.02, (e.clientY - rect.top) / rect.height)),
    };
  }

  function onDown(e: React.PointerEvent) {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width;
    const my = (e.clientY - rect.top) / rect.height;
    // توپ نزدیک‌تر است؟
    const bd = Math.hypot(ball.x - mx, ball.y - my);
    let best: Player | null = null;
    let bestD = 0.045;
    for (const p of players) {
      const d = Math.hypot(p.pos.x - mx, p.pos.y - my);
      if (d < bestD) { bestD = d; best = p; }
    }
    if (bd < 0.035 && (!best || bd <= bestD)) {
      setDrag({ kind: "b" });
    } else if (best) {
      setDrag({ kind: "p", id: best.id });
    }
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  function onMove(e: React.PointerEvent) {
    if (!drag) return;
    const pt = toNorm(e);
    if (drag.kind === "b") setBall(pt);
    else setPlayers((ps) => ps.map((p) => (p.id === drag.id ? { ...p, pos: pt } : p)));
  }

  function save() {
    try {
      localStorage.setItem("tactics-board", JSON.stringify({ players, ball, formation }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* ignore */ }
  }

  function exportPng() {
    const cv = canvasRef.current;
    if (!cv) return;
    const a = document.createElement("a");
    a.download = `tactics-${formation}.png`;
    a.href = cv.toDataURL("image/png");
    a.click();
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: "#252525" }}>
      <div className="max-w-[900px] mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg" style={{ background: "linear-gradient(135deg, #005cfc, #bee503)" }}>♟</div>
          <div>
            <h1 className="headline text-[22px] text-white">تخته تاکتیک</h1>
            <p className="text-[12px] text-slate-400">بازیکنان و توپ را بکش، ترکیب بچین، خروجی PNG بگیر</p>
          </div>
          <Link href="/games" className="mr-auto text-xs text-slate-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-full">همه بازی‌ها</Link>
        </div>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {Object.keys(FORMATIONS).map((f) => (
            <button key={f} onClick={() => applyFormation(f)} dir="ltr"
              className={`px-3 py-1.5 rounded-full text-xs font-black tabular border transition-all ${formation === f ? "text-white" : "text-slate-400 border-white/10 hover:text-white"}`}
              style={formation === f ? { background: "#005cfc", borderColor: "transparent" } : { background: "rgba(255,255,255,0.05)" }}>
              {f}
            </button>
          ))}
          <div className="mr-auto flex items-center gap-2">
            <button onClick={save} className="px-3 py-1.5 rounded-full text-xs font-bold border border-white/10 text-slate-300 hover:text-white flex items-center gap-1">
              <Save size={13} /> {saved ? "ذخیره شد ✓" : "ذخیره"}
            </button>
            <button onClick={exportPng} className="px-3 py-1.5 rounded-full text-xs font-black text-white flex items-center gap-1" style={{ background: "#005cfc" }}>
              <Download size={13} /> PNG
            </button>
            <button onClick={() => applyFormation(formation)} className="px-3 py-1.5 rounded-full text-xs border border-white/10 text-slate-400 hover:text-white flex items-center gap-1">
              <RotateCcw size={13} /> ریست
            </button>
          </div>
        </div>

        <div ref={wrapRef} className="rounded-2xl overflow-hidden border border-white/10">
          <canvas
            ref={canvasRef}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={() => setDrag(null)}
            onPointerCancel={() => setDrag(null)}
            className="block touch-none cursor-grab active:cursor-grabbing w-full"
          />
        </div>
        <p className="text-[11px] text-slate-500 mt-2 text-center">آبی حمله می‌کند به راست • قرمز به چپ • توپ سفید وسط</p>
      </div>
    </div>
  );
}
