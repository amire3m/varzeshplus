import { db } from "@/db";
import { matches, games, leaderboard, scoreboard, quickLinks } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Seed matches
    await db.insert(matches).values([
      {
        homeTeam: "پرسپولیس",
        awayTeam: "استقلال",
        homeScore: null,
        awayScore: null,
        status: "upcoming",
        league: "لیگ برتر ایران",
        kickoff: new Date("2025-02-15T18:30:00Z"),
        minute: null,
      },
      {
        homeTeam: "سپاهان",
        awayTeam: "تراکتور",
        homeScore: 2,
        awayScore: 1,
        status: "live",
        league: "لیگ برتر ایران",
        kickoff: new Date("2025-02-14T16:00:00Z"),
        minute: 67,
      },
      {
        homeTeam: "ریال مادرید",
        awayTeam: "بارسلونا",
        homeScore: null,
        awayScore: null,
        status: "upcoming",
        league: "لالیگا اسپانیا",
        kickoff: new Date("2025-02-16T21:00:00Z"),
        minute: null,
      },
      {
        homeTeam: "لیورپول",
        awayTeam: "منچسترسیتی",
        homeScore: null,
        awayScore: null,
        status: "upcoming",
        league: "لیگ برتر انگلیس",
        kickoff: new Date("2025-02-17T17:30:00Z"),
        minute: null,
      },
      {
        homeTeam: "بایرن مونیخ",
        awayTeam: "دورتموند",
        homeScore: 3,
        awayScore: 2,
        status: "live",
        league: "بوندسلیگا آلمان",
        kickoff: new Date("2025-02-14T15:30:00Z"),
        minute: 82,
      },
      {
        homeTeam: "پاری سن ژرمن",
        awayTeam: "مارسای",
        homeScore: null,
        awayScore: null,
        status: "upcoming",
        league: "لیگ ۱ فرانسه",
        kickoff: new Date("2025-02-18T20:00:00Z"),
        minute: null,
      },
    ]).onConflictDoNothing();

    // Seed games
    await db.insert(games).values([
      {
        title: "پیش‌بینی نتیجه دربی",
        description: "نتیجه دقیق دربی پرسپولیس و استقلال را پیش‌بینی کن و برنده جایزه باش",
        type: "prediction",
        prize: "۵۰ میلیون تومان",
        participantCount: 12847,
        isActive: true,
        endsAt: new Date("2025-02-15T18:00:00Z"),
      },
      {
        title: "کوییز دانش فوتبالی",
        description: "به سوالات متنوع فوتبالی جواب بده و امتیاز جمع کن",
        type: "quiz",
        prize: "۲۰ میلیون تومان",
        participantCount: 8532,
        isActive: true,
        endsAt: new Date("2025-02-20T23:59:00Z"),
      },
      {
        title: "ماراتن تماشای لیگ برتر",
        description: "تمام بازی‌های هفته لیگ برتر رو تماشا کن و امتیاز بگیر",
        type: "video_marathon",
        prize: "۳۰ میلیون تومان",
        participantCount: 5291,
        isActive: true,
        endsAt: new Date("2025-02-22T23:59:00Z"),
      },
    ]).onConflictDoNothing();

    // Seed leaderboard
    await db.insert(leaderboard).values([
      { rank: 1, username: "علی_فوتبالی", phone: "0912***4567", points: 15420, avatar: null },
      { rank: 2, username: "سارا_ورزشی", phone: "0935***8912", points: 14890, avatar: null },
      { rank: 3, username: "رضا_پیش‌بینی", phone: "0921***3456", points: 13250, avatar: null },
      { rank: 4, username: "مریم_طلا", phone: "0919***7890", points: 12180, avatar: null },
      { rank: 5, username: "حسین_قهرمان", phone: "0933***2345", points: 11540, avatar: null },
      { rank: 6, username: "زهرا_استقلال", phone: "0916***6789", points: 10890, avatar: null },
      { rank: 7, username: "محمد_سپاهان", phone: "0938***0123", points: 10230, avatar: null },
      { rank: 8, username: "نازنین_لیور", phone: "0911***5678", points: 9750, avatar: null },
    ]).onConflictDoNothing();

    // Seed scoreboard
    await db.insert(scoreboard).values([
      {
        homeTeam: "سپاهان",
        awayTeam: "تراکتور",
        homeScore: 2,
        awayScore: 1,
        minute: 67,
        league: "لیگ برتر ایران",
        isLive: true,
      },
      {
        homeTeam: "بایرن مونیخ",
        awayTeam: "دورتموند",
        homeScore: 3,
        awayScore: 2,
        minute: 82,
        league: "بوندسلیگا",
        isLive: true,
      },
      {
        homeTeam: "یوونتوس",
        awayTeam: "میلان",
        homeScore: 1,
        awayScore: 0,
        minute: 45,
        league: "سری آ",
        isLive: true,
      },
    ]).onConflictDoNothing();

    // Seed quick links
    await db.insert(quickLinks).values([
      { title: "برنامه پخش زنده", href: "#live-schedule", icon: "tv", order: 1 },
      { title: "آرشیو مسابقات", href: "#archive", icon: "archive", order: 2 },
      { title: "قوانین بازی", href: "#rules", icon: "book", order: 3 },
      { title: "پشتیبانی", href: "#support", icon: "headphones", order: 4 },
      { title: "پروفایل من", href: "#profile", icon: "user", order: 5 },
    ]).onConflictDoNothing();

    return NextResponse.json({ success: true, message: "Data seeded successfully" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
