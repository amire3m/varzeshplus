"use client";

import { useState } from "react";
import BottomSheet from "@/components/ui/BottomSheet";

export default function PlayerDeepStats({ name, color = "#4AE183" }: { name: string; color?: string }) {
  const [sheet, setSheet] = useState<null | "heatmap" | "shotmap" | "percentile">(null);
  // موک دیتا — بعداً با fotmob stats نگاشت می‌شود
  const heatmap = Array.from({ length: 48 }, () => Math.random());
  const shots = [
    { x: 22, y: 18, goal: true }, { x: 35, y: 28, goal: false }, { x: 28, y: 32, goal: true },
    { x: 42, y: 22, goal: false }, { x: 18, y: 35, goal: false }, { x: 30, y: 15, goal: true },
  ];
  const percentiles = [
    { label: "گل/90", value: 87 }, { label: "پاس کلیدی/90", value: 72 }, { label: "دریبل/90", value: 91 },
    { label: "تکل/90", value: 44 }, { label: "هوایی برده", value: 63 },
  ];

  return (
    <div className="space-y-3">
      <h3 className="headline text-sm text-white">آمار عمیق — {name}</h3>

      {/* Heatmap */}
      <div className="rounded-xl border border-white/10 overflow-hidden" style={{ background: "#101610" }}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
          <span className="text-xs font-bold text-white">Heatmap</span>
          <button onClick={() => setSheet("heatmap")} className="text-[11px] font-bold px-2 py-1 rounded-full border border-white/10" style={{ color }}>توضیح</button>
        </div>
        <div className="p-3">
          <div className="relative rounded-lg overflow-hidden border border-white/5" style={{ background: `linear-gradient(180deg, #0A0F0B, #1D2718)` }}>
            <div className="grid grid-cols-8 gap-px p-2" style={{ aspectRatio: "1.6" }}>
              {heatmap.map((v, i) => (
                <span key={i} className="rounded-sm" style={{ background: `rgba(74,225,131,${0.08 + v * 0.7})`, opacity: 0.7 + v * 0.3 }} />
              ))}
            </div>
            <span className="absolute bottom-1 left-2 text-[9px] text-white/40">چگالی حضور در زمین</span>
          </div>
        </div>
      </div>

      {/* Shotmap */}
      <div className="rounded-xl border border-white/10 overflow-hidden" style={{ background: "#101610" }}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
          <span className="text-xs font-bold text-white">Shotmap (xG)</span>
          <button onClick={() => setSheet("shotmap")} className="text-[11px] font-bold px-2 py-1 rounded-full border border-white/10" style={{ color }}>توضیح</button>
        </div>
        <div className="p-3">
          <div className="relative rounded-lg border border-white/5 h-[160px] overflow-hidden" style={{ background: "#0A0F0B" }}>
            <div className="absolute inset-3 rounded border border-white/10" style={{ background: "rgba(74,225,131,0.04)" }} />
            <div className="absolute left-1/2 top-3 bottom-3 w-px bg-white/10" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-white/10" />
            {shots.map((s, i) => (
              <span key={i} className={`absolute w-3 h-3 rounded-full border-2 -translate-x-1/2 -translate-y-1/2 ${s.goal ? "bg-[#4AE183] border-white" : "bg-[#FF4757] border-white/50"}`} style={{ left: `${s.x}%`, top: `${s.y}%` }} title={s.goal ? "گل" : "از دست رفته"} />
            ))}
            <div className="absolute bottom-1 left-2 flex gap-2 text-[9px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#4AE183] border border-white" /> گل</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FF4757]" /> از دست رفته</span>
            </div>
          </div>
        </div>
      </div>

      {/* Percentile */}
      <div className="rounded-xl border border-white/10 p-4" style={{ background: "#101610" }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-white">Percentile Rank</span>
          <button onClick={() => setSheet("percentile")} className="text-[11px] font-bold px-2 py-1 rounded-full border border-white/10" style={{ color }}>توضیح</button>
        </div>
        <div className="space-y-2">
          {percentiles.map((p) => (
            <div key={p.label} className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400 w-24 shrink-0">{p.label}</span>
              <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${p.value}%`, background: p.value > 80 ? "#4AE183" : p.value > 60 ? "#FFD34D" : "#8FA1B5" }} />
              </div>
              <span className="tabular text-xs font-black w-8 text-right">{p.value}</span>
            </div>
          ))}
        </div>
      </div>

      <BottomSheet open={!!sheet} onClose={() => setSheet(null)} title={sheet === "heatmap" ? "Heatmap" : sheet === "shotmap" ? "Shotmap" : "Percentile"}>
        <div className="text-sm leading-6 text-slate-300">
          {sheet === "heatmap" && "Heatmap چگالی حضور بازیکن در زمین را نشان می‌دهد — رنگ پررنگ‌تر یعنی حضور بیشتر. داده واقعی FotMob/StatsBomb در فاز بعدی با پروکسی تکمیل می‌شود."}
          {sheet === "shotmap" && "Shotmap محل شوت‌ها و گل‌ها + xG هر شوت را نشان می‌دهد. نقاط سبز گل، قرمز از دست رفته است."}
          {sheet === "percentile" && "Percentile رتبه بازیکن نسبت به هم‌پستی‌های لیگ است — 90 یعنی بهتر از 90٪ بازیکنان هم‌پست."}
        </div>
      </BottomSheet>
    </div>
  );
}
