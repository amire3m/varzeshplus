import type { NewsItem, Team } from "@/lib/football";
import { TeamBadge } from "./TeamBadge";

export function NewsCard({ news, getTeam, big = false }: { news: NewsItem; getTeam: (id: number) => Team | undefined; big?: boolean }) {
  const team = news.teamId ? getTeam(news.teamId) : undefined;
  return (
    <article className={`rounded-[14px] border overflow-hidden group flex flex-col ${big ? "" : "sm:flex-row"}`}>
      <div className={`relative overflow-hidden ${big ? "h-48" : "h-32 sm:h-auto sm:w-32 sm:shrink-0"}`}>
        <img src={news.image} alt={news.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
      </div>
      <div className="p-4 flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background: "rgba(0,92,252,0.12)", color: "#005cfc" }}>{news.tag}</span>
          {team && <span className="flex items-center gap-1 text-[10px]" style={{ color: "var(--color-muted)" }}><TeamBadge team={team} size={14} />{team.name}</span>}
          <span className="mr-auto text-[11px] tabular" style={{ color: "var(--color-muted)" }}>{news.publishedAt}</span>
        </div>
        <h3 className={`font-bold leading-snug group-hover:underline decoration-[#005cfc] underline-offset-2 ${big ? "headline text-lg" : "text-sm"}`}>{news.title}</h3>
        {news.summary && <p className={`text-sm mt-1.5 line-clamp-2 ${big ? "" : "hidden sm:block"}`} style={{ color: "var(--color-muted)" }}>{news.summary}</p>}
      </div>
    </article>
  );
}