import { NextResponse } from "next/server";
import { db } from "@/db";
import { liveEvents, sportEvents, notifications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { seedDatabase } from "@/db/seed";
import { getCurrentUser } from "@/lib/auth";

/* وضعیت پخش زنده — پول توسط صفحه /live */

export async function GET() {
  seedDatabase();
  const live = db.select().from(liveEvents).orderBy(desc(liveEvents.startedAt)).limit(1).all()[0] ?? null;
  const liveMatch = db.select().from(sportEvents).where(eq(sportEvents.status, "live")).limit(1).all()[0] ?? null;
  const user = await getCurrentUser();
  const lastNotification = db.select().from(notifications).where(eq(notifications.status, "sent")).orderBy(desc(notifications.sentAt)).limit(1).all()[0] ?? null;

  return NextResponse.json({
    success: true,
    live: live ? {
      id: live.id, title: live.title, status: live.status,
      commentatorActive: live.commentatorActive, censorActive: live.censorActive,
      delayBufferSeconds: live.delayBufferSeconds, hlsUrl: live.hlsUrl,
    } : null,
    match: liveMatch,
    user: user ? { displayName: user.displayName } : null,
    lastNotification: lastNotification ? { title: lastNotification.title, body: lastNotification.body } : null,
  });
}
