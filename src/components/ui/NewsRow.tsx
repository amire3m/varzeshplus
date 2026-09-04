"use client";

import { SafeImage } from "./SafeImage";

/** ردیف خبر یکدست — خانه، حاشیه بازی، تب اخبار */
export function NewsRow({
  title, href, external = false, image, time, badge, description,
}: {
  title: string;
  href: string;
  external?: boolean;
  image?: string | null;
  time?: string | null;
  badge?: { label: string; color: string } | null;
  description?: string | null;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="flex items-start gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/5 transition-colors hover:bg-white/[0.06] hover:border-white/10"
    >
      {image ? (
        <SafeImage src={image} alt={title} fallbackText={title} color={badge?.color ?? "#005cfc"} className="w-[84px] h-[58px] rounded-lg" />
      ) : null}
      <div className="min-w-0 flex-1">
        {(badge || time) && (
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            {badge && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{ background: `${badge.color}22`, color: badge.color }}>
                {badge.label}
              </span>
            )}
            {time && <span className="text-[10px] text-slate-500 tabular">{time}</span>}
          </div>
        )}
        <p className="text-[12px] font-bold leading-5 line-clamp-2 text-white">{title}</p>
        {description && <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-5">{description}</p>}
      </div>
    </a>
  );
}
