export type RatingRange = { min: number; max: number; color: string };

export const DEFAULT_RATING_SCALE: RatingRange[] = [
  { min: 8, max: 10, color: "#22c55e" },
  { min: 7, max: 8, color: "#84cc16" },
  { min: 6.2, max: 7, color: "#eab308" },
  { min: 5.5, max: 6.2, color: "#f97316" },
  { min: 0, max: 5.5, color: "#ef4444" },
];

/** رنگ امتیاز — range ها configurable و از Data Source گرفته می‌شود */
export function ratingColor(rating: number | null | undefined, scale: RatingRange[] = DEFAULT_RATING_SCALE): string {
  if (rating == null) return "transparent";
  for (const r of scale) {
    if (rating >= r.min && rating < r.max) return r.color;
  }
  return scale[scale.length - 1].color;
}

export function PlayerRatingBadge({ rating, scale }: { rating: number | null; scale?: RatingRange[] }) {
  if (rating == null) return null;
  const color = ratingColor(rating, scale);
  return (
    <span
      className="tabular shrink-0"
      style={{
        display: "inline-block",
        minWidth: 30,
        padding: "2px 6px",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 900,
        lineHeight: 1.2,
        color: "#08120b",
        background: color,
        boxShadow: `0 1px 4px ${color}55`,
      }}
    >
      {rating.toFixed(1)}
    </span>
  );
}
