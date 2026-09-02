import fs from "fs";
import path from "path";
import type { League, Match, Standing, Team } from "./types";
import { LEAGUES, TEAMS } from "./leagues";

// نگاشت نام openfootball → slug داخلی
const NAME_TO_SLUG: Record<string, string> = {
  // PL
  "Arsenal FC": "arsenal", "Aston Villa FC": "aston-villa", "AFC Bournemouth": "bournemouth", "Brentford FC": "brentford",
  "Brighton & Hove Albion FC": "brighton", "Chelsea FC": "chelsea", "Crystal Palace FC": "crystal-palace",
  "Everton FC": "everton", "Fulham FC": "fulham", "Ipswich Town FC": "ipswich", "Leeds United FC": "leeds-united",
  "Leicester City FC": "leicester", "Liverpool FC": "liverpool", "Manchester City FC": "manchester-city",
  "Manchester United FC": "manchester-united", "Newcastle United FC": "newcastle", "Nottingham Forest FC": "nottingham-forest",
  "Southampton FC": "southampton", "Tottenham Hotspur FC": "tottenham", "West Ham United FC": "west-ham",
  "Wolverhampton Wanderers FC": "wolves", "Sunderland AFC": "ipswich", "Burnley FC": "leicester",
  // Bundesliga
  "FC Bayern München": "bayern-munich", "Borussia Dortmund": "borussia-dortmund", "Bayer 04 Leverkusen": "bayer-leverkusen",
  "RB Leipzig": "rb-leipzig", "Eintracht Frankfurt": "eintracht-frankfurt", "VfB Stuttgart": "vfb-stuttgart",
  "SC Freiburg": "sc-freiburg", "VfL Wolfsburg": "wolfsburg", "1. FSV Mainz 05": "mainz", "Borussia Mönchengladbach": "borussia-mgladbach",
  "TSG 1899 Hoffenheim": "hoffenheim", "SV Werder Bremen": "werder-bremen", "FC Augsburg": "augsburg",
  "1. FC Union Berlin": "union-berlin", "FC St. Pauli": "st-pauli", "1. FC Heidenheim": "heidenheim",
  "VfL Bochum": "bochum", "Holstein Kiel": "holstein-kiel",
  // La Liga
  "Real Madrid CF": "real-madrid", "FC Barcelona": "barcelona", "Club Atlético de Madrid": "atletico-madrid",
  "Athletic Club": "athletic-club", "Real Sociedad": "real-sociedad", "Villarreal CF": "villarreal",
  "Real Betis Balompié": "real-betis", "Sevilla FC": "sevilla", "Valencia CF": "valencia", "Girona FC": "girona",
  "CA Osasuna": "osasuna", "RC Celta de Vigo": "celta-vigo", "RCD Mallorca": "mallorca", "Rayo Vallecano": "rayo-vallecano",
  "Getafe CF": "getafe", "Deportivo Alavés": "alaves", "RCD Espanyol de Barcelona": "espanyol", "CD Leganés": "leganes",
  "Real Valladolid CF": "valladolid", "UD Las Palmas": "las-palmas",
  // Serie A
  "FC Internazionale Milano": "inter", "Inter Milano": "inter", "AC Milan": "milan", "Juventus FC": "juventus",
  "SSC Napoli": "napoli", "Atalanta BC": "atalanta", "AS Roma": "roma", "SS Lazio": "lazio",
  "ACF Fiorentina": "fiorentina", "Bologna FC 1909": "bologna", "Torino FC": "torino", "Udinese Calcio": "udinese",
  "Genoa CFC": "genoa", "Como 1907": "como", "AC Monza": "monza", "Cagliari Calcio": "cagliari",
  "US Lecce": "lecce", "Parma Calcio 1913": "parma", "Hellas Verona FC": "verona", "Empoli FC": "empoli",
  "Venezia FC": "venezia",
  // Ligue 1
  "Paris Saint-Germain": "psg", "Paris SG": "psg", "Olympique de Marseille": "marseille", "AS Monaco FC": "monaco",
  "LOSC Lille": "lille", "Olympique Lyonnais": "lyon", "OGC Nice": "nice", "RC Lens": "lens",
  "Stade Rennais FC": "rennes", "Toulouse FC": "toulouse", "RC Strasbourg Alsace": "strasbourg",
  "Stade Brestois 29": "brest", "FC Nantes": "nantes", "Stade de Reims": "reims",
  "Montpellier HSC": "montpellier", "Le Havre AC": "le-havre", "AJ Auxerre": "auxerre",
  "Angers SCO": "angers", "AS Saint-Étienne": "saint-etienne",
  // Eredivisie
  "AFC Ajax": "ajax", "PSV Eindhoven": "psv", "Feyenoord Rotterdam": "feyenoord", "AZ Alkmaar": "az-alkmaar",
  "FC Twente": "twente", "FC Utrecht": "utrecht", "SC Heerenveen": "heerenveen", "FC Groningen": "groningen",
  "SBV Vitesse": "vitesse", "Go Ahead Eagles": "go-ahead-eagles", "PEC Zwolle": "pec-zwolle", "Fortuna Sittard": "fortuna-sittard",
  // Primeira Liga
  "SL Benfica": "benfica", "FC Porto": "porto", "Sporting CP": "sporting-lisbon", "SC Braga": "braga",
  "Vitória SC": "vitoria-guimaraes", "Boavista FC": "boavista", "FC Famalicão": "famalicao", "Moreirense FC": "moreirense",
  "Gil Vicente FC": "gil-vicente", "Rio Ave FC": "rio-ave", "GD Estoril Praia": "estoril", "CD Santa Clara": "santa-clara",
  // Süper Lig
  "Galatasaray SK": "galatasaray", "Fenerbahçe SK": "fenerbahce", "Beşiktaş JK": "besiktas", "Trabzonspor": "trabzonspor",
  "İstanbul Başakşehir": "basaksehir", "Sivasspor": "sivasspor", "Konyaspor": "konyaspor", "Antalyaspor": "antalyaspor",
  "Alanyaspor": "alanyaspor", "Kasımpaşa SK": "kasimpasa", "Gaziantep FK": "gaziantep", "Hatayspor": "hatayspor",
};

