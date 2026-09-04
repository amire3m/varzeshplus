"use client";

import { useEffect, useState } from "react";
import { Newspaper } from "lucide-react";
import type { Match } from "@/lib/football";
import { getTeamById } from "@/lib/football";
import { NewsRow } from "../ui/NewsRow";
import { SkeletonNewsRow } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";

type SideItem = { title: string; link: string; description: string; image: string | null; category: string; time: string };

/** تب «رویدادها» — حاشیه بازی با اخبار واقعی RSS خبرورزشی */
export function MatchSideEvents({ match }: { match: Match }) {
  const home = getTeamById(match.homeTeamId);
  const away = getTeamById(match.awayTeamId);
  const [items, setItems] = useState<SideItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = `teams=${encodeURIComponent(home.name)},${encodeURIComponent(away.name)}`;
    fetch(`/api/news/side-events?${q}`)
      .then((r) => r.json())
      .then((res) => { if (res?.success) setItems(res.items ?? []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [home.name, away.name]);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-white/10 p-4 flex items-center justify-between" style={{ background: "#2a2a2a" }}>
        <div>
          <h3 className="headline text-sm text-white">حاشیه {home.name} و {away.name}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">اخبار واقعی از خبرورزشی — به‌روزرسانی هر ۱۰ دقیقه</p>
        </div>
        <span className="text-[10px] font-black px-2 py-1 rounded-full shrink-0" style={{ background: "rgba(0,92,252,0.15)", color: "#005cfc" }}>زنده</span>
      </div>

      {loading && (
        <div className="space-y-2">
          <SkeletonNewsRow /><SkeletonNewsRow /><SkeletonNewsRow />
        </div>
      )}

      {!loading && items.length === 0 && (
        <EmptyState icon={<Newspaper size={28} />} title="خبری برای این مسابقه یافت نشد." hint="به‌زودی حاشیه‌های این بازی اینجا نمایش داده می‌شود." />
      )}

      {!loading && items.map((it, i) => (
        <NewsRow
          key={i} title={it.title} href={it.link} external
          image={it.image} time={it.time}
          badge={it.category ? { label: it.category, color: "#005cfc" } : null}
          description={it.description}
        />
      ))}
    </div>
  );
}
