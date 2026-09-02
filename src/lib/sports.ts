export type Sport = {
  key: string;
  name: string;
  emoji: string;
  icon: string;
  color: string;
  subs: string[];
};

export const SPORTS: Sport[] = [
  { key: "football", name: "فوتبال", emoji: "⚽", icon: "sports_soccer", color: "#17b6cc", subs: ["بوندسلیگا", "پریمیرلیگ", "لیگ خلیج فارس", "سری آ", "لالیگا"] },
  { key: "volleyball", name: "والیبال", emoji: "🏐", icon: "sports_volleyball", color: "#22c55e", subs: ["لیگ برتر ایران", "لیگ ملت‌ها", "تیم ملی", "والیبال ساحلی"] },
  { key: "basketball", name: "بسکتبال", emoji: "🏀", icon: "sports_basketball", color: "#e8820c", subs: ["لیگ برتر ایران", "NBA", "یوروبسکت", "تیم ملی"] },
  { key: "tennis", name: "تنیس", emoji: "🎾", icon: "sports_tennis", color: "#84cc16", subs: ["گرند اسلم", "تنیس روی میز", "جام دیویس", "تیم ملی"] },
  { key: "wrestling", name: "کشتی", emoji: "🤼", icon: "sports_kabaddi", color: "#ef4444", subs: ["آزاد", "فرنگی", "لیگ برتر", "تیم ملی"] },
  { key: "martial", name: "رزمی", emoji: "🥊", icon: "sports_martial_arts", color: "#a855f7", subs: ["تکواندو", "کاراته", "بوکس", "MMA", "جودو"] },
  { key: "motorsport", name: "موتوراسپرت", emoji: "🏎️", icon: "sports_motorsports", color: "#f59e0b", subs: ["فرمول ۱", "موتوجی‌پی", "رالی", "فرمول ای"] },
  { key: "handball", name: "هندبال", emoji: "🤾", icon: "sports_handball", color: "#06b6d4", subs: ["لیگ برتر", "جام ملت‌ها", "تیم ملی"] },
  { key: "swimming", name: "شنا", emoji: "🏊", icon: "pool", color: "#0ea5e9", subs: ["قهرمانی جهان", "المپیک", "لیگ ایران"] },
  { key: "athletics", name: "دوومیدانی", emoji: "🏃", icon: "directions_run", color: "#f97316", subs: ["قهرمانی جهان", "المپیک"] },
  { key: "chess", name: "شطرنج", emoji: "♟️", icon: "sports_esports", color: "#8b8b8b", subs: ["قهرمانی جهان", "لیگ ایران"] },
  { key: "ski", name: "اسکی", emoji: "⛷️", icon: "downhill_skiing", color: "#38bdf8", subs: ["آلپاین", "اسنوبرد", "پرش"] },
  { key: "gymnastics", name: "ژیمناستیک", emoji: "🤸", icon: "sports_gymnastics", color: "#ec4899", subs: ["هنری", "ریتمیک"] },
  { key: "kabaddi", name: "کبدی", emoji: "🤼", icon: "sports_kabaddi", color: "#84cc16", subs: ["لیگ برتر", "تیم ملی"] },
  { key: "weightlifting", name: "وزنه‌برداری", emoji: "🏋️", icon: "fitness_center", color: "#d946ef", subs: ["قهرمانی جهان", "المپیک", "لیگ"] },
  { key: "american", name: "فوتبال آمریکایی", emoji: "🏈", icon: "sports_football", color: "#64748b", subs: ["NFL", "سوپربول"] },
  { key: "golf", name: "گلف", emoji: "⛳", icon: "golf_course", color: "#22c55e", subs: ["مسترز", "لیگ جهانی"] },
  { key: "archery", name: "تیراندازی", emoji: "🎯", icon: "ads_click", color: "#eab308", subs: ["المپیک", "قهرمانی جهان"] },
  { key: "cycling", name: "دوچرخه‌سواری", emoji: "🚴", icon: "directions_bike", color: "#3b82f6", subs: ["تور دو فرانس", "پیست"] },
  { key: "rowing", name: "قایقرانی", emoji: "🛶", icon: "rowing", color: "#06b6d4", subs: ["المپیک", "قهرمانی جهان"] },
];

export const DRAWER_SPORTS = SPORTS.filter((s) =>
  ["football", "volleyball", "basketball", "tennis", "wrestling"].includes(s.key)
);

export function getSport(key: string): Sport | undefined {
  return SPORTS.find((s) => s.key === key);
}
