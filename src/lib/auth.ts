import { db } from "@/db";
import { sessions, users, otpCodes, adminUsers, auditLogs } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_COOKIE = "vp_session";
const ADMIN_COOKIE = "vp_admin_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // ۳۰ روز

export function nowISO() {
  return new Date().toISOString();
}

export function hashPassword(password: string, salt?: string) {
  const s = salt ?? crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, s, 32).toString("hex");
  return `${s}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const check = crypto.scryptSync(password, salt, 32).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(check, "hex"));
}

/* ---------- OTP کاربر عادی ---------- */
// لایه SMS قابل تعویض: در dev کد در پاسخ API برمی‌گردد.
// برای اتصال واقعی، تابع sendSms را به سرویس داخلی (کاوه‌نگار و مشابه) وصل کنید.
export async function sendSms(phone: string, code: string) {
  if (process.env.SMS_API_KEY && process.env.SMS_URL) {
    try {
      await fetch(process.env.SMS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receptor: phone, message: `کد ورود ورزش پلاس: ${code}` }),
      });
      return { delivered: true, devCode: null as string | null };
    } catch {
      // fallback به dev
    }
  }
  console.log(`[OTP] ${phone} => ${code}`);
  return { delivered: false, devCode: code };
}

export async function createOtp(phone: string) {
  const code = String(Math.floor(10000 + Math.random() * 90000));
  const expiresAt = new Date(Date.now() + 3 * 60 * 1000).toISOString();
  db.insert(otpCodes).values({ phone, code, expiresAt, createdAt: nowISO() }).run();
  return sendSms(phone, code);
}

export function verifyOtp(phone: string, code: string) {
  const row = db
    .select()
    .from(otpCodes)
    .where(and(eq(otpCodes.phone, phone), eq(otpCodes.code, code), eq(otpCodes.consumed, false), gt(otpCodes.expiresAt, nowISO())))
    .limit(1)
    .all()[0];
  if (!row) return false;
  db.update(otpCodes).set({ consumed: true }).where(eq(otpCodes.id, row.id)).run();
  return true;
}

/* ---------- نشست‌ها ---------- */

function createSession(kind: "user" | "admin", userId: number, adminId?: number) {
  const id = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  db.insert(sessions).values({ id, userId, kind, adminId: adminId ?? null, expiresAt, createdAt: nowISO() }).run();
  return { id, expiresAt };
}

export async function loginUser(phone: string) {
  let user = db.select().from(users).where(eq(users.phone, phone)).limit(1).all()[0];
  if (!user) {
    const last4 = phone.slice(-4);
    const result = db
      .insert(users)
      .values({
        phone,
        displayName: `کاربر ${last4}`,
        createdAt: nowISO(),
      })
      .returning()
      .all();
    user = result[0];
  }
  if (user.isBanned) return null;
  const session = createSession("user", user.id);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, session.id, { httpOnly: true, sameSite: "lax", path: "/", expires: new Date(session.expiresAt) });
  return user;
}

export async function getCurrentUser() {
  const jar = await cookies();
  const sid = jar.get(SESSION_COOKIE)?.value;
  if (!sid) return null;
  const session = db.select().from(sessions).where(and(eq(sessions.id, sid), eq(sessions.kind, "user"), gt(sessions.expiresAt, nowISO()))).limit(1).all()[0];
  if (!session) return null;
  return db.select().from(users).where(eq(users.id, session.userId)).limit(1).all()[0] ?? null;
}

export async function loginAdmin(username: string, password: string) {
  const admin = db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1).all()[0];
  if (!admin || !admin.isActive || !verifyPassword(password, admin.passwordHash)) return null;
  const session = createSession("admin", 0, admin.id);
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, session.id, { httpOnly: true, sameSite: "lax", path: "/", expires: new Date(session.expiresAt) });
  db.insert(auditLogs).values({
    actorType: "admin", actorId: admin.id, actorName: admin.fullName,
    action: "login", entityType: "admin_user", entityId: admin.id,
    programId: admin.programId, timestamp: nowISO(),
  }).run();
  return admin;
}

export async function getCurrentAdmin() {
  const jar = await cookies();
  const sid = jar.get(ADMIN_COOKIE)?.value;
  if (!sid) return null;
  const session = db.select().from(sessions).where(and(eq(sessions.id, sid), eq(sessions.kind, "admin"), gt(sessions.expiresAt, nowISO()))).limit(1).all()[0];
  if (!session?.adminId) return null;
  return db.select().from(adminUsers).where(eq(adminUsers.id, session.adminId)).limit(1).all()[0] ?? null;
}

export async function logout(kind: "user" | "admin") {
  const jar = await cookies();
  const name = kind === "admin" ? ADMIN_COOKIE : SESSION_COOKIE;
  const sid = jar.get(name)?.value;
  if (sid) db.delete(sessions).where(eq(sessions.id, sid)).run();
  jar.delete(name);
}

export function maskPhone(phone: string) {
  return phone.length >= 7 ? `${phone.slice(0, 4)}***${phone.slice(-3)}` : phone;
}
