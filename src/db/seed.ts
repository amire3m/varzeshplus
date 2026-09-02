import { db } from "@/db";
import {
  programs, adminUsers, games, gameQuestions, users, news,
  sportEvents, badges, scoreWeights, liveEvents, gameParticipations, notifications,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

function daysFromNow(d: number, h = 20) {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  dt.setHours(h, 0, 0, 0);
  return dt.toISOString();
}

function minsAgo(m: number) {
  return new Date(Date.now() - m * 60_000).toISOString();
}

let seeded = false;

export function seedDatabase() {
  if (seeded) return;
  const existing = db.select({ c: sql<number>`COUNT(*)` }).from(programs).all();
  if (existing[0] && Number(existing[0].c) > 0) {
    seeded = true;
    return;
  }

  /* --- برنامه‌های شبکه --- */
  const programTitles = [
    "فوتبال شب", "هفته نود", "لیگ اروپا", "مرور گردها", "استودیو نود",
    "گزارش ویژه", "خبرگزاری ورزش", "مباحثه فوتبالی", "کوله‌بار ورزشی", "تاکتیک",
  ];
  const insertedPrograms = programTitles.map((t, i) =>
    db.insert(programs).values({
      title: t, slug: `program-${i + 1}`,
      description: `برنامه ${t} شبکه ورزش`,
      onAirDay: ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه"][i % 5],
      onAirTime: `${20 + (i % 3)}:00`,
    }).returning().all()[0]
  );

  /* --- ادمین‌ها (رمز همه برای دمو: 123456) --- */
  const pass = hashPassword("123456");
  db.insert(adminUsers).values([
    { username: "super", passwordHash: pass, fullName: "مدیر ارشد", role: "super_admin", createdAt: minsAgo(10000) },
    { username: "content", passwordHash: pass, fullName: "کارشناس محتوای مرکزی", role: "central_content", createdAt: minsAgo(9000) },
    { username: "approver", passwordHash: pass, fullName: "تأییدکننده مرکزی", role: "approver", createdAt: minsAgo(9000) },
    { username: "ops", passwordHash: pass, fullName: "اپراتور پخش", role: "broadcast_ops", createdAt: minsAgo(9000) },
    { username: "reporter", passwordHash: pass, fullName: "گزارشگر استودیو", role: "commentator", createdAt: minsAgo(9000) },
    { username: "support", passwordHash: pass, fullName: "پشتیبانی کاربران", role: "support", createdAt: minsAgo(9000) },
    { username: "team_football", passwordHash: pass, fullName: "تیم برنامه فوتبال شب", role: "program_team", programId: insertedPrograms[0].id, createdAt: minsAgo(8000) },
    { username: "team_90", passwordHash: pass, fullName: "تیم برنامه هفته نود", role: "program_team", programId: insertedPrograms[1].id, createdAt: minsAgo(8000) },
  ]).run();

  const adminRows = db.select().from(adminUsers).all();
  const central = adminRows.find((a) => a.role === "central_content")!;
  const team1 = adminRows.find((a) => a.username === "team_football")!;
  const team2 = adminRows.find((a) => a.username === "team_90")!;

  /* --- رویدادهای ورزشی --- */
  const events = db.insert(sportEvents).values([
    { title: "پرسپولیس - استقلال", league: "لیگ برتر خلیج فارس", homeTeam: "پرسپولیس", awayTeam: "استقلال", status: "live", startTime: daysFromNow(0, 19), homeScore: 1, awayScore: 1, stadium: "آزادی", isHot: true },
    { title: "تراکتور - سپاهان", league: "لیگ برتر خلیج فارس", homeTeam: "تراکتور", awayTeam: "سپاهان", status: "upcoming", startTime: daysFromNow(1, 20), stadium: "سهند", isHot: true },
    { title: "ملوان - فولاد", league: "لیگ برتر خلیج فارس", homeTeam: "ملوان", awayTeam: "فولاد", status: "upcoming", startTime: daysFromNow(2, 18), stadium: "سردار جنگل" },
    { title: "رئال مادرید - بارسلونا", league: "لالیگا", homeTeam: "رئال مادرید", awayTeam: "بارسلونا", status: "upcoming", startTime: daysFromNow(3, 23), stadium: "سانتیاگو برنابئو", isHot: true },
    { title: "بایرن مونیخ - دورتموند", league: "بوندسلیگا", homeTeam: "بایرن مونیخ", awayTeam: "دورتموند", status: "upcoming", startTime: daysFromNow(4, 21), stadium: "آلیانز آرنا" },
  ]).returning().all();

  /* --- بازی‌ها: هر سه نوع، در وضعیت‌های مختلف --- */

  // ۱) بازی برنامه‌ای — منتشرشده (انتشار مستقیم بدون تایید)
  const g1 = db.insert(games).values({
    title: "کوییز برنامه فوتبال شب", description: "همزمان با پخش زنده برنامه، به سؤالات پاسخ بده و امتیاز بگیر!",
    gameType: "program", status: "published", programId: insertedPrograms[0].id,
    prize: "۵۰۰ سکه", startsAt: daysFromNow(0, 20), endsAt: daysFromNow(0, 23),
    createdById: team1.id, publishedAt: daysFromNow(-1, 18), createdAt: minsAgo(6000),
  }).returning().all()[0];
  db.insert(gameQuestions).values([
    { gameId: g1.id, orderIndex: 0, questionType: "multiple_choice", text: "قهرمان لیگ برتر فصل گذشته کدام تیم بود؟", options: JSON.stringify(["پرسپولیس", "استقلال", "تراکتور", "سپاهان"]), correctOption: 0, points: 100 },
    { gameId: g1.id, orderIndex: 1, questionType: "true_false", text: "استقلال در ۵ بازی اخیر شکست نخورده است.", options: JSON.stringify(["درست", "غلط"]), correctOption: 0, points: 100 },
    { gameId: g1.id, orderIndex: 2, questionType: "poll", text: "بهترین بازیکن هفته از نگاه شما؟", options: JSON.stringify(["بازیدور", "دباخ", "اصغری", "رحیمی"]), correctOption: null, points: 50 },
  ]).run();

  // ۲) بازی برنامه‌ای — پیش‌نویس
  db.insert(games).values({
    title: "نظرسنجی هفته نود", description: "بهترین گل هفته را انتخاب کنید.",
    gameType: "program", status: "draft", programId: insertedPrograms[1].id,
    startsAt: daysFromNow(1, 21), endsAt: daysFromNow(2, 21),
    createdById: team2.id, createdAt: minsAgo(120),
  }).run();

  // ۳) بازی عمومی — منتشرشده (کوییز روزانه)
  const g3 = db.insert(games).values({
    title: "کوییز روزانه ورزشی", description: "هر روز ۳ سؤال، امتیاز ثابت در لیدربورد یکپارچه.",
    gameType: "general", status: "published",
    startsAt: daysFromNow(0, 0), endsAt: daysFromNow(1, 0),
    createdById: central.id, publishedAt: daysFromNow(0, 8), createdAt: minsAgo(720),
  }).returning().all()[0];
  db.insert(gameQuestions).values([
    { gameId: g3.id, orderIndex: 0, questionType: "multiple_choice", text: "کدام کشور میزبان مشترک جام جهانی ۲۰۲۶ است؟", options: JSON.stringify(["آمریکا، کانادا و مکزیک", "قطر", "روسیه", "اسپانیا"]), correctOption: 0, points: 100 },
    { gameId: g3.id, orderIndex: 1, questionType: "multiple_choice", text: "رکورد بیشترین گل در یک فصل لیگ برتر ایران متعلق به کیست؟", options: JSON.stringify(["کریم انصاری‌فرد", "مهدی طیبی", "علی دایی", "محمدرضا خلبان"]), correctOption: 2, points: 120 },
    { gameId: g3.id, orderIndex: 2, questionType: "true_false", text: "طول زمین فوتبال استاندارد حداکثر ۱۰۰ متر است.", options: JSON.stringify(["درست", "غلط"]), correctOption: 0, points: 80 },
  ]).run();

  // ۴) بازی رویدادی — در انتظار تایید (پیش‌بینی نتیجه داربی)
  const g4 = db.insert(games).values({
    title: "پیش‌بینی نتیجه داربی تهران", description: "نتیجه نهایی پرسپولیس - استقلال را پیش‌بینی کن.",
    gameType: "event", status: "pending", eventId: events[0].id,
    prize: "۱۰۰۰ سکه", startsAt: daysFromNow(0, 12), endsAt: daysFromNow(0, 19),
    createdById: central.id, createdAt: minsAgo(90),
  }).returning().all()[0];
  db.insert(gameQuestions).values([
    { gameId: g4.id, orderIndex: 0, questionType: "multiple_choice", text: "نتیجه نهایی بازی چه خواهد بود؟", options: JSON.stringify(["برد پرسپولیس", "تساوی", "برد استقلال"]), correctOption: null, points: 200 },
  ]).run();

  // ۵) بازی رویدادی — رد شده
  db.insert(games).values({
    title: "پیش‌بینی کارت‌های بازی (آزمایشی)", gameType: "event", status: "rejected",
    eventId: events[1].id, createdById: central.id, createdAt: minsAgo(500),
  }).run();

  // ۶) کوییز «حدس بازیکن» — عمومی، منتشرشده
  const g6 = db.insert(games).values({
    title: "حدس بازیکن فوتبالی", description: "چهار سؤال از اسطوره‌های فوتبال — چقدر حافظه‌ات قوی است؟",
    gameType: "general", status: "published",
    prize: "۳۰۰ سکه", startsAt: daysFromNow(-1, 10), endsAt: daysFromNow(5, 23),
    createdById: central.id, publishedAt: minsAgo(700), createdAt: minsAgo(720),
  }).returning().all()[0];
  db.insert(gameQuestions).values([
    { gameId: g6.id, orderIndex: 0, questionType: "multiple_choice", text: "کدام بازیکن «پادشاه» فوتبال ایران لقب گرفته است؟", options: JSON.stringify(["فرهاد ماجدی", "علی دایی", "علی کریمی", "مهدی مهدوی‌کیا"]), correctOption: 1, points: 100 },
    { gameId: g6.id, orderIndex: 1, questionType: "multiple_choice", text: "علی کریمی در کدام تیم اروپایی بازی کرد؟", options: JSON.stringify(["اینتر میلان", "چلسی", "بایرن مونیخ", "یوونتوس"]), correctOption: 2, points: 100 },
    { gameId: g6.id, orderIndex: 2, questionType: "multiple_choice", text: "تا پیش از رونالدو، رکورد گل ملی در فوتبال جهان از آنِ کی بود؟", options: JSON.stringify(["پله", "کلوچه", "علی دایی", "فوشت"]), correctOption: 2, points: 120 },
    { gameId: g6.id, orderIndex: 3, questionType: "true_false", text: "مهدی مهدوی‌کیا بهترین بازیکن فوتبال آسیا در سال ۲۰۰۳ شد.", options: JSON.stringify(["درست", "غلط"]), correctOption: 0, points: 80 },
  ]).run();

  // ۷) «درست یا غلط ورزشی» — عمومی، منتشرشده
  const g7 = db.insert(games).values({
    title: "درست یا غلط ورزشی", description: "چهار جمله — درست است یا غلط؟ سریع تصمیم بگیر!",
    gameType: "general", status: "published",
    prize: "۲۰۰ سکه", startsAt: daysFromNow(-1, 10), endsAt: daysFromNow(6, 23),
    createdById: central.id, publishedAt: minsAgo(600), createdAt: minsAgo(620),
  }).returning().all()[0];
  db.insert(gameQuestions).values([
    { gameId: g7.id, orderIndex: 0, questionType: "true_false", text: "هر تیم در واترپلو با ۷ بازیکن در آب حضور دارد.", options: JSON.stringify(["درست", "غلط"]), correctOption: 0, points: 100, timeLimitSeconds: 15 },
    { gameId: g7.id, orderIndex: 1, questionType: "true_false", text: "در NBA خط سه‌امتیازی از FIBA دورتر است.", options: JSON.stringify(["درست", "غلط"]), correctOption: 0, points: 100, timeLimitSeconds: 15 },
    { gameId: g7.id, orderIndex: 2, questionType: "true_false", text: "جام جهانی فوتبال هر ۳ سال یک‌بار برگزار می‌شود.", options: JSON.stringify(["درست", "غلط"]), correctOption: 1, points: 100, timeLimitSeconds: 15 },
    { gameId: g7.id, orderIndex: 3, questionType: "true_false", text: "از ۱۹۹۴ المپیک زمستانی و تابستانی دو سال از هم فاصله دارند.", options: JSON.stringify(["درست", "غلط"]), correctOption: 0, points: 100, timeLimitSeconds: 15 },
  ]).run();

  // ۸) «نظرسنجی هفته» — عمومی، منتشرشده (فقط نظرسنجی بدون پاسخ صحیح)
  const g8 = db.insert(games).values({
    title: "نظرسنجی هفته: بهترین لحظه", description: "نظرت را ثبت کن — همه شرکت‌کننده‌ها امتیاز می‌گیرند.",
    gameType: "general", status: "published",
    startsAt: daysFromNow(-1, 10), endsAt: daysFromNow(4, 23),
    createdById: central.id, publishedAt: minsAgo(400), createdAt: minsAgo(420),
  }).returning().all()[0];
  db.insert(gameQuestions).values([
    { gameId: g8.id, orderIndex: 0, questionType: "poll", text: "بهترین لحظه ورزشی این هفته از نگاه شما؟", options: JSON.stringify(["گل آخر لحظه داربی", "برد تیم ملی", "رکوردشکنی دو و میدانی", "صعود تیم محبوبم"]), correctOption: null, points: 60 },
    { gameId: g8.id, orderIndex: 1, questionType: "poll", text: "کدام مسابقه هفته آینده را حتماً می‌بینید؟", options: JSON.stringify(["کلاسیکوی اسپانیا", "لیگ برتر ایران", "دربی تهران", "لیگ قهرمانان اروپا"]), correctOption: null, points: 60 },
  ]).run();

  // ۹) «پیش‌بینی کلاسیکو» — رویدادی، منتشرشده (نتیجه دستی پس از بازی)
  const g9 = db.insert(games).values({
    title: "پیش‌بینی کلاسیکو", description: "رئال مادرید - بارسلونا: نتیجه و گلزن اول را پیش‌بینی کن. نتیجه پس از بازی توسط تیم مرکزی اعلام و امتیازها محاسبه می‌شود.",
    gameType: "event", status: "published", eventId: events[3].id,
    prize: "۱۰۰۰ سکه", startsAt: daysFromNow(0, 8), endsAt: daysFromNow(3, 22),
    createdById: central.id, publishedAt: minsAgo(300), createdAt: minsAgo(320),
  }).returning().all()[0];
  db.insert(gameQuestions).values([
    { gameId: g9.id, orderIndex: 0, questionType: "multiple_choice", text: "نتیجه نهایی بازی چه خواهد بود؟", options: JSON.stringify(["برد رئال مادرید", "تساوی", "برد بارسلونا"]), correctOption: null, points: 150 },
    { gameId: g9.id, orderIndex: 1, questionType: "multiple_choice", text: "اولین گل بازی را چه کسی می‌زند؟", options: JSON.stringify(["وینیسیوس جونیور", "کیلیان امباپه", "لامینه یامال", "رافینیا", "گل به خودی"]), correctOption: null, points: 100 },
  ]).run();

  /* --- وزن‌دهی مرکزی --- */
  db.insert(scoreWeights).values([
    { gameType: "program", maxPossibleRaw: 250, weight: 1.0 },
    { gameType: "general", maxPossibleRaw: 300, weight: 1.2 },
    { gameType: "event", maxPossibleRaw: 200, weight: 1.5 },
  ]).run();

  /* --- نشان‌ها --- */
  db.insert(badges).values([
    { code: "first_game", title: "قدم اول", description: "اولین بازی انجام شد", color: "#2ECC71", condition: "۱ بار شرکت در بازی" },
    { code: "five_games", title: "رقابت‌جو", description: "۵ بار شرکت در بازی", color: "#5B7FFF", condition: "۵ بار شرکت" },
    { code: "twenty_games", title: "حرفه‌ای", description: "۲۰ بار شرکت در بازی", color: "#E8B84B", condition: "۲۰ بار شرکت" },
    { code: "score_1000", title: "هزار امتیاز", description: "رسیدن به ۱۰۰۰ امتیاز", color: "#C9CDD3", condition: "۱۰۰۰ امتیاز" },
    { code: "score_5000", title: "اسطوره", description: "رسیدن به ۵۰۰۰ امتیاز", color: "#E23B3B", condition: "۵۰۰۰ امتیاز" },
  ]).run();

  /* --- کاربران دمو + مشارکت برای لیدربورد --- */
  const demoUsers = [
    { phone: "09120000001", name: "آرمان سرخابی" },
    { phone: "09120000002", name: "نیما شفیعی" },
    { phone: "09120000003", name: "سارا رضایی" },
    { phone: "09120000004", name: "محمد کاظمی" },
    { phone: "09120000005", name: "الهام نوری" },
    { phone: "09120000006", name: "رضا فتحی" },
    { phone: "09120000007", name: "مینا صادقی" },
    { phone: "09120000008", name: "حسین مرادی" },
  ];
  const scores = [920, 810, 705, 640, 520, 430, 310, 180];
  demoUsers.forEach((u, i) => {
    const user = db.insert(users).values({
      phone: u.phone, displayName: u.name, createdAt: minsAgo(20000 - i * 100),
    }).returning().all()[0];
    db.insert(gameParticipations).values({
      gameId: g3.id, userId: user.id,
      rawScore: Math.round(scores[i] / 1.2), weightedScore: scores[i],
      createdAt: minsAgo(600 - i * 30),
    }).run();
    db.update(users).set({
      points: scores[i], xp: Math.round(scores[i] * 0.5), coins: Math.round(scores[i] * 0.1),
      level: Math.max(1, Math.floor((scores[i] * 0.5) / 1000) + 1),
    }).where(eq(users.id, user.id)).run();
  });

  /* --- اخبار --- */
  db.insert(news).values([
    { title: "ترکیب احتمالی پرسپولیس مقابل استقلال اعلام شد", summary: "سرمربی پرسپولیس با یک تغییر نسبت به بازی قبل دروازه‌بان تیم را تغییر می‌دهد.", category: "football", isBreaking: true, status: "published", publishedAt: minsAgo(45), createdById: central.id, createdAt: minsAgo(60) },
    { title: "درگیری شدید قهرمانی در هفته‌های پایانی لیگ برتر", summary: "سه تیم هنوز شانس قهرمانی را دارند و هفته آینده تعیین‌کننده است.", category: "football", status: "published", publishedAt: minsAgo(240), createdById: central.id, createdAt: minsAgo(260) },
    { title: "پشت‌صحنه برنامه هفته نود؛ مصاحبه اختصاصی با بازیدور", summary: "مصاحبه‌ای که در برنامه شبکه ورزش پخش نشد، اینجا ببینید.", category: "program", programId: insertedPrograms[1].id, status: "published", publishedAt: minsAgo(600), createdById: central.id, createdAt: minsAgo(620) },
  ]).run();

  /* --- پخش زنده (وضعیت) --- */
  db.insert(liveEvents).values({
    title: "پخش زنده داربی تهران — با گزارش اختصاصی",
    hlsUrl: "/stream/placeholder.m3u8", status: "on_air",
    commentatorActive: true, delayBufferSeconds: 30, startedAt: minsAgo(75),
  }).run();

  /* --- اعلان نمونه --- */
  db.insert(notifications).values({
    title: "کوییز روزانه فعال شد!", body: "امروز ۳ سؤال جدید در کوییز روزانه منتظر شماست.",
    relatedType: "game", relatedId: g3.id, status: "sent", sentAt: minsAgo(120), createdById: central.id,
  }).run();

  seeded = true;
  console.log("[seed] ورزش پلاس — داده اولیه ساخته شد");
}
