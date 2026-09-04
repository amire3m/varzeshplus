import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

/**
 * آنالیز xG استاتیک از StatsBomb open-data (hudl/open-data)
 * ?match=3869685 (فینال WC2022) | 3943043 (فینال EURO2024)
 * خروجی سبک: شوت‌ها + تایم‌لاین xG تجمعی + ترکیب‌ها
 */

const META: Record<string, { home: string; away: string; hs: number; as: number; comp: string; date: string }> = {
  "3869685": { home: "آرژانتین", away: "فرانسه", hs: 3, as: 3, comp: "فینال جام جهانی ۲۰۲۲", date: "2022-12-18" },
  "3943043": { home: "اسپانیا", away: "انگلیس", hs: 2, as: 1, comp: "فینال یورو ۲۰۲۴", date: "2024-07-14" },
};

function loadJson(p: string) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mid = searchParams.get("match") || "3869685";
  const meta = META[mid];
  if (!meta) return NextResponse.json({ success: false, error: "مسابقه نامعتبر" }, { status: 400 });
  try {
    const dir = path.join(process.cwd(), "src", "lib", "football", "data", "statsbomb");
    const events = loadJson(path.join(dir, `${mid}-events.json`));
    const lineups = loadJson(path.join(dir, `${mid}-lineups.json`));

    const shots: Array<{ minute: number; team: string; player: string; x: number; y: number; outcome: string; xg: number }> = [];
    for (const e of events) {
      if (e.type?.name !== "Shot") continue;
      let [x, y] = e.location ?? [0, 0];
      // نرمال‌سازی جهت حمله: نیمه دوم/وقت‌های زوج آینه‌ای
      if ([2, 4].includes(e.period)) { x = 120 - x; y = 80 - y; }
      shots.push({
        minute: e.minute ?? 0,
        team: e.team?.name ?? "",
        player: e.player?.name ?? "",
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        outcome: e.shot?.outcome?.name ?? "",
        xg: e.shot?.statsbomb_xg ?? 0,
      });
    }
    shots.sort((a, b) => a.minute - b.minute);

    // تایم‌لاین xG تجمعی
    let hXg = 0, aXg = 0;
    const homeName = lineups[0]?.team_name ?? "";
    const timeline: Array<{ minute: number; home: number; away: number }> = [{ minute: 0, home: 0, away: 0 }];
    for (const s of shots) {
      if (s.team === homeName) hXg += s.xg; else aXg += s.xg;
      timeline.push({ minute: s.minute, home: +hXg.toFixed(2), away: +aXg.toFixed(2) });
    }

    const teams = lineups.map((t: any) => ({
      name: t.team_name,
      formation: t.formation,
      starters: (t.lineup ?? []).map((p: any) => ({
        name: p.player_name, number: p.jersey_number,
        position: Array.isArray(p.positions) && p.positions[0] ? p.positions[0].position : "",
      })),
    }));

    return NextResponse.json({
      success: true,
      meta: { ...meta, matchId: mid },
      totals: {
        homeXg: +hXg.toFixed(2), awayXg: +aXg.toFixed(2),
        homeShots: shots.filter((s) => s.team === homeName).length,
        awayShots: shots.filter((s) => s.team !== homeName).length,
      },
      shots, timeline, teams,
      source: "StatsBomb Open Data (hudl/open-data)",
    });
  } catch {
    return NextResponse.json({ success: false, error: "خطای سرور" }, { status: 500 });
  }
}
