import { NextResponse } from "next/server";
import { db } from "@/db";
import { games, gameQuestions, programs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { recordParticipation } from "@/lib/score";
import { rateLimit } from "@/lib/rate-limit";
import { seedDatabase } from "@/db/seed";

/* GET: جزئیات بازی + سؤالات (بدون پاسخ صحیح) */

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  seedDatabase();
  const { id } = await ctx.params;
  const gameId = Number(id);
  const game = db
    .select({
      id: games.id, title: games.title, description: games.description,
      gameType: games.gameType, prize: games.prize,
      startsAt: games.startsAt, endsAt: games.endsAt,
      programTitle: programs.title,
    })
    .from(games)
    .leftJoin(programs, eq(programs.id, games.programId))
    .where(eq(games.id, gameId))
    .limit(1)
    .all()[0];

  if (!game || game.gameType === undefined) {
    return NextResponse.json({ success: false, error: "بازی یافت نشد" }, { status: 404 });
  }
  if (!game) return NextResponse.json({ success: false, error: "بازی یافت نشد" }, { status: 404 });

  const questions = db
    .select({
      id: gameQuestions.id, questionType: gameQuestions.questionType,
      text: gameQuestions.text, options: gameQuestions.options,
      timeLimitSeconds: gameQuestions.timeLimitSeconds, points: gameQuestions.points,
      orderIndex: gameQuestions.orderIndex,
    })
    .from(gameQuestions)
    .where(eq(gameQuestions.gameId, gameId))
    .orderBy(gameQuestions.orderIndex)
    .all()
    .map((q) => ({ ...q, options: JSON.parse(q.options) as string[] }));

  return NextResponse.json({ success: true, game, questions });
}

/* POST: ثبت پاسخ‌ها و امتیازدهی — بدنه: { answers: [{questionId, selectedOption}] } */

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, error: "برای شرکت در بازی وارد شوید." }, { status: 401 });

  const rl = rateLimit(`play:${user.id}`, 12, 60_000);
  if (!rl.ok) return NextResponse.json({ success: false, error: "تعداد تلاش‌ها زیاد است، یک لحظه صبر کنید." }, { status: 429 });

  const { id } = await ctx.params;
  const gameId = Number(id);
  const body = await req.json().catch(() => ({}));
  const answers: Array<{ questionId: number; selectedOption: number | null }> = body.answers ?? [];

  const game = db.select().from(games).where(eq(games.id, gameId)).limit(1).all()[0];
  if (!game) return NextResponse.json({ success: false, error: "بازی یافت نشد" }, { status: 404 });
  if (game.status !== "published") return NextResponse.json({ success: false, error: "بازی فعال نیست" }, { status: 400 });

  const now = new Date().toISOString();
  if (game.startsAt && game.startsAt > now) return NextResponse.json({ success: false, error: "بازی هنوز شروع نشده" }, { status: 400 });
  if (game.endsAt && game.endsAt < now) return NextResponse.json({ success: false, error: "بازی به پایان رسیده" }, { status: 400 });

  const questions = db.select().from(gameQuestions).where(eq(gameQuestions.gameId, gameId)).all();
  const maxRaw = questions.reduce((s, q) => s + q.points, 0);

  let rawScore = 0;
  const results: Array<{ questionId: number; correct: boolean | null; correctOption: number | null }> = [];
  for (const q of questions) {
    const a = answers.find((x) => x.questionId === q.id);
    if (q.questionType === "poll" || q.correctOption === null) {
      // نظرسنجی: بدون پاسخ صحیح — امتیاز مشارکت
      if (a && a.selectedOption !== null && a.selectedOption !== undefined) rawScore += q.points;
      results.push({ questionId: q.id, correct: null, correctOption: null });
    } else if (a && a.selectedOption === q.correctOption) {
      rawScore += q.points;
      results.push({ questionId: q.id, correct: true, correctOption: q.correctOption });
    } else {
      results.push({ questionId: q.id, correct: false, correctOption: q.correctOption });
    }
  }

  const { weighted, isNew } = await recordParticipation({ userId: user.id, gameId, rawScore, maxRaw });

  return NextResponse.json({
    success: true,
    rawScore, maxRaw, weightedScore: weighted,
    isNewPersonalBest: isNew,
    results,
  });
}
