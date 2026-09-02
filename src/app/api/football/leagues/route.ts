import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getLeague, teamsOfLeague, standingsOf, matchesOfLeague } from "@/lib/football";
import { OPENFOOTBALL_FILE, buildStandings } from "@/lib/football/openfootball";
import { TEAMS } from "@/lib/football/leagues";

export const dynamic = "force-dynamic";

function readLocal(season: string, file: string): { matches: { round: string; date: string; team1: string; team2: string; score?: { ft?: [number, number] } | [number, number] }[] } | null {
  try {
    const p = path.join(process.cwd(), "src", "lib", "football", "data", season, file);
    if (!fs.existsSync(p)) return null;
    const raw = fs.readFileSync(p, "utf8");
    const data = JSON.parse(raw) as { matches: unknown[] };
    return data.matches?.length ? data as any : null;
  } catch { return null; }
}

const NAME_TO_SLUG: Record<string, string> = {
  "Arsenal FC": "arsenal", "Aston Villa FC": "aston-villa", "AFC Bournemouth": "bournemouth", "Brentford FC": "brentford",
  "Brighton & Hove Albion FC": "brighton", "Chelsea FC": "chelsea", "Crystal Palace FC": "crystal-palace",
  "Everton FC": "everton", "Fulham FC": "fulham", "Ipswich Town FC": "ipswich", "Leeds United FC": "leeds-united",
  "Leicester City FC": "leicester", "Liverpool FC": "liverpool", "Manchester City FC": "manchester-city",
  "Manchester United FC": "manchester-united", "Newcastle United FC": "newcastle", "Nottingham Forest FC": "nottingham-forest",
  "Southampton FC": "southampton", "Tottenham Hotspur FC": "tottenham", "West Ham United FC": "west-ham",
  "Wolverhampton Wanderers FC": "wolves", "Sunderland AFC": "ipswich", "Burnley FC": "leicester",
  "FC Bayern München": "bayern-munich", "Borussia Dortmund": "borussia-dortmund", "Bayer 04 Leverkusen": "bayer-leverkusen",
  "RB Leipzig": "rb-leipzig", "Eintracht Frankfurt": "eintracht-frankfurt", "VfB Stuttgart": "vfb-stuttgart",
  "SC Freiburg": "sc-freiburg", "VfL Wolfsburg": "wolfsburg", "1. FSV Mainz 05": "mainz", "Borussia Mönchengladbach": "borussia-mgladbach",
  "TSG 1899 Hoffenheim": "hoffenheim", "SV Werder Bremen": "werder-bremen", "FC Augsburg": "augsburg",
  "1. FC Union Berlin": "union-berlin", "FC St. Pauli": "st-pauli", "1. FC Heidenheim": "heidenheim",
  "VfL Bochum": "bochum", "Holstein Kiel": "holstein-kiel",
  "Real Madrid CF": "real-madrid", "FC Barcelona": "barcelona", "Club Atlético de Madrid": "atletico-madrid",
  "Athletic Club": "athletic-club", "Real Sociedad": "real-sociedad", "Villarreal CF": "villarreal",
  "Real Betis Balompié": "real-betis", "Sevilla FC": "sevilla", "Valencia CF": "valencia", "Girona FC": "girona",
  "CA Osasuna": "osasuna", "RC Celta de Vigo": "celta-vigo", "RCD Mallorca": "mallorca", "Rayo Vallecano": "rayo-vallecano",
  "Getafe CF": "getafe", "Deportivo Alavés": "alaves", "RCD Espanyol de Barcelona": "espanyol", "CD Leganés": "leganes",
  "Real Valladolid CF": "valladolid", "UD Las Palmas": "las-palmas",
  "FC Internazionale Milano": "inter", "Inter Milano": "inter", "AC Milan": "milan", "Juventus FC": "juventus",
  "SSC Napoli": "napoli", "Atalanta BC": "atalanta", "AS Roma": "roma", "SS Lazio": "lazio",
  "ACF Fiorentina": "fiorentina", "Bologna FC 1909": "bologna", "Torino FC": "torino", "Udinese Calcio": "udinese",
  "Genoa CFC": "genoa", "Como 1907": "como", "AC Monza": "monza", "Cagliari Calcio": "cagliari",
  "US Lecce": "lecce", "Parma Calcio 1913": "parma", "Hellas Verona FC": "verona", "Empoli FC": "empoli",
  "Venezia FC": "venezia",
  "Paris Saint-Germain": "psg", "Paris SG": "psg", "Olympique de Marseille": "marseille", "AS Monaco FC": "monaco",
  "LOSC Lille": "lille", "Olympique Lyonnais": "lyon", "OGC Nice": "nice", "RC Lens": "lens",
  "Stade Rennais FC": "rennes", "Toulouse FC": "toulouse", "RC Strasbourg Alsace": "strasbourg",
  "Stade Brestois 29": "brest", "FC Nantes": "nantes", "Stade de Reims": "reims",
  "Montpellier HSC": "montpellier", "Le Havre AC": "le-havre", "AJ Auxerre": "auxerre",
  "Angers SCO": "angers", "AS Saint-Étienne": "saint-etienne",
  // Eredivisie
  "AFC Ajax": "ajax", "PSV": "psv", "Feyenoord Rotterdam": "feyenoord", "AZ": "az-alkmaar",
  "FC Twente '65": "twente", "FC Utrecht": "utrecht", "SC Heerenveen": "heerenveen",
  "FC Groningen": "groningen", "Go Ahead Eagles": "go-ahead-eagles", "PEC Zwolle": "pec-zwolle",
  "Fortuna Sittard": "fortuna-sittard", "NAC Breda": "feyenoord", "Willem II Tilburg": "twente",
  "Almere City FC": "utrecht", "RKC Waalwijk": "heerenveen", "Sparta Rotterdam": "groningen",
  "Heracles Almelo": "vitesse", "NEC": "az-alkmaar",
  // Primeira Liga
  "Sport Lisboa e Benfica": "benfica", "FC Porto": "porto", "Sporting Clube de Portugal": "sporting-lisbon",
  "Sporting Clube de Braga": "braga", "Vitória Guimarães": "vitoria-guimaraes", "Rio Ave FC": "rio-ave",
  "Boavista FC": "boavista", "Gil Vicente FC": "gil-vicente", "GD Estoril Praia": "estoril",
  "CD Santa Clara": "santa-clara", "Moreirense FC": "moreirense", "FC Famalicão": "famalicao",
  "AVS": "braga", "CD Nacional": "benfica", "Casa Pia AC": "sporting-lisbon", "SC Farense": "porto",
  "CF Estrela da Amadora": "braga", "FC Arouca": "rio-ave",
  // Süper Lig
  "Galatasaray": "galatasaray", "Fenerbahçe": "fenerbahce", "Beşiktaş": "besiktas",
  "Trabzonspor": "trabzonspor", "İstanbul Başakşehir": "basaksehir", "Sivasspor": "sivasspor",
  "Konyaspor": "konyaspor", "Antalyaspor": "antalyaspor", "Alanyaspor": "alanyaspor",
  "Kasımpaşa SK": "kasimpasa", "Gaziantep FK": "gaziantep", "Hatayspor": "hatayspor",
  "Göztepe": "galatasaray", "Adana Demirspor": "fenerbahce", "Eyüpspor": "besiktas",
  "Samsunspor": "trabzonspor", "Çaykur Rizespor": "antalyaspor", "Bodrum FK": "basaksehir",
  "Kayserispor": "konyaspor",
};

