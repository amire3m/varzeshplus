"use client";

import { useState } from "react";
import BottomSheet from "@/components/ui/BottomSheet";

type Odds = { home: string; draw: string; away: string; over: string; under: string };

export default function OddsTab({ odds }: { odds?: Odds }) {
  const [sheet, setSheet] = useState(false);
  const o = odds ?? { home: "2.10", draw: "3.40", away: "3.20", over: "1.85", under: "1.95" };
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden" style={{ background: "#101610" }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-sm font-black text-white">ضرایب</h3>
        <button onClick={() => setSheet(true)} className="text-[11px] font-bold px-2 py-1 rounded-full border border-white/10 hover:bg-white/5" style={{ color: "#4AE183" }}>فرمت ضرایب</button>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "برد میزبان", value: o.home },
            { label: "مساوی", value: o.draw },
            { label: "برد میهمان", value: o.away },
          ].map((x) => (
            <div key={x.label} className="rounded-xl border border-white/10 p-3 text-center hover:bg-white/[0.04] transition-colors" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-[11px] text-slate-400">{x.label}</p>
              <p className="tabular text-lg font-black text-white mt-1">{x.value}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/10 p-3 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.02)" }}>
            <span className="text-xs text-slate-400">Over 2.5</span><span className="tabular font-black text-white">{o.over}</span>
          </div>
          <div className="rounded-xl border border-white/10 p-3 flex items-center justify-between" style={{ background: "rgba(255,255,255,0.02)" }}>
            <span className="text-xs text-slate-400">Under 2.5</span><span className="tabular font-black text-white">{o.under}</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 text-center">ضرایب نمایشی است — منبع FotMob در فاز بعدی با پروکسی هیبریدی تکمیل می‌شود.</p>
      </div>

      <BottomSheet open={sheet} onClose={() => setSheet(false)} title="فرمت ضرایب">
        <div className="space-y-2 text-sm">
          <p className="text-slate-300 leading-6">ضرایب به صورت اعشاری (Decimal) نمایش داده می‌شود. مثال: 2.10 یعنی به ازای 1 واحد شرط، 2.10 بازمی‌گردد.</p>
          <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-xs text-slate-400">Decimal 2.10 = Fractional 11/10 = American +110</div>
        </div>
      </BottomSheet>
    </div>
  );
}
