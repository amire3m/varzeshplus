import type { League, LineupEvent, LineupPlayer, Match, MatchLineup, MatchStats, MatchTimeline, NewsItem, PenaltyShot, Player, PlayerStat, Standing, Team, TeamForm, TimelineEvent, Transfer } from "./types";
import { LEAGUES, TEAMS } from "./leagues";
import { teamSquad } from "./squads";

/* ===== deterministic PRNG (mulberry32) so data is stable per id ===== */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = (seed: number) => rng(seed)();
const irand = (seed: number, min: number, max: number) => Math.floor(rand(seed) * (max - min + 1)) + min;

/* ===== STANDINGS ===== */
export const STANDINGS: Record<number, Standing[]> = {};
for (const lg of LEAGUES) {
  const teams = TEAMS.filter((t) => t.leagueId === lg.id);
  const rows: Standing[] = teams.map((t, i) => {
    const played = 34;
    const win = Math.max(1, 22 - i * 2 + (t.id % 3));
    const loss = Math.max(1, 2 + i * 2 - (t.id % 2));
    const draw = played - win - loss;
    const gf = 30 + win * 2 + (t.id % 7);
    const ga = 60 - win * 2 + (i % 5);
    return { teamId: t.id, played, win, draw, loss, gf, ga, pts: win * 3 + draw };
  }).sort((a, b) => (b.pts - a.pts) || ((b.gf - b.ga) - (a.gf - a.ga)));
  STANDINGS[lg.id] = rows;
}

/* ===== MATCHES ===== */
export const MATCHES: Match[] = [];
let mid = 0;
const matchDays = ["امروز ۱۸:۳۰", "امروز ۲۱:۰۰", "فردا ۱۷:۰۰", "شنبه", "یک‌شنبه"];
for (const lg of LEAGUES) {
  const teams = TEAMS.filter((t) => t.leagueId === lg.id);
  const played = 12;
  for (let i = 0; i < played; i++) {
    const a = teams[i % teams.length];
    const b = teams[(i + 3) % teams.length];
    const status: Match["status"] = i < 5 ? "finished" : i < 8 ? "live" : "upcoming";
    const minute = status === "live" ? irand(mid + i, 20, 85) : null;
    const hs = status === "finished" || status === "live" ? irand(mid + i * 7, 0, 4) : null;
    const as = status === "finished" || status === "live" ? irand(mid + i * 13, 0, 3) : null;
    MATCHES.push({
      id: ++mid, leagueId: lg.id, homeTeamId: a.id, awayTeamId: b.id,
      homeScore: hs, awayScore: as, status, minute,
      kickoff: matchDays[i % matchDays.length], matchweek: 34 - (i % 8),
      competition: lg.englishName, stadium: a.stadium,
    });
  }
}

/* ===== NEWS ===== */
const NEWS_POOL: Array<[string, string, string]> = [
  ["شکست سنگین در خانه؛ هواداران ناراضی", "تیم میزبان نتوانست انتظارات را برآورده کند و با یک نمایش ضعیف شکست خورد.", "بازی"],
  ["ستاره تیم در فهرست بهترین‌های هفته", "عملکرد درخشان این بازیکن بار دیگر مورد توجه کارشناسان قرار گرفت.", "ویژه"],
  ["درگیری تاکتیکی؛ مربی به دنبال راه‌حل", "سرمربی در نشست خبری از برنامه‌های جدید برای بازی پیش‌رو سخن گفت.", "تحلیل"],
  ["مصدومیت نگران‌کننده ستاره کلیدی", "آزمایش‌های پزشکی نشان می‌دهد این بازیکن چند هفته از میادین دور خواهد بود.", "اخبار"],
  ["گلزنی پیاپی مهاجم؛ رکورد جدید", "این مهاجم با گلی که به ثمر رساند، رکورد باشگاه را جابه‌جا کرد.", "بازی"],
];
export const NEWS: NewsItem[] = [];
let nid = 0;
for (const lg of LEAGUES) {
  const teams = TEAMS.filter((t) => t.leagueId === lg.id);
  for (let i = 0; i < 6; i++) {
    const team = teams[(i * 5) % teams.length];
    const [title, summary, tag] = NEWS_POOL[i % NEWS_POOL.length];
    NEWS.push({
      id: ++nid, leagueId: lg.id, teamId: i % 3 === 0 ? null : team.id,
      title: `${title} — ${team.name}`, summary, image: `https://picsum.photos/seed/n${nid}/900/500`,
      publishedAt: i === 0 ? "۱ ساعت پیش" : i === 1 ? "۳ ساعت پیش" : `${i * 4} ساعت پیش`, tag, hot: i < 3,
    });
  }
}

