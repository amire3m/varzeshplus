"use client";

import type { ReactNode } from "react";

/** کارت پنل یکدست کل سایت */
export function Card({ children, className = "", style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-2xl border border-white/10 p-4 flex flex-col ${className}`} style={{ background: "rgba(37,37,37,0.9)", backdropFilter: "blur(8px)", ...style }}>
      {children}
    </div>
  );
}

/** سربرگ بخش: تیتر + لینک «مشاهده همه» */
export function SectionHeader({ title, href, linkLabel = "مشاهده همه" }: { title: string; href?: string; linkLabel?: string }) {
  if (!href) return <h3 className="headline text-[16px] text-white mb-3">{title}</h3>;
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="headline text-[16px] text-white">{title}</h3>
      <a href={href} className="text-[12px] font-bold hover:underline shrink-0" style={{ color: "#bee503" }}>{linkLabel}</a>
    </div>
  );
}
