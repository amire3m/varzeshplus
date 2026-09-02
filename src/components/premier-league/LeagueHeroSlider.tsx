"use client";

import { useEffect, useState } from "react";
import { TeamBadge } from "./TeamBadge";
import type { PLTeam } from "@/lib/premier-league";

export type PLSlide = {
  image: string;
  badge: string;
  title: string;
  desc: string;
  tag: string;
  time?: string;
  team?: PLTeam;
  stat?: string;
};

export function LeagueHeroSlider({ slides }: { slides: PLSlide[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!slides.length) return;
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (!slides.length) return null;
  const s = slides[i];

  return (
    <section className="relative rounded-2xl overflow-hidden h-[300px] md:h-[380px] neon-border select-none group">
      {slides.map((item, idx) => (
        <div key={idx} className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === i ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#222] via-[#222]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#222]/40 via-transparent to-transparent" />
        </div>
      ))}

      <div className="absolute bottom-0 w-full p-5 md:p-7 z-10">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider" style={{ background: "linear-gradient(135deg,#005cfc,#bee503)", color: "#fff" }}>{s.badge}</span>
          {s.team && (
            <span className="flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full bg-black/40 backdrop-blur border border-white/10 text-white/80">
              <TeamBadge src={s.team.badge} name={s.team.short} size={16} />
              {s.team.name}
            </span>
          )}
          {s.time && <span className="text-[11px] tabular px-2 py-0.5 rounded-full bg-black/40 backdrop-blur text-white/60">{s.time}</span>}
        </div>
        <h2 className="headline text-xl md:text-3xl max-w-2xl leading-tight drop-shadow-lg">{s.title}</h2>
        <p className="text-sm max-w-xl mt-2 line-clamp-2" style={{ color: "var(--color-muted)" }}>{s.desc}</p>
        {s.stat && <span className="inline-block mt-2 text-xs font-black px-3 py-1 rounded-full bg-black/40 backdrop-blur border border-white/10 text-white">{s.stat}</span>}
      </div>

      <button onClick={() => setI((v) => (v - 1 + slides.length) % slides.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center text-white hover:bg-black/60 transition-colors z-20">
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      <button onClick={() => setI((v) => (v + 1) % slides.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center text-white hover:bg-black/60 transition-colors z-20">
        <span className="material-symbols-outlined">chevron_right</span>
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {slides.map((_, idx) => (
          <button key={idx} onClick={() => setI(idx)} aria-label={`اسلاید ${idx + 1}`} className={`transition-all duration-300 rounded-full ${idx === i ? "w-7 h-2" : "w-2 h-2 bg-white/40 hover:bg-white/70"}`} style={idx === i ? { background: "linear-gradient(90deg,#005cfc,#bee503)", boxShadow: "0 0 8px rgba(0,92,252,0.6)" } : undefined} />
        ))}
      </div>
    </section>
  );
}