/* ===== TRANSFERS ===== */
export const TRANSFERS: Transfer[] = [];
let tid = 0;
for (const lg of LEAGUES) {
  const teams = TEAMS.filter((t) => t.leagueId === lg.id);
  for (let i = 0; i < 5; i++) {
    const from = teams[(i * 7) % teams.length];
    const to = teams[(i * 11 + 4) % teams.length];
    const rows = teamSquad(from.slug);
    const player = rows ? rows[i % rows.length][0] : `${from.name} بازیکن ${i + 1}`;
    const official = i % 2 === 0;
    TRANSFERS.push({
      id: ++tid, leagueId: lg.id, player,
      fromTeamId: from.id, toTeamId: to.id,
      fee: official ? `${irand(tid, 15, 80)} میلیون یورو` : null,
      type: i % 3 === 0 ? "loan" : i % 3 === 1 ? "permanent" : "free",
      date: ["امروز", "دیروز", "۲ روز پیش", "۱ هفته پیش", "۲ هفته پیش"][i],
      official, incoming: i % 2 === 0,
    });
  }
}

/* ===== STATS ===== */
const PLAYER_POOL = ["لیونل مسی", "کیلیان امباپه", "ارلینگ هالند", "محمد صلاح", "وینیسیوس جونیور", "هری کین", "کای هاورتس", "بوکایو ساکا", "کول پالمر", "الکساندر ایساک", "فیل فودن", "جود بلینگام", "کوین دی‌بروینه", "سونی", "مارتین اودگارد"];
export function topStats(leagueId: number, key: "goals" | "assists" | "clean"): PlayerStat[] {
  const teams = TEAMS.filter((t) => t.leagueId === leagueId);
  return Array.from({ length: 5 }, (_, i) => ({
    rank: i + 1,
    player: `${PLAYER_POOL[(leagueId * 3 + i) % PLAYER_POOL.length]} ${leagueId}`,
    teamId: teams[(i * 9) % teams.length].id,
    number: irand(leagueId * 10 + i, 7, 30),
    appearances: irand(leagueId + i, 12, 34),
    value: key === "goals" ? 20 - i - (leagueId % 3) : key === "assists" ? 14 - i : 12 - i,
  }));
}

