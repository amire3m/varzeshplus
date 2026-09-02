import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

/** دیتای واقعی (victoryapp.ir + openfootball لوکال) */
export async function GET() {
  try {
    const p = path.join(process.cwd(), "src", "lib", "football", "data", "real-data.json");
    if (!fs.existsSync(p)) return NextResponse.json({ success: false }, { status: 404 });
    const data = JSON.parse(fs.readFileSync(p, "utf8"));
    return NextResponse.json({ success: true, ...data });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