function slugFor(name: string): string | null {
  return NAME_TO_SLUG[name] ?? null;
}

// فایل لیگ‌ها
export const OPENFOOTBALL_FILE: Record<string, string> = {
  "premier-league": "en.1.json", "bundesliga": "de.1.json", "la-liga": "es.1.json",
  "serie-a": "it.1.json", "ligue-1": "fr.1.json", "eredivisie": "nl.1.json",
  "primeira-liga": "pt.1.json", "super-lig": "tr.1.json",
};

export const OPENFOOTBALL_SEASONS = [
  "2020-21", "2021-22", "2022-23", "2023-24", "2024-25", "2025-26", "2026-27",
];

export const LEAGUE_SEASON: Record<string, string> = {
  "premier-league": "2025-26", "bundesliga": "2025-26", "la-liga": "2025-26",
  "serie-a": "2025-26", "ligue-1": "2025-26", "eredivisie": "2025-26",
  "primeira-liga": "2025-26", "super-lig": "2025-26",
};

const base = (season: string, file: string) => `https://raw.githubusercontent.com/openfootball/football.json/master/${season}/${file}`;

type RawMatch = { round: string; date: string; time?: string; team1: string; team2: string; score?: { ft?: [number, number]; ht?: [number, number] } | [number, number] };