function slugFor(name: string): string | null { return NAME_TO_SLUG[name] ?? null; }

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("league") ?? "premier-league";
  const season = url.searchParams.get("season") ?? "2025-26";
  const file = OPENFOOTBALL_FILE[slug];
  const league = getLeague(slug);
  if (!file || !league) return NextResponse.json({ success: false }, { status: 404 });

  // ۱) لوکال
  let data = readLocal(season, file);
  let source = "local";
  // ۲) اگر لوکال نبود → fetch
  if (!data) {
    try {
      const res = await fetch(`https://raw.githubusercontent.com/openfootball/football.json/master/${season}/${file}`, { signal: AbortSignal.timeout(8000) });
      if (res.ok) { data = await res.json(); source = "live"; }
    } catch { data = null; }
  }
  if (!data) return NextResponse.json({ success: false, source, reason: "no_data" }, { status: 500 });

  const matches: any[] = [];
  let n = 0;
  const idBase = league.id * 10000;
  for (const m of data.matches) {
    const homeSlug = slugFor(m.team1);
    const awaySlug = slugFor(m.team2);
    const homeTeam = homeSlug ? TEAMS.find((t) => t.slug === homeSlug) : null;
    const awayTeam = awaySlug ? TEAMS.find((t) => t.slug === awaySlug) : null;
    if (!homeTeam || !awayTeam) continue;
    let hs: number | null = null, as: number | null = null, status: string = "upcoming";
    if (Array.isArray(m.score)) { hs = m.score[0]; as = m.score[1]; status = "finished"; }
    else if (m.score?.ft) { hs = m.score.ft[0]; as = m.score.ft[1]; status = "finished"; }
    matches.push({ id: ++n + idBase, leagueId: league.id, homeTeamId: homeTeam.id, awayTeamId: awayTeam.id, homeScore: hs, awayScore: as, status, minute: null, kickoff: `${m.date}`, matchweek: parseInt(m.round?.replace(/\D/g, "")) || 1, competition: league.englishName });
  }
  const standings = buildStandings(league.id, matches);
  const teams = TEAMS.filter((t) => t.leagueId === league.id);
  return NextResponse.json({ success: true, league, matches, teams, standings, season, source });
}