import { NextResponse } from "next/server";
import { createOtp, verifyOtp, loginUser, getCurrentUser, logout } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { seedDatabase } from "@/db/seed";

export async function GET() {
  seedDatabase();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: true, user: null });
  return NextResponse.json({
    success: true,
    user: {
      id: user.id, displayName: user.displayName, phone: user.phone,
      points: user.points, coins: user.coins, xp: user.xp, level: user.level,
    },
  });
}

export async function POST(req: Request) {
  seedDatabase();
  const body = await req.json().catch(() => ({}));
  const action = body.action as string;

  if (action === "request-otp") {
    const phone = String(body.phone ?? "").trim();
    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json({ success: false, error: "شماره موبایل معتبر نیست (۰۹xxxxxxxxx)" }, { status: 400 });
    }
    const rl = rateLimit(`otp:${phone}`, 3, 5 * 60_000);
    if (!rl.ok) return NextResponse.json({ success: false, error: "درخواست بیش از حد. کمی بعد تلاش کنید." }, { status: 429 });
    const result = await createOtp(phone);
    return NextResponse.json({
      success: true,
      message: "کد تأیید ارسال شد.",
      // در محیط توسعه بدون سرویس SMS، کد برای تست برگردانده می‌شود
      devCode: result.devCode,
    });
  }

  if (action === "verify-otp") {
    const phone = String(body.phone ?? "").trim();
    const code = String(body.code ?? "").trim();
    const rl = rateLimit(`verify:${phone}`, 10, 10 * 60_000);
    if (!rl.ok) return NextResponse.json({ success: false, error: "تلاش بیش از حد مجاز." }, { status: 429 });
    if (!verifyOtp(phone, code)) {
      return NextResponse.json({ success: false, error: "کد نادرست یا منقضی شده است." }, { status: 401 });
    }
    const user = await loginUser(phone);
    if (!user) return NextResponse.json({ success: false, error: "حساب شما مسدود است." }, { status: 403 });
    return NextResponse.json({
      success: true,
      user: { id: user.id, displayName: user.displayName, points: user.points, coins: user.coins, xp: user.xp, level: user.level },
    });
  }

  if (action === "logout") {
    await logout("user");
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: "action نامعتبر" }, { status: 400 });
}