/* ===== SQUADS — هویت واقعی هر تیم (ستاره‌های اختصاصی + ترکیب متمایز) ===== */
const STAR_SQUADS: Record<string, { GK: string[]; DF: string[]; MF: string[]; FW: string[] }> = {
  persepolis: { GK: ["الکسیس گندوز", "امیررضا رفیعی"], DF: ["حسین کنعانی‌زادگان", "گیورگی گولسیانی", "میلاد محمدی", "ایوب العملود"], MF: ["سروش رفیعی", "مسعود ریگی", "محمد خدابنده‌لو", "اوستون اورونوف"], FW: ["علی علیپور", "عیسی آل‌کثیر", "وحید امیری"] },
  esteghlal: { GK: ["سیدحسین حسینی", "محمدرضا خالدآبادی"], DF: ["روزبه چشمی", "رافائل سیلوا", "رامین رضاییان", "ابوالفضل جلالی"], MF: ["دیدیه اندونگ", "آرش رضاوند", "جلال‌الدین ماشاریپوف"], FW: ["مهرداد محمدی", "گوستاوو بلانکو", "آرمان رمضانی"] },
  sepahan: { GK: ["پیام نیازمند"], DF: ["محمد دانشگر", "امین حزباوی", "حسین گودرزی"], MF: ["محمد کریمی", "برایان دابو"], FW: ["کاوه رضایی", "رضا شکاری"] },
  tractor: { GK: ["علیرضا بیرانوند"], DF: ["شجاع خلیل‌زاده", "عارف آقاسی"], MF: ["مهدی ترابی", "ریکاردو آلوز"], FW: ["امیرحسین حسین‌زاده", "تومیسلاو اشترکالی"] },
  "al-hilal": { GK: ["یاسین بونو"], DF: ["کالیدو کولیبالی", "ژوآو کانسلو"], MF: ["روبن نوس", "سرگئی میلینکوویچ"], FW: ["الکساندر میتروویچ", "مالکوم"] },
  "al-nassr": { GK: ["بینتو"], DF: ["محمد سیماکان", "ایمرک لاپورت"], MF: ["مارسلو بروزویچ", "اوتاویو"], FW: ["کریستیانو رونالدو", "سادیو مانه"] },
};
const GK_POOL = ["آلیسون بکر", "ادرسون مورائس", "تیبو کورتوا", "مانوئل نویر", "یان اوبلاک", "جیانلوئیجی دوناروما", "تر اشتگن", "مایک مانیان", "امیر عابدزاده", "علیرضا بیرانوند", "سیدحسین حسینی", "پیام نیازمند"];
const DF_POOL = ["ویرجیل فن‌دایک", "سرخیو راموس", "رافائل واران", "مارکینیوس", "آنتونیو رودیگر", "ترنت الکساندر-آرنولد", "آشرف حکیمی", "ژوآو کانسلو", "داوید آلابا", "جان استونز", "کایل واکر", "اندی رابرتسون", "دنی کارواخال", "نصیر مزراوی", "محمدحسین کنعانی", "شجاع خلیل‌زاده"];
const MF_POOL = ["کوین دی‌بروینه", "جود بلینگام", "مارتین اودگارد", "فدریکو والورده", "انزو فرناندز", "دکلان رایس", "برناردو سیلوا", "پدری", "گاوی", "لوکا مودریچ", "تونی کروس", "کاسمیرو", "ایلکای گوندوگان", "مهدی ترابی", "سروش رفیعی", "ریکاردو آلوز"];
const FW_POOL = ["کیلیان امباپه", "ارلینگ هالند", "محمد صلاح", "وینیسیوس جونیور", "کول پالمر", "بوکایو ساکا", "سون هیونگ-مین", "الکساندر ایساک", "هری کین", "رافائل لیائو", "کریستیانو رونالدو", "لیونل مسی", "روبرت لواندوفسکی", "علی علیپور", "مهدی طارمی", "سردار آزمون"];
const NATS = ["ایرانی", "برزیلی", "آرژانتینی", "فرانسوی", "اسپانیایی", "ایتالیایی", "آلمانی", "هلندی", "انگلیسی", "پرتغالی", "اروگوئه‌ای", "کروات"];

function pickForTeam(pool: string[], teamId: number, count: number, offsetMul = 3): string[] {
  const out: string[] = [];
  const off = (teamId * 7) % pool.length;
  for (let i = 0; i < count; i++) out.push(pool[(off + i * offsetMul) % pool.length]);
  return out;
}

export function squadFor(team: Team): Player[] {
  const dedicated = teamSquad(team.slug);
  const rows = dedicated ?? fallbackSquadRows(team);
  const squad: Player[] = [];
  let pid = team.id * 100;
  rows.forEach((row, i) => {
    const [name, position, number, age, nationality] = row;
    squad.push({
      id: ++pid, teamId: team.id, name, number, position, age, nationality,
      appearances: irand(pid, 3, 32), starts: irand(pid + 1, 1, 28),
      goals: position === "FW" ? irand(pid + 2, 1, 14) : position === "MF" ? irand(pid + 2, 0, 6) : irand(pid + 2, 0, 3),
      assists: irand(pid + 3, 0, 9),
      yellowCards: irand(pid + 4, 0, 8), redCards: irand(pid + 5, 0, 2),
    });
  });
  return squad;
}

