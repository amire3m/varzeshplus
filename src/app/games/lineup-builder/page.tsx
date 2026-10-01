"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Save, RotateCcw, Download } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";

type Pt = { x: number; y: number };
type Player = { id: string; num: number; pos: Pt; name: string };

const FORMATIONS: Record<string, { pos: Pt[]; label: string }> = {
  "4-3-3": { label: "4-3-3", pos: [{ x: 0.5, y: 0.92 }, { x: 0.18, y: 0.72 }, { x: 0.36, y: 0.74 }, { x: 0.64, y: 0.74 }, { x: 0.82, y: 0.72 }, { x: 0.3, y: 0.52 }, { x: 0.5, y: 0.55 }, { x: 0.7, y: 0.52 }, { x: 0.22, y: 0.28 }, { x: 0.5, y: 0.22 }, { x: 0.78, y: 0.28 }] },
  "4-2-3-1": { label: "4-2-3-1", pos: [{ x: 0.5, y: 0.92 }, { x: 0.18, y: 0.72 }, { x: 0.36, y: 0.74 }, { x: 0.64, y: 0.74 }, { x: 0.82, y: 0.72 }, { x: 0.36, y: 0.52 }, { x: 0.64, y: 0.52 }, { x: 0.22, y: 0.32 }, { x: 0.5, y: 0.30 }, { x: 0.78, y: 0.32 }, { x: 0.5, y: 0.14 }] },
  "3-5-2": { label: "3-5-2", pos: [{ x: 0.5, y: 0.92 }, { x: 0.28, y: 0.72 }, { x: 0.5, y: 0.74 }, { x: 0.72, y: 0.72 }, { x: 0.18, y: 0.48 }, { x: 0.36, y: 0.5 }, { x: 0.5, y: 0.45 }, { x: 0.64, y: 0.5 }, { x: 0.82, y: 0.48 }, { x: 0.38, y: 0.18 }, { x: 0.62, y: 0.18 }] },
};

function defaultPlayers(f: string): Player[] {
  const ps = FORMATIONS[f].pos;
  return ps.map((p, i) => ({ id: `p-${i}`, num: i + 1, pos: p, name: `بازیکن ${i + 1}` }));
}

export default function LineupBuilderPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [formation, setFormation] = useState("4-3-3");
  const [players, setPlayers] = useState<Player[]>(() => defaultPlayers("4-3-3"));
  const [drag, setDrag] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("lineup-builder");
      if (raw) {
        const s = JSON.parse(raw);
        if (Array.isArray(s.players)) { setPlayers(s.players); if (s.formation) setFormation(s.formation); }
      }
    } catch {}
  }, []);

  function applyFormation(f: string) {
    setFormation(f);
    setPlayers(defaultPlayers(f));
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
    ctx.fillStyle = "#1d5c33";
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 14; i += 2) {
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.fillRect((i / 14) * W, 0, W / 14, H);
    }
    ctx.strokeStyle = "rgba(255,255,255,0.75)";
    ctx.lineWidth = 2;
    const X = (v: number) => v * W;
    const Y = (v: number) => v * H;
    ctx.strokeRect(8, 8, W - 16, H - 16);
    ctx.beginPath(); ctx.moveTo(W / 2, 8); ctx.lineTo(W / 2, H - 8); ctx.stroke();
    ctx.beginPath(); ctx.arc(W / 2, H / 2, Math.min(W, H) * 0.11, 0, Math.PI * 2); ctx.stroke();
    const boxW = W * 0.14, boxH = H * 0.44, sixW = W * 0.05, sixH = H * 0.24;
    ctx.strokeRect(8, (H - boxH) / 2, boxW, boxH);
    ctx.strokeRect(W - 8 - boxW, (H - boxH) / 2, boxW, boxH);
    ctx.strokeRect(8, (H - sixH) / 2, sixW, sixH);
    ctx.strokeRect(W - 8 - sixW, (H - sixH) / 2, sixW, sixH);
    for (const p of players) {
      const px = X(p.pos.x), py = Y(p.pos.y);
      ctx.beginPath(); ctx.arc(px, py, 14, 0, Math.PI * 2);
      ctx.fillStyle = "#4AE183"; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = "#fff"; ctx.stroke();
      ctx.fillStyle = "#0A0F0B";
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
  }, [players]);

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
    let best: Player | null = null;
    let bestD = 0.05;
    for (const p of players) {
      const d = Math.hypot(p.pos.x - mx, p.pos.y - my);
      if (d < bestD) { bestD = d; best = p; }
    }
    if (best) setDrag(best.id);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  function onMove(e: React.PointerEvent) {
    if (!drag) return;
    const pt = toNorm(e);
    setPlayers((ps) => ps.map((p) => (p.id === drag ? { ...p, pos: pt } : p)));
  }

  function save() {
    try {
      localStorage.setItem("lineup-builder", JSON.stringify({ players, formation }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  }

  function exportPng() {
    const cv = canvasRef.current;
    if (!cv) return;
    const a = document.createElement("a");
    a.download = `lineup-${formation}.png`;
    a.href = cv.toDataURL("image/png");
    a.click();
  }

  return (
    <PageShell badge="Lineup Builder" activeDock="home">
      <div className="max-w-[900px] mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg" style={{ background: "linear-gradient(135deg, #4AE183, #FFD34D)" }}>◈</div>
          <div>
            <h1 className="headline text-[22px] text-white">Lineup Builder</h1>
            <p className="text-[12px] text-slate-400">ترکیب ۱۱ نفره بچین — FotMob feature.lineupbuilder</p>
          </div>
          <Link href="/games" className="mr-auto text-xs text-slate-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-full">همه بازی‌ها</Link>
        </div>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {Object.keys(FORMATIONS).map((f) => (
            <button key={f} onClick={() => applyFormation(f)} dir="ltr"
              className={`px-3 py-1.5 rounded-full text-xs font-black tabular border transition-all ${formation === f ? "text-white" : "text-slate-400 border-white/10 hover:text-white"}`}
              style={formation === f ? { background: "#4AE183", borderColor: "transparent", color: "#0A0F0B" } : { background: "rgba(255,255,255,0.05)" }}>
              {f}
            </button>
          ))}
          <div className="mr-auto flex items-center gap-2">
            <button onClick={save} className="px-3 py-1.5 rounded-full text-xs font-bold border border-white/10 text-slate-300 hover:text-white flex items-center gap-1">
              <Save size={13} /> {saved ? "ذخیره شد ✓" : "ذخیره"}
            </button>
            <button onClick={exportPng} className="px-3 py-1.5 rounded-full text-xs font-black text-white flex items-center gap-1" style={{ background: "#4AE183", color: "#0A0F0B" }}>
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
        <p className="text-[11px] text-slate-400 mt-2 text-center">بازیکنان سبز را بکش — ذخیره در localStorage</p>
      </div>
    </PageShell>
  );
}
