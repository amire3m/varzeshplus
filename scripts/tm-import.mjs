/**
 * Transfermarkt datasets → local.db importer
 * دانلود CSVهای players / transfers / player_valuations / clubs / competitions
 * فیلتر به ۱۲ لیگ پروژه + import به جداول tm_*
 * اجرا: node scripts/tm-import.mjs
 */
import fs from "fs";
import zlib from "zlib";
import path from "path";
import { execSync } from "node:child_process";
import Papa from "papaparse";
import Database from "better-sqlite3";

const BASE = "https://pub-e682421888d945d684bcae8890b0ec20.r2.dev/data/";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
const OUR_COMPETITIONS = ["GB1", "ES1", "IT1", "L1", "FR1", "NL1", "PO1", "TR1", "SA1", "BR1", "US1", "IR1"];
const TMP = "/tmp/tm-data";
const DB_PATH = path.join(process.cwd(), "local.db");

fs.mkdirSync(TMP, { recursive: true });
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

function download(name) {
  const file = path.join(TMP, name);
  if (fs.existsSync(file) && fs.statSync(file).size > 1000) {
    console.log(`[skip] ${name} از قبل هست`);
    return file;
  }
  console.log(`[dl] ${name} ...`);
  execSync(`curl -sL -A "${UA}" -o "${file}" "${BASE}${name}"`, { stdio: "inherit" });
  return file;
}

function readCsv(name) {
  const file = download(name);
  const gz = fs.readFileSync(file);
  const text = zlib.gunzipSync(gz).toString("utf8");
  const res = Papa.parse(text, { header: true, skipEmptyLines: true, transformHeader: (h) => h.trim() });
  console.log(`[csv] ${name}: ${res.data.length} rows, cols=${Object.keys(res.data[0] || {}).join(",")}`);
  return res.data;
}

const num = (v) => (v === "" || v === null || v === undefined ? null : Number(v));