/** فقط برای تیم‌های بدون اسکواد اختصاصی — پول پایه با نام‌های واقعی */
function fallbackSquadRows(team: Team): [string, Player["position"], number, number, string][] {
  const out: [string, Player["position"], number, number, string][] = [];
  const gkNames = pickForTeam(GK_POOL, team.id, 2, 5);
  const dfNames = pickForTeam(DF_POOL, team.id, 5, 3);
  const mfNames = pickForTeam(MF_POOL, team.id, 5, 7);
  const fwNames = pickForTeam(FW_POOL, team.id, 4, 11);
  gkNames.forEach((n, i) => out.push([n, "GK", 1 + i * 11, irand(team.id * 3 + i, 23, 34), NATS[irand(team.id + i, 0, NATS.length - 1)]]));
  dfNames.forEach((n, i) => out.push([n, "DF", 2 + i * 3, irand(team.id * 5 + i, 21, 33), NATS[irand(team.id * 2 + i, 0, NATS.length - 1)]]));
  mfNames.forEach((n, i) => out.push([n, "MF", 8 + i * 2, irand(team.id * 7 + i, 21, 34), NATS[irand(team.id * 3 + i, 0, NATS.length - 1)]]));
  fwNames.forEach((n, i) => out.push([n, "FW", 9 + i * 3, irand(team.id * 11 + i, 20, 33), NATS[irand(team.id * 4 + i, 0, NATS.length - 1)]]));
  return out;
}

/* ===== TEAM FORM ===== */
export function formFor(team: Team): TeamForm[] {
  const leagueTeams = TEAMS.filter((t) => t.leagueId === team.leagueId).filter((t) => t.id !== team.id);
  return Array.from({ length: 5 }, (_, i) => {
    const opponent = leagueTeams[(i * 7 + team.id) % leagueTeams.length];
    const result: TeamForm["result"] = i < 2 ? "W" : i === 2 ? "D" : "L";
    const my = i < 2 ? 2 : i === 2 ? 1 : 0;
    const opp = i < 2 ? 0 : i === 2 ? 1 : 2;
    return {
      result, opponentId: opponent.id, score: `${my} - ${opp}`,
      date: `${3 + i * 4} روز پیش`, competition: "لیگ",
    };
  });
}

export const getLeague = (slug: string) => LEAGUES.find((l) => l.slug === slug);
export const getLeagueById = (id: number) => LEAGUES.find((l) => l.id === id);
export const getTeam = (slug: string) => TEAMS.find((t) => t.slug === slug);
export const getTeamById = (id: number) => TEAMS.find((t) => t.id === id)!;
export const teamById = getTeamById;
export const teamsOfLeague = (leagueId: number) => TEAMS.filter((t) => t.leagueId === leagueId);
export const standingsOf = (leagueId: number) => STANDINGS[leagueId] ?? [];
export const matchesOfLeague = (leagueId: number) => MATCHES.filter((m) => m.leagueId === leagueId);
export const matchesOfTeam = (teamId: number) => MATCHES.filter((m) => m.homeTeamId === teamId || m.awayTeamId === teamId);
export const newsOfLeague = (leagueId: number) => NEWS.filter((n) => n.leagueId === leagueId);
export const newsOfTeam = (teamId: number) => NEWS.filter((n) => n.teamId === teamId);
export const transfersOfTeam = (teamId: number) => TRANSFERS.filter((t) => t.fromTeamId === teamId || t.toTeamId === teamId);
export const transfersOfLeague = (leagueId: number) => TRANSFERS.filter((t) => t.leagueId === leagueId);

export function getMatchById(id: number): Match | undefined {
  return MATCHES.find((m) => m.id === id);
}
export function leagueOf(team: Team): League { return LEAGUES.find((l) => l.id === team.leagueId)!; }
export function standingOf(leagueId: number, teamId: number): { rank: number; row: Standing } | null {
  const rows = STANDINGS[leagueId] ?? [];
  const idx = rows.findIndex((r) => r.teamId === teamId);
  if (idx === -1) return null;
  return { rank: idx + 1, row: rows[idx] };
}

/* ===== MATCH LINEUP (match-centric, deterministic per matchId+teamId) ===== */
const FORMATIONS = ["4-3-3", "4-2-3-1", "4-4-2", "3-4-3", "3-5-2"];
const GOAL_NAMES = ["کارلوس آندرس", "لیونل مسی", "محمد صلاح", "ارلینگ هالند", "وینیسیوس جونیور", "کای هاورتس", "بوکایو ساکا", "کول پالمر"];
const DEF_NAMES = ["ویرژیل فن دایک", "روبن دیاز", "داوید آلابا", "آنتونیو رودیگر", "ژول کنده", "مارکینیوس", "ترنت الکساندر", "لوک شاو"];
const MID_NAMES = ["کوین دی‌بروینه", "جود بلینگام", "مارتین اودگارد", "سونی", "پدری", "فدریکو والورده", "انزو فرناندز", "دکلان رایس", "برناردو سیلوا"];
const FW_NAMES_LINEUP = ["کیلیان امباپه", "رافائل لیائو", "کریستوفر انکونکو", "ریکاردو هورتا", "وسلی فوفانا", "گابریل ژسوس"];
const GK_NAMES2 = ["آلیسون بکر", "داوید رایا", "تیریب کورتوا", "ادرسون", "گرانیت ژاکا"];

