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
import { createReadStream } from "node:fs";
import Papa from "papaparse";
import Database from "better-sqlite3";

const BASE = "https://pub-e682421888d945d684bcae8890b0ec20.r2.dev/data/";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
const OUR_COMPETITIONS = ["GB1", "ES1", "IT1", "L1", "FR1", "NL1", "PO1", "TR1", "SA1", "BRA1", "MLS1"];
const TMP = process.platform === "win32" ? "C:\\tmp\\tm-data" : "/tmp/tm-data";
const DB_PATH = path.join(process.cwd(), "local.db");
const MIN_DATE = "2021-07-01"; // پنجره داده: ۵ فصل اخیر

fs.mkdirSync(TMP, { recursive: true });
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("cache_size = -64000");

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

/** استریم CSV.gz — برای فایل‌های بزرگ (appearances/events/lineups/games) */
function streamCsv(name, onRow) {
  const file = download(name);
  return new Promise((resolve, reject) => {
    let count = 0;
    Papa.parse(createReadStream(file).pipe(zlib.createGunzip()), {
      header: true, skipEmptyLines: true, transformHeader: (h) => h.trim(),
      chunk: (res) => {
        for (const row of res.data) { count++; onRow(row); }
      },
      complete: () => { console.log(`[stream] ${name}: ${count} rows`); resolve(count); },
      error: reject,
    });
  });
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

  const playerClub = (r) => r.current_club_id ?? r.club_id;
  const ourPlayers = players.filter((p) => ourClubIds.has(String(playerClub(p) ?? "")));
  const ourPlayerIds = new Set(ourPlayers.map((p) => String(p.player_id)));
  console.log(`players in our clubs: ${ourPlayers.length}`);

  const ourTransfers = transfers.filter((t) => {
    const yr = Number(t.transfer_window_year ?? (t.transfer_date || "").slice(0, 4));
    return yr >= 2021 && (ourClubIds.has(String(t.from_club_id)) || ourClubIds.has(String(t.to_club_id)));
  });
  console.log(`transfers (2021+, our clubs): ${ourTransfers.length}`);

  const ourValuations = valuations.filter((v) => ourPlayerIds.has(String(v.player_id)) && String(v.date) >= "2022-01-01");
  console.log(`valuations (our players, 2022+): ${ourValuations.length}`);

  // ===== create + import =====
  const t0 = Date.now();
  db.exec(`DROP TABLE IF EXISTS tm_clubs; DROP TABLE IF EXISTS tm_players; DROP TABLE IF EXISTS tm_transfers; DROP TABLE IF EXISTS tm_valuations;
DROP TABLE IF EXISTS tm_games; DROP TABLE IF EXISTS tm_club_games; DROP TABLE IF EXISTS tm_appearances; DROP TABLE IF EXISTS tm_events; DROP TABLE IF EXISTS tm_lineups;`);
  db.exec(`
    CREATE TABLE tm_clubs (club_id INTEGER PRIMARY KEY, name TEXT, club_code TEXT, competition_id TEXT);
    CREATE TABLE tm_players (player_id INTEGER PRIMARY KEY, pretty_name TEXT, club_id INTEGER, position TEXT, sub_position TEXT, date_of_birth TEXT, height_in_cm INTEGER, foot TEXT, market_value_in_eur INTEGER, highest_market_value_in_eur INTEGER, contract_expiration_date TEXT, country_of_citizenship TEXT, image_url TEXT);
    CREATE TABLE tm_transfers (player_id INTEGER, transfer_date TEXT, from_club_id INTEGER, from_club_name TEXT, to_club_id INTEGER, to_club_name TEXT, transfer_fee TEXT, market_value_in_eur INTEGER, player_name TEXT);
    CREATE TABLE tm_valuations (player_id INTEGER, date TEXT, market_value_in_eur INTEGER, current_club_id INTEGER);
    CREATE TABLE tm_games (game_id INTEGER PRIMARY KEY, competition_id TEXT, season INTEGER, round TEXT, date TEXT, home_club_id INTEGER, away_club_id INTEGER, home_goals INTEGER, away_goals INTEGER, stadium TEXT, attendance INTEGER, status TEXT);
    CREATE TABLE tm_club_games (game_id INTEGER, club_id INTEGER, opponent_id INTEGER, home INTEGER, own_goals INTEGER, opponent_goals INTEGER, points INTEGER, UNIQUE(game_id, club_id));
    CREATE TABLE tm_appearances (appearance_id TEXT PRIMARY KEY, game_id INTEGER, player_id INTEGER, player_club_id INTEGER, competition_id TEXT, date TEXT, goals INTEGER, assists INTEGER, minutes_played INTEGER, yellow_cards INTEGER, red_cards INTEGER);
    CREATE TABLE tm_events (game_id INTEGER, date TEXT, minute TEXT, type TEXT, player_id INTEGER, player_name TEXT, assist_id INTEGER, assist_name TEXT, description TEXT);
    CREATE TABLE tm_lineups (game_id INTEGER, date TEXT, club_id INTEGER, player_id INTEGER, player_name TEXT, is_starting INTEGER, position TEXT, jersey_number INTEGER, UNIQUE(game_id, player_id));
    CREATE INDEX idx_tm_players_club ON tm_players(club_id);
    CREATE INDEX idx_tm_transfers_to ON tm_transfers(to_club_id);
    CREATE INDEX idx_tm_transfers_from ON tm_transfers(from_club_id);
    CREATE INDEX idx_tm_players_name ON tm_players(pretty_name);
    CREATE INDEX idx_tm_val_player ON tm_valuations(player_id);
    CREATE INDEX idx_tm_games_comp ON tm_games(competition_id, season);
    CREATE INDEX idx_tm_games_home ON tm_games(home_club_id);
    CREATE INDEX idx_tm_games_away ON tm_games(away_club_id);
    CREATE INDEX idx_tm_cg_club ON tm_club_games(club_id);
    CREATE INDEX idx_tm_ap_player ON tm_appearances(player_id);
    CREATE INDEX idx_tm_ap_comp ON tm_appearances(competition_id);
    CREATE INDEX idx_tm_ev_game ON tm_events(game_id);
    CREATE INDEX idx_tm_lu_game ON tm_lineups(game_id);
  `);

  const insClub = db.prepare(`INSERT OR REPLACE INTO tm_clubs VALUES (?,?,?,?)`);
  const insPlayer = db.prepare(`INSERT OR REPLACE INTO tm_players VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const insTransfer = db.prepare(`INSERT INTO tm_transfers VALUES (?,?,?,?,?,?,?,?,?)`);
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
      num(t.player_id), t.transfer_date ?? null,
      num(t.from_club_id), t.from_club_name ?? null, num(t.to_club_id), t.to_club_name ?? null,
      t.transfer_fee ?? null, num(t.market_value_in_eur), t.player_name ?? null
    );
    for (const v of ourValuations) insVal.run(num(v.player_id), v.date, num(v.market_value_in_eur), num(v.current_club_id ?? playerClub(v) ?? null));
  })();

  console.log(`[phase1] core tables done in ${Math.round((Date.now() - t0) / 1000)}s`);

  // ===== فاز ۲-۳: استریم جداول بزرگ (فیلتر با بازی‌های لیگ‌های ما) =====
  // پاس اول: games — همه بازی‌های ۱۱ لیگ ما از 2021-07
  const insGame = db.prepare(`INSERT OR REPLACE INTO tm_games VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
  const ourGameIds = new Set();
  await streamCsv("games.csv.gz", (g) => {
    if (!ourCodes.has(g.competition_id)) return;
    if (!(g.date >= MIN_DATE)) return;
    ourGameIds.add(String(g.game_id));
    insGame.run(num(g.game_id), g.competition_id, num(g.season), g.round ?? null, g.date ?? null,
      num(g.home_club_id), num(g.away_club_id), num(g.home_goals), num(g.away_goals),
      g.stadium ?? null, num(g.attendance), g.status ?? null);
  });
  console.log(`tm_games imported: ${ourGameIds.size}`);

  // club_games — فیلتر با بازی‌های ما
  const insCG = db.prepare(`INSERT OR IGNORE INTO tm_club_games VALUES (?,?,?,?,?,?,?)`);
  let cgCount = 0;
  await streamCsv("club_games.csv.gz", (cg) => {
    if (!ourGameIds.has(String(cg.game_id))) return;
    insCG.run(num(cg.game_id), num(cg.club_id), num(cg.opponent_id), cg.hosting === "Home" ? 1 : 0,
      num(cg.own_goals), num(cg.opponent_goals), num(cg.points));
    cgCount++;
  });
  console.log(`tm_club_games imported: ${cgCount}`);

  // appearances — فیلتر competition + date (بهینه: insert مستقیم + WAL، بدون تراکنش دستی)
  const insAp = db.prepare(`INSERT OR REPLACE INTO tm_appearances VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
  let apCount = 0;
  await streamCsv("appearances.csv.gz", (a) => {
    if (!ourCodes.has(a.competition_id)) return;
    if (!(a.date >= MIN_DATE)) return;
    insAp.run(a.appearance_id, num(a.game_id), num(a.player_id), num(a.player_club_id),
      a.competition_id, a.date, num(a.goals), num(a.assists), num(a.minutes_played),
      num(a.yellow_cards), num(a.red_cards));
    apCount++;
  });
  console.log(`tm_appearances imported: ${apCount}`);

  // game_events — فیلتر با game_ids ما
  const insEv = db.prepare(`INSERT INTO tm_events VALUES (?,?,?,?,?,?,?,?,?)`);
  let evCount = 0;
  await streamCsv("game_events.csv.gz", (e) => {
    if (!ourGameIds.has(String(e.game_id))) return;
    insEv.run(num(e.game_id), e.date ?? null, e.minute ?? null, e.type ?? null,
      num(e.player_id), e.player_name ?? null, num(e.player_assist_id), e.player_assist_name ?? null,
      e.description ?? null);
    evCount++;
  });
  console.log(`tm_events imported: ${evCount}`);

  // game_lineups — فیلتر با game_ids ما
  const insLu = db.prepare(`INSERT OR IGNORE INTO tm_lineups VALUES (?,?,?,?,?,?,?,?)`);
  let luCount = 0;
  await streamCsv("game_lineups.csv.gz", (l) => {
    if (!ourGameIds.has(String(l.game_id))) return;
    insLu.run(num(l.game_id), l.date ?? null, num(l.club_id), num(l.player_id),
      l.player_name ?? null, num(l.is_starting), l.position ?? null, num(l.jersey_number));
    luCount++;
  });
  console.log(`tm_lineups imported: ${luCount}`);

  console.log(`\nALL IMPORT DONE in ${Math.round((Date.now() - t0) / 1000)}s`);
  for (const t of ["tm_clubs", "tm_players", "tm_transfers", "tm_valuations", "tm_games", "tm_club_games", "tm_appearances", "tm_events", "tm_lineups"]) {
    console.log(`  ${t}: ${db.prepare(`SELECT COUNT(*) c FROM ${t}`).get().c}`);
  }
  // فشرده‌سازی فایل DB
  db.exec("VACUUM");
  console.log("VACUUM done");
}

main().catch((e) => { console.error(e); process.exit(1); });
