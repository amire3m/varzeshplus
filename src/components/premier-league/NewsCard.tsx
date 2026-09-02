"use client";

import type { PLNews } from "@/lib/premier-league";
import { teamById } from "@/lib/premier-league";
import { TeamBadge } from "./TeamBadge";

export function NewsCard({ news, big = false }: { news: PLNews; big?: boolean }) {
  return (
    <article className={`glass-panel overflow-hidden group flex flex-col ${big ? "" : "sm:flex-row"}`}>
      <div className={`relative overflow-hidden ${big ? "h-48" : "h-32 sm:h-auto sm:w-32 sm:shrink-0"}`}>
        <img src={news.image} alt={news.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
      </div>
      <div className="p-4 flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background: "rgba(0,92,252,0.12)", color: "#005cfc" }}>{news.tag}</span>
          {news.teamId && (
            <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--color-muted)" }}>
              <TeamBadge src={teamById(news.teamId).badge} name={teamById(news.teamId).short} size={14} />
              {teamById(news.teamId).name}
            </span>
          )}
          <span className="mr-auto text-[11px] tabular" style={{ color: "var(--color-muted)" }}>{news.publishedAt}</span>
        </div>
        <h3 className={`font-bold leading-snug group-hover:underline decoration-[#005cfc] underline-offset-2 ${big ? "headline text-lg" : "text-sm"}`}>{news.title}</h3>
        {news.summary && <p className={`text-sm mt-1.5 line-clamp-2 ${big ? "" : "hidden sm:block"}`} style={{ color: "var(--color-muted)" }}>{news.summary}</p>}
      </div>
    </article>
  );
}
