// دانلود یک‌باره دیتای openfootball/football.json (فصول ۲۰۲۰ تا ۲۰۲۶)
// اجرا: node scripts/download-football.js   (فقط یک‌بار — با VPN)
const fs = require("fs");
const path = require("path");

const LEAGUES = [
  { slug: "premier-league", file: "en.1.json" },
  { slug: "bundesliga", file: "de.1.json" },
  { slug: "la-liga", file: "es.1.json" },
  { slug: "serie-a", file: "it.1.json" },
  { slug: "ligue-1", file: "fr.1.json" },
  { slug: "eredivisie", file: "nl.1.json" },
  { slug: "primeira-liga", file: "pt.1.json" },
  { slug: "super-lig", file: "tr.1.json" },
];

const SEASONS = ["2020-21", "2021-22", "2022-23", "2023-24", "2024-25", "2025-26", "2026-27"];

const OUT = path.join(__dirname, "..", "src", "lib", "football", "data");
const BASE = "https://raw.githubusercontent.com/openfootball/football.json/master";

async function download(url, outPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const text = await res.text();
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, text, "utf8");
  return text.length;
}

(async () => {
  let ok = 0, fail = 0;
  for (const lg of LEAGUES) {
    for (const season of SEASONS) {
      const url = `${BASE}/${season}/${lg.file}`;
      const out = path.join(OUT, season, lg.file);
      try {
        const bytes = await download(url, out);
        console.log(`✓ ${season}/${lg.file} (${(bytes / 1024).toFixed(0)} KB)`);
        ok++;
      } catch (e) {
        console.log(`✗ ${season}/${lg.file} — ${e.message}`);
        fail++;
      }
    }
  }
  console.log(`\nDone: ${ok} ok, ${fail} fail → ${OUT}`);
  if (fail) process.exitCode = 1;
})();