/** خواندن لوکال — بدون نیاز به VPN */
function readLocal(season: string, file: string): { matches: RawMatch[] } | null {
  try {
    const p = path.join(process.cwd(), "src", "lib", "football", "data", season, file);
    if (!fs.existsSync(p)) return null;
    const raw = fs.readFileSync(p, "utf8");
    const data = JSON.parse(raw) as { matches: RawMatch[] };
    return data.matches?.length ? data : null;
  } catch {
    return null;
  }
}

export async function fetchLeagueMatches(leagueSlug: string, season?: string): Promise<{ league: League; matches: Match[]; teams: Team[]; standings: Standing[]; season: string; source: "local" | "live" } | null> {
  const file = OPENFOOTBALL_FILE[leagueSlug];
  if (!file) return null;
  const league = LEAGUES.find((l) => l.slug === leagueSlug);
  if (!league) return null;
  const s = season ?? LEAGUE_SEASON[leagueSlug];
  if (!s) return null;

  // ۱) ابتدا لوکال
  let data = readLocal(s, file);
  let source: "local" | "live" = "local";
  // ۲) اگر لوکال نبود → fetch (اختیاری)
  if (!data) {
    try {
      const res = await fetch(base(s, file), { signal: AbortSignal.timeout(8000) });
      if (res.ok) { data = await res.json() as { matches: RawMatch[] }; source = "live"; }
    } catch { data = null; }
  }
  if (!data) return null;

  const matches: Match[] = [];
  const idBase = league.id * 10000;
  let n = 0;
  for (const m of data.matches) {
    const homeSlug = slugFor(m.team1);
    const awaySlug = slugFor(m.team2);
    const homeTeam = homeSlug ? TEAMS.find((t) => t.slug === homeSlug) : TEAMS.find((t) => t.name === m.team1);
    const awayTeam = awaySlug ? TEAMS.find((t) => t.slug === awaySlug) : TEAMS.find((t) => t.name === m.team2);
    if (!homeTeam || !awayTeam) continue;
    let hs: number | null = null, as: number | null = null;
    let status: Match["status"] = "upcoming";
    if (Array.isArray(m.score)) { hs = m.score[0]; as = m.score[1]; status = "finished"; }
    else if (m.score && typeof m.score === "object" && "ft" in m.score && m.score.ft) { hs = m.score.ft[0]; as = m.score.ft[1]; status = "finished"; }
    matches.push({
      id: ++n + idBase, leagueId: league.id, homeTeamId: homeTeam.id, awayTeamId: awayTeam.id,
      homeScore: hs, awayScore: as, status,
      minute: null, kickoff: `${m.date} ${m.time ?? ""}`.trim(),
      matchweek: parseInt(m.round.replace(/\D/g, "")) || 1,
      competition: league.englishName,
    });
  }
  const standings = buildStandings(league.id, matches);
  const teams = TEAMS.filter((t) => t.leagueId === league.id);
  return { league, matches, teams, standings, season: s, source };
}

export function buildStandings(leagueId: number, matches: Match[]): Standing[] {
  const map = new Map<number, Standing>();
  const ensure = (id: number) => {
    if (!map.has(id)) map.set(id, { teamId: id, played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, pts: 0 });
    return map.get(id)!;
  };
  for (const m of matches) {
    if (m.status !== "finished" || m.homeScore == null || m.awayScore == null) continue;
    const h = ensure(m.homeTeamId), a = ensure(m.awayTeamId);
    h.played++; a.played++;
    h.gf += m.homeScore; h.ga += m.awayScore;
    a.gf += m.awayScore; a.ga += m.homeScore;
    if (m.homeScore > m.awayScore) { h.win++; h.pts += 3; a.loss++; }
    else if (m.homeScore < m.awayScore) { a.win++; a.pts += 3; h.loss++; }
    else { h.draw++; a.draw++; h.pts++; a.pts++; }
  }
  return [...map.values()].sort((a, b) =>
    (b.pts - a.pts) || ((b.gf - b.ga) - (a.gf - a.ga)) || (b.gf - a.gf)
  );
}