function formationPositions(formation: string, count: number): { x: number; y: number }[] {
  // horizontal pitch, home attacks left→right; away will be mirrored by consumer
  const parts = formation.split("-").map(Number);
  const rows = parts.length;
  const perRow = parts;
  const out: { x: number; y: number }[] = [];
  // GK
  out.push({ x: 8, y: 50 });
  let line = 1;
  for (let r = 0; r < rows; r++) {
    const n = perRow[r];
    const x = 25 + (r / Math.max(1, rows - 1)) * 62;
    for (let i = 0; i < n; i++) {
      const y = n === 1 ? 50 : 10 + (i / (n - 1)) * 80;
      out.push({ x, y });
      line++;
    }
  }
  return out.slice(0, count);
}

function playerEvents(matchId: number, idx: number, position: LineupPlayer["position"]): LineupEvent[] {
  const ev: LineupEvent[] = [];
  const r = rand(matchId * 31 + idx * 7);
  const goal = position === "FW" ? (r > 0.55 ? 1 : 0) : position === "MF" ? (r > 0.8 ? 1 : 0) : 0;
  if (goal) ev.push({ type: "goal", minute: irand(matchId + idx, 12, 88) });
  if (position !== "GK" && rand(matchId * 13 + idx) > 0.75) ev.push({ type: "assist", minute: irand(matchId + idx + 5, 10, 80) });
  if (position !== "GK" && rand(matchId * 17 + idx) > 0.7) ev.push({ type: "yellow_card", minute: irand(matchId + idx + 9, 20, 90) });
  if (rand(matchId * 23 + idx) > 0.95) ev.push({ type: "red_card", minute: irand(matchId + idx + 3, 40, 90) });
  if (position === "FW" && rand(matchId * 29 + idx) > 0.9) ev.push({ type: "penalty_goal", minute: irand(matchId + idx, 30, 85) });
  return ev;
}

const PIC_SEED = (n: number) => `https://picsum.photos/seed/p${n}/160/240`;

export function lineupFor(match: Match, teamId: number): MatchLineup {
  const squad = squadFor(teamById(teamId));
  const seed = match.id * 1000 + teamId;
  const formation = FORMATIONS[irand(seed, 0, FORMATIONS.length - 1)];
  const parts = formation.split("-").map(Number);
  const starterCount = 1 + parts.reduce((a, b) => a + b, 0);

  // pick starters: one GK, then fill positions
  const gk = squad.filter((p) => p.position === "GK")[0] ?? squad[0];
  const posPool: LineupPlayer["position"][] = [];
  parts.forEach((n, i) => {
    const pos: LineupPlayer["position"] = i === 0 ? "DF" : i === 1 ? "MF" : "FW";
    for (let k = 0; k < n; k++) posPool.push(pos);
  });
  const startersRaw: Player[] = [gk];
  const used = new Set<number>([gk.id]);
  let pi = 0;
  for (const pos of posPool) {
    const cand = squad.find((p) => p.position === pos && !used.has(p.id)) ?? squad.find((p) => !used.has(p.id))!;
    used.add(cand.id);
    startersRaw.push(cand);
    pi++;
  }

  const benchPool = squad.filter((p) => !used.has(p.id));
  const benchCount = Math.min(7, benchPool.length);
  const bench = benchPool.slice(0, benchCount);

  // deterministic ratings (per matchId+player — NOT stored on player profile)
  const rating = (playerId: number, base: number) => Math.round((base + rand(seed * 3 + playerId) * 1.8) * 10) / 10;
  const baseRating = 6.4 + rand(seed) * 1.2;

  const starters: LineupPlayer[] = startersRaw.map((p, i) => {
    const pos = formationPositions(formation, starterCount)[i];
    const events = i === 0 ? [] : playerEvents(match.id, i, p.position);
    return {
      playerId: p.id, name: p.name, position: p.position, shirtNumber: p.number,
      starter: true, x: pos.x, y: pos.y, rating: rating(p.id, baseRating), captain: i === 1,
      events, image: `https://picsum.photos/seed/lineup${p.id}/160/240`,
    };
  });

  const subs: LineupPlayer[] = bench.map((p, i) => ({
    playerId: p.id, name: p.name, position: p.position, shirtNumber: p.number,
    starter: false, x: 0, y: 0, rating: null, captain: false, events: [], image: null,
  }));

  // substitutions: some bench players come in
  const substitutions: { minute: number; outName: string; inName: string }[] = [];
  const subCount = Math.min(3, Math.floor(rand(seed * 7) * 4));
  for (let s = 0; s < subCount && s < subs.length; s++) {
    const minute = irand(seed + s * 11, 55, 85);
    const outIdx = starters.length - 1 - (s % Math.max(1, starters.length - 2));
    const outP = starters[outIdx];
    const inP = subs[s];
    inP.events.push({ type: "sub_in", minute });
    outP.events.push({ type: "sub_out", minute });
    substitutions.push({ minute, outName: outP.name, inName: inP.name });
  }

  const rated = starters.filter((s) => s.rating !== null).map((s) => s.rating as number);
  const averageRating = rated.length ? Math.round((rated.reduce((a, b) => a + b, 0) / rated.length) * 10) / 10 : null;

  return { matchId: match.id, teamId, formation, averageRating, starters, substitutes: subs, substitutions, isMock: true };
}

