import { TEAMS, LEAGUES } from "@/lib/football/leagues";

export const POSITIONS = ["GK", "DF", "MF", "FW"] as const;
export const POS_LABEL: Record<string, string> = { GK: "دروازه‌بان", DF: "مدافع", MF: "هافبک", FW: "مهاجم" };

const FIRST_NAMES = ["علی", "محمد", "حسین", "مهدی", "امیر", "رضا", "سجاد", "پوریا", "آرمان", "کیان", "سینا", "میلاد", "بهزاد", "فرهاد", "نوید", "احمد", "یاسین", "مصطفی", "جواد", "حمید"];
const LAST_NAMES = ["احمدی", "حسینی", "کریمی", "رضایی", "محمدی", "نوری", "کاظمی", "مرادی", "صادقی", "عباسی", "جعفری", "زارعی", "قاسمی", "موسوی", "اکبری", "حیدری", "رحیمی", "شفیعی", "فتحی", "نجفی"];

function rnd(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick<T>(arr: T[]): T { return arr[rnd(0, arr.length - 1)]; }

export function generateSquad(teamSlug: string): Array<{ name: string; position: string; age: number; rating: number; value: number; salary: number; isStarter: boolean }> {
  const dist = [
    { pos: "GK", count: 2, rating: [68, 78] },
    { pos: "DF", count: 6, rating: [66, 80] },
    { pos: "MF", count: 6, rating: [67, 82] },
    { pos: "FW", count: 4, rating: [68, 84] },
  ];
  const squad: Array<any> = [];
  for (const d of dist) {
    for (let i = 0; i < d.count; i++) {
      const rating = rnd(d.rating[0], d.rating[1]);
      const age = rnd(19, 32);
      const value = rating * 25000 + rnd(0, 50000);
      const salary = Math.round(value * 0.015);
      squad.push({
        name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
        position: d.pos,
        age,
        rating,
        value,
        salary,
        isStarter: squad.length < 11, // اول ۱۱ نفر فیکس
      });
    }
  }
  // تضمین ۱۱ فیکس متوازن
  const starters = squad.filter((p) => p.isStarter);
  if (starters.filter((p) => p.position === "GK").length === 0) {
    squad.find((p) => p.position === "GK")!.isStarter = true;
    squad.find((p) => p.isStarter && p.position !== "GK")!.isStarter = false;
  }
  return squad;
}

export function generateFixtures(teamSlug: string, teamName: string): Array<{ homeTeam: string; awayTeam: string }> {
  // حریف‌ها: ۷ تیم رندوم دیگر + برگشت (۱۴ هفته)
  const others = TEAMS.filter((t) => t.slug !== teamSlug).sort(() => Math.random() - 0.5).slice(0, 7);
  const fixtures: Array<{ homeTeam: string; awayTeam: string }> = [];
  for (const opp of others) {
    fixtures.push({ homeTeam: teamName, awayTeam: opp.name });
    fixtures.push({ homeTeam: opp.name, awayTeam: teamName });
  }
  // شافل برای تنوع هفته‌ها
  for (let i = fixtures.length - 1; i > 0; i--) {
    const j = rnd(0, i);
    [fixtures[i], fixtures[j]] = [fixtures[j], fixtures[i]];
  }
  return fixtures.slice(0, 14);
}

export function simulateMatch(myRating: number, oppRating: number) {
  const diff = myRating - oppRating;
  const myChances = 3 + Math.round(diff / 8) + rnd(0, 2);
  const oppChances = 3 - Math.round(diff / 8) + rnd(0, 2);
  let myGoals = 0, oppGoals = 0;
  const events: string[] = [];
  const moments = ["دقیقه ۱۲: حمله خطرناک", "دقیقه ۲۸: ضربه سر", "دقیقه ۴۴: ضدحمله", "دقیقه ۵۸: شوت از راه دور", "دقیقه ۷۳: کرنر", "دقیقه ۸۹: موقعیت طلایی"];
  for (let i = 0; i < Math.max(myChances, oppChances); i++) {
    if (i < myChances && Math.random() < 0.28) { myGoals++; events.push(`${moments[i % moments.length]} — گل برای شما!`); }
    else if (i < myChances) events.push(`${moments[i % moments.length]} — توپ از کنار دروازه بیرون رفت`);
    if (i < oppChances && Math.random() < 0.26) { oppGoals++; events.push(`${moments[(i + 2) % moments.length]} — گل برای حریف`); }
  }
  if (events.length === 0) events.push("بازی پایاپای دنبال شد — موقعیت جدی خلق نشد");
  let result: "win" | "draw" | "loss" = "draw";
  if (myGoals > oppGoals) result = "win";
  else if (myGoals < oppGoals) result = "loss";
  return { myGoals, oppGoals, events, result };
}

export function inboxTitleForResult(result: string, opp: string) {
  if (result === "win") return `پیروزی مقابل ${opp} 🎉`;
  if (result === "loss") return `شکست برابر ${opp}`;
  return `تساوی با ${opp}`;
}
