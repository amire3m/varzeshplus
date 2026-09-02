export type Sport = { id: string; name: string };

export type Country = { id: string; name: string };

export type League = {
  id: number;
  slug: string;
  name: string;
  englishName: string;
  logo: string;
  countryId: string;
  season: string;
  color: string;
};

export type Team = {
  id: number;
  slug: string;
  name: string;
  shortName: string;
  logo: string;
  color: string;
  countryId: string;
  leagueId: number;
  stadium: string;
  city: string;
  founded: number;
  coach: string;
  website?: string;
};

export type Player = {
  id: number;
  teamId: number;
  name: string;
  number: number;
  position: "GK" | "DF" | "MF" | "FW";
  age: number;
  nationality: string;
  appearances: number;
  starts: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
};

export type Standing = {
  teamId: number;
  played: number;
  win: number;
  draw: number;
  loss: number;
  gf: number;
  ga: number;
  pts: number;
};

export type Match = {
  id: number;
  leagueId: number;
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number | null;
  awayScore: number | null;
  status: "live" | "upcoming" | "finished";
  minute: number | null;
  kickoff: string;
  matchweek: number;
  competition: string;
  stadium?: string;
};

export type Transfer = {
  id: number;
  leagueId: number;
  player: string;
  fromTeamId: number;
  toTeamId: number;
  fee: string | null;
  type: "loan" | "permanent" | "free";
  date: string;
  official: boolean;
  incoming: boolean;
};

export type NewsItem = {
  id: number;
  leagueId: number;
  teamId?: number | null;
  title: string;
  summary: string;
  image: string;
  publishedAt: string;
  tag: string;
  hot?: boolean;
};

export type PlayerStat = {
  rank: number;
  player: string;
  teamId: number;
  number?: number;
  appearances?: number;
  value: number;
};

export type TeamForm = { result: "W" | "D" | "L"; opponentId: number; score: string; date: string; competition: string };

/* ===== Lineup / Match-centric entities ===== */
export type LineupEventType =
  | "goal"
  | "assist"
  | "yellow_card"
  | "red_card"
  | "sub_in"
  | "sub_out"
  | "penalty_goal"
  | "penalty_miss"
  | "own_goal";

export type LineupEvent = { type: LineupEventType; minute: number; detail?: string };

export type LineupPlayer = {
  playerId: number;
  name: string;
  position: "GK" | "DF" | "MF" | "FW";
  shirtNumber: number;
  starter: boolean;
  x: number;
  y: number;
  rating: number | null;
  captain: boolean;
  events: LineupEvent[];
  image?: string | null;
};

export type MatchLineup = {
  matchId: number;
  teamId: number;
  formation: string;
  averageRating: number | null;
  starters: LineupPlayer[];
  substitutes: LineupPlayer[];
  substitutions: { minute: number; outName: string; inName: string }[];
  isMock: boolean;
};

/* ===== Match Timeline (full commentary) ===== */
export type TimelineEventType =
  | "kickoff"
  | "goal"
  | "penalty_goal"
  | "own_goal"
  | "assist"
  | "yellow_card"
  | "second_yellow"
  | "red_card"
  | "substitution"
  | "penalty_miss"
  | "var_review"
  | "var_goal_confirmed"
  | "var_goal_disallowed"
  | "injury";

export type TimelineEvent = {
  id: number;
  minute: string; // "45+2", "90+4"
  type: TimelineEventType;
  teamId: number;
  player?: string;
  assist?: string;
  detail?: string;
  homeScore?: number;
  awayScore?: number;
  isSecondHalf?: boolean;
  isExtraTime?: boolean;
};

export type TimelinePhase =
  | "kickoff"
  | "ht"
  | "2nd"
  | "ft"
  | "et1"
  | "et1ht"
  | "et2"
  | "etft"
  | "pens"
  | "end";

export type PenaltyShot = { teamId: number; player: string; round: number; converted: boolean };

export type MatchTimeline = {
  matchId: number;
  events: TimelineEvent[];
  penalties: PenaltyShot[];
  hasExtraTime: boolean;
  hasPenaltyShootout: boolean;
  penaltyScoreHome: number;
  penaltyScoreAway: number;
  isMock: boolean;
};

export type MatchStatKey =
  | "possession"
  | "shots"
  | "shots_on_target"
  | "corners"
  | "fouls"
  | "yellow_cards"
  | "red_cards"
  | "offside"
  | "passes"
  | "pass_accuracy";

export type MatchStatRow = { key: MatchStatKey; home: number; away: number };

export type MatchStats = {
  matchId: number;
  rows: MatchStatRow[];
  isMock: boolean;
};

export type MatchDetails = {
  match: Match;
  home: Team;
  away: Team;
  league: League;
};