/* ===== FULL MATCH TIMELINE (match-centric, deterministic) ===== */
const FIRST_NAMES = ["لیونل", "کریستیانو", "ارلینگ", "محمد", "وینیسیوس", "کای", "بوکایو", "کول", "سون", "الکساندر", "هری", "جود"];
const LAST_NAMES = ["مسی", "رونالدو", "هالند", "صلاح", "جونیور", "هاورتس", "ساکا", "پالمر", "سون", "ایساک", "کین", "بلینگام"];

function playerName(matchId: number, teamId: number, i: number): string {
  return `${FIRST_NAMES[(matchId + teamId + i) % FIRST_NAMES.length]} ${LAST_NAMES[(matchId * 3 + i) % LAST_NAMES.length]}`;
}

function addedTime(minute: number): string {
  const extra = irand(minute * 7 + 1, 1, 4);
  return `${minute}+${extra}'`;
}

export function matchTimeline(match: Match): MatchTimeline {
  const seed = match.id * 997;
  const hs = match.homeScore ?? 0;
  const as = match.awayScore ?? 0;
  const isDraw = match.status !== "upcoming" && hs === as;
  const extraTimeEligible = Boolean(getLeagueById(match.leagueId)?.slug && match.status !== "upcoming");
  const goToET = isDraw && extraTimeEligible && rand(seed) > 0.55;
  const goToPens = goToET && rand(seed * 3) > 0.4;

  // --- گل‌ها (برای روند نتیجه) ---
  const goals: { minute: number; teamId: number; isHome: boolean }[] = [];
  for (let g = 0; g < hs; g++) goals.push({ minute: irand(seed + g * 7, 4, 88), teamId: match.homeTeamId, isHome: true });
  for (let g = 0; g < as; g++) goals.push({ minute: irand(seed + g * 13 + 1, 5, 89), teamId: match.awayTeamId, isHome: false });

  // --- سایر رویدادها ---
  const side: { minute: number; ev: Omit<TimelineEvent, "id" | "homeScore" | "awayScore"> }[] = [];
  const used = new Set<number>(goals.map((g) => g.minute));

  const cardCount = irand(seed, 2, 5);
  for (let c = 0; c < cardCount; c++) {
    const minute = irand(seed + c * 19, 8, 88);
    if (used.has(minute)) continue;
    used.add(minute);
    const teamId = rand(seed + c * 29) > 0.5 ? match.homeTeamId : match.awayTeamId;
    const type = rand(seed + c * 37) > 0.9 ? "red_card" : rand(seed + c * 41) > 0.15 ? "yellow_card" : "second_yellow";
    side.push({ minute, ev: { minute: `${minute}'`, type, teamId, player: playerName(match.id, teamId, c * 5) } });
  }
  if (rand(seed * 7) > 0.6) {
    const minute = irand(seed + 3, 15, 80);
    if (!used.has(minute)) {
      used.add(minute);
      side.push({ minute, ev: { minute: `${minute}'`, type: "injury", teamId: match.homeTeamId, player: playerName(match.id, match.homeTeamId, 2), detail: "مصدومیت بازیکن" } });
    }
  }
  const varCount = irand(seed * 11, 0, 2);
  for (let v = 0; v < varCount; v++) {
    const minute = irand(seed + v * 43, 20, 85);
    if (used.has(minute)) continue;
    used.add(minute);
    const teamId = rand(seed + v * 53) > 0.5 ? match.homeTeamId : match.awayTeamId;
    const confirmed = rand(seed + v * 59) > 0.5;
    side.push({ minute, ev: { minute: `${minute}'`, type: "var_review", teamId, detail: "بررسی VAR" } });
    side.push({ minute, ev: { minute: `${minute}'`, type: confirmed ? "var_goal_confirmed" : "var_goal_disallowed", teamId, detail: confirmed ? "گل تأیید شد" : "گل مردود شد" } });
  }
  const subCount = irand(seed * 17, 1, 3);
  for (let s = 0; s < subCount; s++) {
    const minute = irand(seed + s * 61, 55, 85);
    if (used.has(minute)) continue;
    used.add(minute);
    const teamId = rand(seed + s * 67) > 0.5 ? match.homeTeamId : match.awayTeamId;
    side.push({ minute, ev: { minute: `${minute}'`, type: "substitution", teamId, player: playerName(match.id, teamId, s * 7 + 1), detail: playerName(match.id, teamId, s * 7 + 5) } });
  }

  // --- ادغام و مرتب‌سازی + روند نتیجه ---
  type Row = TimelineEvent & { m: number };
  const rows: Row[] = [];
  let hg = 0, ag = 0;
  const merged: { minute: number; isGoal: boolean; teamId: number; isHome: boolean; ev?: Omit<TimelineEvent, "id" | "homeScore" | "awayScore"> }[] = [
    ...goals.map((g) => ({ minute: g.minute, isGoal: true as const, teamId: g.teamId, isHome: g.isHome })),
    ...side.map((s) => ({ minute: s.minute, isGoal: false as const, teamId: s.ev.teamId, isHome: s.ev.teamId === match.homeTeamId, ev: s.ev })),
  ].sort((a, b) => a.minute - b.minute);

  for (const item of merged) {
    if (item.isGoal) {
      if (item.isHome) hg++; else ag++;
      const scorer = playerName(match.id, item.teamId, item.isHome ? 0 : 3);
      const assist = rand(seed + item.minute) > 0.45 ? playerName(match.id, item.teamId, item.isHome ? 1 : 4) : undefined;
      rows.push({ id: 0, m: item.minute, minute: `${item.minute}'`, type: "goal", teamId: item.teamId, player: scorer, assist, homeScore: hg, awayScore: ag } as Row);
    } else {
      const ev = item.ev!;
      rows.push({ id: 0, m: item.minute, ...ev } as Row);
    }
  }
  // هدف در دقیقه ۹۰+ به صورت added time
  const withET: Row[] = [];
  for (const r of rows) {
    const isLateGoal = r.type === "goal" && r.m > 84 && r.m <= 90;
    withET.push(isLateGoal ? { ...r, minute: addedTime(r.m) } : r);
  }

  // --- ساختار نهایی تایم‌لاین با فازها ---
  let id = 0;
  const out: TimelineEvent[] = [];
  const push = (e: Omit<TimelineEvent, "id">) => out.push({ id: ++id, ...e });
  const phase = (minute: string, detail: string) => push({ minute, type: "kickoff", teamId: match.homeTeamId, detail });

  phase("۰'", "شروع نیمه اول");
  withET.filter((r) => r.m <= 45).forEach((r) => push(stripMeta(r)));
  phase("۴۵'", "پایان نیمه اول");
  phase("۴۶'", "شروع نیمه دوم");
  withET.filter((r) => r.m > 45 && r.m <= 90).forEach((r) => push(stripMeta(r)));
  phase("۹۰'", "پایان ۹۰ دقیقه");

  if (goToET) {
    phase("۹۰+۱'", "شروع وقت اضافه");
    withET.filter((r) => r.m > 90 && r.m <= 105).forEach((r) => push(stripMeta(r)));
    phase("۱۰۵'", "پایان نیمه اول وقت اضافه");
    phase("۱۰۵+۱'", "شروع نیمه دوم وقت اضافه");
    withET.filter((r) => r.m > 105 && r.m <= 120).forEach((r) => push(stripMeta(r)));
    phase("۱۲۰'", "پایان وقت اضافه");

    if (goToPens) {
      phase("—", "ضربات پنالتی");
      const penRounds = irand(seed * 23, 5, 7);
      let homePen = 0, awayPen = 0;
      const penalties: PenaltyShot[] = [];
      for (let r = 0; r < penRounds; r++) {
        const teamId = r % 2 === 0 ? match.homeTeamId : match.awayTeamId;
        const converted = rand(seed + r * 71) > 0.25;
        if (converted) { if (teamId === match.homeTeamId) homePen++; else awayPen++; }
        penalties.push({ teamId, player: playerName(match.id, teamId, r), round: Math.floor(r / 2) + 1, converted });
      }
      push({ minute: "—", type: "goal", teamId: match.homeTeamId, detail: "پایان مسابقه" });
      return { matchId: match.id, events: out, penalties, hasExtraTime: true, hasPenaltyShootout: true, penaltyScoreHome: homePen, penaltyScoreAway: awayPen, isMock: true };
    }
  }
  push({ minute: "—", type: "kickoff", teamId: match.awayTeamId, detail: "پایان مسابقه" });
  return { matchId: match.id, events: out, penalties: [], hasExtraTime: goToET, hasPenaltyShootout: false, penaltyScoreHome: 0, penaltyScoreAway: 0, isMock: true };
}