async function main() {
  const comps = readCsv("competitions.csv.gz");
  const clubs = readCsv("clubs.csv.gz");
  const players = readCsv("players.csv.gz");
  const transfers = readCsv("transfers.csv.gz");
  const valuations = readCsv("player_valuations.csv.gz");

  const ourCodes = new Set(OUR_COMPETITIONS);
  const ourComps = comps.filter((c) => ourCodes.has(c.competition_id));
  console.log("\n=== competitions match ===");
  for (const c of ourComps) console.log(`  ${c.competition_id}: ${c.name}`);

  const clubCol = (r) => r.domestic_competition_id ?? r.domestic_league_code;
  const ourClubs = clubs.filter((c) => ourCodes.has(clubCol(c)));
  const ourClubIds = new Set(ourClubs.map((c) => String(c.club_id)));
  console.log(`\nclubs in our leagues: ${ourClubs.length}`);

  // players — ستون club فعلی ممکن است club_id یا current_club_id باشد
  const playerClub = (r) => r.current_club_id ?? r.club_id;
  const ourPlayers = players.filter((p) => ourClubIds.has(String(playerClub(p) ?? "")));
  const ourPlayerIds = new Set(ourPlayers.map((p) => String(p.player_id)));
  console.log(`players in our clubs: ${ourPlayers.length}`);

  // transfers — از/به هر کدام در لیگ‌های ما، پنجره ۲۰۲۱+
  const ourTransfers = transfers.filter((t) => {
    const yr = Number(t.transfer_window_year ?? (t.transfer_date || "").slice(0, 4));
    return yr >= 2021 && (ourClubIds.has(String(t.from_club_id)) || ourClubIds.has(String(t.to_club_id)));
  });
  console.log(`transfers (2021+, our clubs): ${ourTransfers.length}`);

  // valuations — فقط بازیکنان ما، ۲۰۲۲+
  const ourValuations = valuations.filter((v) => ourPlayerIds.has(String(v.player_id)) && String(v.date) >= "2022-01-01");
  console.log(`valuations (our players, 2022+): ${ourValuations.length}`);

  // ===== create + import =====
  const t0 = Date.now();
  db.exec(`DROP TABLE IF EXISTS tm_clubs; DROP TABLE IF EXISTS tm_players; DROP TABLE IF EXISTS tm_transfers; DROP TABLE IF EXISTS tm_valuations;`);
  db.exec(`
    CREATE TABLE tm_clubs (club_id INTEGER PRIMARY KEY, name TEXT, club_code TEXT, competition_id TEXT);
    CREATE TABLE tm_players (player_id INTEGER PRIMARY KEY, pretty_name TEXT, club_id INTEGER, position TEXT, sub_position TEXT, date_of_birth TEXT, height_in_cm INTEGER, foot TEXT, market_value_in_eur INTEGER, highest_market_value_in_eur INTEGER, contract_expiration_date TEXT, country_of_citizenship TEXT, image_url TEXT);
    CREATE TABLE tm_transfers (transfer_id INTEGER PRIMARY KEY, player_id INTEGER, player_name TEXT, transfer_date TEXT, from_club_id INTEGER, from_club_name TEXT, to_club_id INTEGER, to_club_name TEXT, transfer_fee TEXT, market_value_in_eur INTEGER, is_loan INTEGER);
    CREATE TABLE tm_valuations (player_id INTEGER, date TEXT, market_value_in_eur INTEGER, current_club_id INTEGER);
    CREATE INDEX idx_tm_players_club ON tm_players(club_id);
    CREATE INDEX idx_tm_transfers_to ON tm_transfers(to_club_id);
    CREATE INDEX idx_tm_transfers_from ON tm_transfers(from_club_id);
    CREATE INDEX idx_tm_players_name ON tm_players(pretty_name);
    CREATE INDEX idx_tm_val_player ON tm_valuations(player_id);
  `);

  const insClub = db.prepare(`INSERT OR REPLACE INTO tm_clubs VALUES (?,?,?,?,?)`);
  const insPlayer = db.prepare(`INSERT OR REPLACE INTO tm_players VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const insTransfer = db.prepare(`INSERT OR REPLACE INTO tm_transfers VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  const insVal = db.prepare(`INSERT INTO tm_valuations VALUES (?,?,?,?)`);

  db.transaction(() => {
    for (const c of ourClubs) insClub.run(num(c.club_id), c.name, c.club_code, clubCol(c));
    for (const p of ourPlayers) insPlayer.run(
      num(p.player_id), p.pretty_name ?? p.name, num(playerClub(p)),
      p.position ?? null, p.sub_position ?? null, p.date_of_birth ?? null,
      num(p.height_in_cm), p.foot ?? null, num(p.market_value_in_eur),
      num(p.highest_market_value_in_eur), p.contract_expiration_date ?? null,
      p.country_of_citizenship ?? null, p.image_url ?? null
    );
    for (const t of ourTransfers) insTransfer.run(
      num(t.transfer_id), num(t.player_id), t.player_name ?? null, t.transfer_date ?? null,
      num(t.from_club_id), t.from_club_name ?? null, num(t.to_club_id), t.to_club_name ?? null,
      t.transfer_fee ?? null, num(t.market_value_in_eur), t.is_loan ? 1 : 0
    );
    for (const v of ourValuations) insVal.run(num(v.player_id), v.date, num(v.market_value_in_eur), num(v.current_club_id ?? playerClub(v) ?? null));
  })();

  console.log(`\nimport done in ${Math.round((Date.now() - t0) / 1000)}s`);
  for (const t of ["tm_clubs", "tm_players", "tm_transfers", "tm_valuations"]) {
    console.log(`  ${t}: ${db.prepare(`SELECT COUNT(*) c FROM ${t}`).get().c}`);
  }

  // چاپ لیگ‌ها برای mapping دستی
  console.log("\n=== clubs per competition (برای mapping) ===");
  for (const code of OUR_COMPETITIONS) {
    const list = db.prepare(`SELECT club_id, name FROM tm_clubs WHERE competition_id=? ORDER BY name`).all(code);
    console.log(`\n[${code}] ${list.length}`);
    console.log(list.map((c) => `${c.club_id}|${c.name}`).join("\n"));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
