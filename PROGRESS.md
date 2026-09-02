# PROGRESS — Dynamic League/Team System + New Palette

## Done
- Dynamic League template `/football/leagues/[leagueSlug]/[[...tab]]` (7 tabs).
- Dynamic Team template `/football/teams/[teamSlug]/[[...tab]]` (7 tabs + squad/stats sub-tabs).
- Normalized data layer `src/lib/football/*` (types, leagues, data, index).
- 11 leagues: PL, LaLiga, Serie A, Bundesliga, Ligue 1, Eredivisie, Primeira Liga, Süper Lig, Saudi Pro League, Brasileirão, MLS (~140 teams).
- Reusable components `src/components/football/*`.
- Old `/premier-league` → redirect to `/football/leagues/premier-league`.
- Drawer football now lists all 11 leagues.
- **New palette applied site-wide**: background `#252525`, gradient `#005cfc → #bee503`, primary blue, accent lime. Done via bulk replace (23 files) + encoding-safe write to preserve Persian text.
- PROGRESS: encoding fix completed (all Persian text restored).

## Verify (all pass)
- tsc --noEmit clean
- /, /football/leagues/* (all 11), /football/teams/* → 200