function stripMeta<T extends { m: number }>(t: T): Omit<T, "m"> {
  const { m, ...rest } = t;
  return rest;
}

/* ===== MATCH STATS (match-centric, deterministic per matchId) ===== */
export function matchStats(match: Match): MatchStats {
  const seed = match.id * 13 + match.homeTeamId * 7 + match.awayTeamId;
  const hg = match.homeScore ?? 0;
  const ag = match.awayScore ?? 0;
  const total = hg + ag;
  const hShots = 4 + hg * 2 + irand(seed, 2, 6);
  const aShots = 4 + ag * 2 + irand(seed * 3, 2, 6);
  const hPoss = irand(seed, 38, 62);
  const aPoss = 100 - hPoss;
  const rows: MatchStats["rows"] = [
    { key: "possession", home: hPoss, away: aPoss },
    { key: "shots", home: hShots, away: aShots },
    { key: "shots_on_target", home: Math.max(0, hg + irand(seed * 5, 1, 3)), away: Math.max(0, ag + irand(seed * 7, 1, 3)) },
    { key: "corners", home: irand(seed * 11, 2, 9), away: irand(seed * 13, 2, 8) },
    { key: "fouls", home: irand(seed * 17, 8, 18), away: irand(seed * 19, 8, 17) },
    { key: "yellow_cards", home: irand(seed * 23, 0, 4), away: irand(seed * 29, 0, 4) },
    { key: "red_cards", home: irand(seed * 31, 0, 1), away: irand(seed * 37, 0, 1) },
    { key: "offside", home: irand(seed * 41, 0, 5), away: irand(seed * 43, 0, 5) },
    { key: "passes", home: 380 + irand(seed * 47, 20, 160), away: 360 + irand(seed * 53, 20, 150) },
    { key: "pass_accuracy", home: irand(seed * 59, 74, 92), away: irand(seed * 61, 72, 91) },
  ];
  return { matchId: match.id, rows, isMock: true };
}

export const MATCH_STAT_LABEL: Record<string, string> = {
  possession: "مالکیت توپ",
  shots: "شوت",
  shots_on_target: "شوت در چارچوب",
  corners: "کرنر",
  fouls: "خطا",
  yellow_cards: "کارت زرد",
  red_cards: "کارت قرمز",
  offside: "آفساید",
  passes: "پاس",
  pass_accuracy: "دقت پاس",
};

export const MATCH_STAT_SUFFIX: Record<string, string> = {
  possession: "%",
  pass_accuracy: "%",
};
