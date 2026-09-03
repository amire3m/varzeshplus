/**
 * مختصات GPS ورزشگاه‌ها — منبع: jokecamp/FootballData (other/stadiums-with-GPS-coordinates.csv)
 * فقط lat/lng استفاده شده؛ ظرفیت/نام CSV قدیمی (~۲۰۱۲) است پس نادیده گرفته شد.
 * تیم‌هایی که از آن زمان ورزشگاه عوض کرده‌اند (وست‌هم، تاتنهام، اورتون، اتلتیکو، لیون) حذف شده‌اند.
 * خروجی: لینک Google Maps در پروفایل تیم.
 */
export const STADIUM_COORDS: Record<string, { lat: number; lng: number }> = {
  // ==== Premier League (15) ====
  arsenal: { lat: 51.555, lng: -0.108611 },
  "aston-villa": { lat: 52.509167, lng: -1.884722 },
  "manchester-city": { lat: 53.482989, lng: -2.200292 },
  liverpool: { lat: 53.430819, lng: -2.960828 },
  chelsea: { lat: 51.481667, lng: -0.191111 },
  "manchester-united": { lat: 53.463056, lng: -2.291389 },
  newcastle: { lat: 54.975556, lng: -1.621667 },
  "nottingham-forest": { lat: 52.94, lng: -1.132778 },
  brighton: { lat: 50.861822, lng: -0.083278 },
  fulham: { lat: 51.475, lng: -0.221667 },
  "crystal-palace": { lat: 51.398333, lng: -0.085556 },
  wolves: { lat: 52.590278, lng: -2.130278 },
  leicester: { lat: 52.620278, lng: -1.142222 },
  southampton: { lat: 50.905833, lng: -1.391111 },
  ipswich: { lat: 52.055061, lng: 1.144831 },
  // ==== Bundesliga (13) ====
  "bayer-leverkusen": { lat: 51.038256, lng: 7.002206 },
  "bayern-munich": { lat: 48.218775, lng: 11.624753 },
  "borussia-dortmund": { lat: 51.492569, lng: 7.451842 },
  "borussia-mgladbach": { lat: 51.174583, lng: 6.385464 },
  "eintracht-frankfurt": { lat: 50.068572, lng: 8.645458 },
  "vfb-stuttgart": { lat: 48.792269, lng: 9.232031 },
  "sc-freiburg": { lat: 47.988889, lng: 7.893056 },
  wolfsburg: { lat: 52.431944, lng: 10.803889 },
  mainz: { lat: 49.984167, lng: 8.224167 },
  hoffenheim: { lat: 49.239008, lng: 8.888281 },
  "werder-bremen": { lat: 53.066394, lng: 8.837628 },
  augsburg: { lat: 48.3225, lng: 10.882222 },
  "st-pauli": { lat: 53.554444, lng: 9.967778 },
  // ==== La Liga (15) ====
  "athletic-club": { lat: 43.264284, lng: -2.950366 },
  barcelona: { lat: 41.38087, lng: 2.122802 },
  "real-betis": { lat: 37.356389, lng: -5.981389 },
  "celta-vigo": { lat: 42.211842, lng: -8.739711 },
  espanyol: { lat: 41.347861, lng: 2.075667 },
  getafe: { lat: 40.325556, lng: -3.714722 },
  osasuna: { lat: 42.796667, lng: -1.636944 },
  "rayo-vallecano": { lat: 40.391944, lng: -3.658961 },
  "real-madrid": { lat: 40.45306, lng: -3.68835 },
  "real-sociedad": { lat: 43.301378, lng: -1.973617 },
  sevilla: { lat: 37.384, lng: -5.9705 },
  valencia: { lat: 39.474656, lng: -0.358361 },
  valladolid: { lat: 41.644444, lng: -4.761111 },
  villarreal: { lat: 39.944167, lng: -0.103611 },
  mallorca: { lat: 39.59, lng: 2.63 },
  // ==== Ligue 1 (13) ====
  monaco: { lat: 43.727606, lng: 7.415614 },
  lille: { lat: 50.611883, lng: 3.130428 },
  marseille: { lat: 43.269722, lng: 5.395833 },
  montpellier: { lat: 43.622222, lng: 3.811944 },
  nantes: { lat: 47.255631, lng: -1.525375 },
  nice: { lat: 43.723328, lng: 7.258756 },
  psg: { lat: 48.841389, lng: 2.253056 },
  reims: { lat: 49.246667, lng: 4.025 },
  rennes: { lat: 48.107458, lng: -1.712839 },
  "saint-etienne": { lat: 45.460833, lng: 4.390278 },
  toulouse: { lat: 43.583056, lng: 1.434167 },
  brest: { lat: 48.402932, lng: -4.461694 },
  auxerre: { lat: 47.786753, lng: 3.588664 },
};

/** لینک Google Maps ورزشگاه تیم — اگر مختصات نداشت null */
export function stadiumMapsUrl(teamSlug: string): string | null {
  const c = STADIUM_COORDS[teamSlug];
  if (!c) return null;
  return `https://www.google.com/maps/search/?api=1&query=${c.lat},${c.lng}`;
}
