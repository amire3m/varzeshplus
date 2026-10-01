"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { isFavorite, toggleFavorite } from "@/lib/favorites";

export default function FavoriteStar({
  type,
  id,
  size = 18,
}: {
  type: "team" | "league" | "player";
  id: string;
  size?: number;
}) {
  const [fav, setFav] = useState(false);
  useEffect(() => setFav(isFavorite(type, id)), [type, id]);
  useEffect(() => {
    const h = () => setFav(isFavorite(type, id));
    window.addEventListener("varzeshplus:fav-change", h);
    return () => window.removeEventListener("varzeshplus:fav-change", h);
  }, [type, id]);

  return (
    <button
      aria-label={fav ? "حذف از علاقه‌مندی" : "افزودن به علاقه‌مندی"}
      aria-pressed={fav}
      onClick={() => setFav(toggleFavorite(type, id))}
      className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
        fav ? "bg-[#FFD34D] border-[#FFD34D] text-[#0A0F0B]" : "bg-white/5 border-white/10 text-white/40 hover:text-[#FFD34D] hover:border-[#FFD34D]/30"
      }`}
    >
      <Star size={size} className={fav ? "fill-[#0A0F0B]" : ""} />
    </button>
  );
}
