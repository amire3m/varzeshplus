import type { ReactNode } from "react";

/** زمین فوتبال افقی (Landscape) — چمن راه‌راه + خطوط subtle */
export function FootballPitch({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative w-full overflow-hidden select-none ${className}`}
      style={{
        aspectRatio: "16 / 9.6",
        borderRadius: 16,
        background:
          "radial-gradient(120% 120% at 50% 0%, #1e3324 0%, #16271c 45%, #0f1c15 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "inset 0 0 60px rgba(0,0,0,0.55)",
      }}
    >
      {/* چمن راه‌راه عمودی */}
      <div className="absolute inset-0 opacity-60" aria-hidden style={{
        background: "repeating-linear-gradient(90deg, rgba(255,255,255,0.045) 0 6.25%, transparent 6.25% 12.5%)",
      }} />
      {/* خطوط زمین */}
      <div className="absolute inset-0" style={{ color: "rgba(255,255,255,0.14)" }} aria-hidden>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full" style={{ position: "absolute", inset: 0 }}>
          {/* بیرونی */}
          <rect x="1.5" y="1.5" width="97" height="97" fill="none" stroke="currentColor" strokeWidth="0.4" />
          {/* خط وسط */}
          <line x1="50" y1="1.5" x2="50" y2="98.5" stroke="currentColor" strokeWidth="0.35" />
          {/* دایره وسط */}
          <circle cx="50" cy="50" r="11" fill="none" stroke="currentColor" strokeWidth="0.35" />
          <circle cx="50" cy="50" r="1.1" fill="currentColor" />
          {/* محوطه جریمه چپ/راست */}
          <rect x="1.5" y="22" width="16" height="56" fill="none" stroke="currentColor" strokeWidth="0.4" />
          <rect x="82.5" y="22" width="16" height="56" fill="none" stroke="currentColor" strokeWidth="0.4" />
          {/* محوطه دروازه */}
          <rect x="1.5" y="35" width="6" height="30" fill="none" stroke="currentColor" strokeWidth="0.35" />
          <rect x="92.5" y="35" width="6" height="30" fill="none" stroke="currentColor" strokeWidth="0.35" />
          {/* نقطه پنالتی */}
          <circle cx="14" cy="50" r="0.8" fill="currentColor" />
          <circle cx="86" cy="50" r="0.8" fill="currentColor" />
        </svg>
      </div>
      {/* دروازه‌ها */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2" style={{ width: 10, height: 20, border: "2px solid rgba(255,255,255,0.4)", borderLeft: "none", borderRadius: "0 6px 6px 0" }} />
      <div className="absolute right-0 top-1/2 -translate-y-1/2" style={{ width: 10, height: 20, border: "2px solid rgba(255,255,255,0.4)", borderRight: "none", borderRadius: "6px 0 0 6px" }} />
      {/* بازیکن‌ها */}
      <div className="absolute inset-0 z-10">{children}</div>
    </div>
  );
}
