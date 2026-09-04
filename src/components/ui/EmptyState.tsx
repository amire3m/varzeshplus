"use client";

import type { ReactNode } from "react";

/** حالت خالی یکدست: آیکون + تیتر + توضیح + دکمه اختیاری */
export function EmptyState({ icon, title, hint, action }: { icon?: ReactNode; title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center" style={{ background: "rgba(255,255,255,0.02)" }}>
      {icon && <div className="flex justify-center mb-3 text-slate-500">{icon}</div>}
      <p className="text-sm font-bold text-slate-300">{title}</p>
      {hint && <p className="text-[11px] text-slate-500 mt-1 leading-5">{hint}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
