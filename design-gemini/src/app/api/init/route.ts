import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  matches,
  quizzes,
  videoChallenges,
  userProfiles,
  leaderboard,
  rewards,
  chatMessages,
  predictions,
} from "@/db/schema";
import { seedDatabase } from "@/db/seed";

export async function GET() {
  try {
    await seedDatabase();

    const allMatches = await db.select().from(matches);
    const allQuizzes = await db.select().from(quizzes);
    const allVideos = await db.select().from(videoChallenges);
    const users = await db.select().from(userProfiles);
    const allLeaderboard = await db.select().from(leaderboard);
    const allRewards = await db.select().from(rewards);
    const allChat = await db.select().from(chatMessages);
    const userPredictions = await db.select().from(predictions);

    return NextResponse.json({
      success: true,
      data: {
        matches: allMatches,
        quizzes: allQuizzes,
        videoChallenges: allVideos,
        user: users[0] || null,
        leaderboard: allLeaderboard,
        rewards: allRewards,
        chatMessages: allChat,
        userPredictions,
      },
    });
  } catch (error: any) {
    console.error("API init error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to initialize data" },
      { status: 500 }
    );
  }
}
