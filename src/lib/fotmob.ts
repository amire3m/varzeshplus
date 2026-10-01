export type FotMobFetchResult<T = unknown> = {
  data: T | null;
  source: "fotmob" | "fallback";
  cachedAt: string;
  target: string;
};

export async function fetchFotMob<T = unknown>(path: string, search = ""): Promise<FotMobFetchResult<T>> {
  const qs = search ? (search.startsWith("?") ? search : `?${search}`) : "";
  const res = await fetch(`/api/fotmob/${path}${qs}`, { cache: "no-store" }).then((r) => r.json());
  return res as FotMobFetchResult<T>;
}

// نگاشت ساده مسابقه FotMob -> داخلی (برای فاز 4)
export function mapFotMobMatch(m: any) {
  return {
    id: m?.id ?? m?.matchId ?? 0,
    home: m?.home?.name ?? m?.homeName ?? "—",
    away: m?.away?.name ?? m?.awayName ?? "—",
    homeLogo: m?.home?.logo ?? m?.home?.imageUrl ?? "",
    awayLogo: m?.away?.logo ?? m?.away?.imageUrl ?? "",
    status: (m?.status?.live ? "live" : m?.status?.finished ? "finished" : "upcoming") as "live" | "finished" | "upcoming",
    minute: m?.status?.liveTime ?? m?.minute ?? "",
    hs: String(m?.home?.score ?? m?.score?.home ?? ""),
    as: String(m?.away?.score ?? m?.score?.away ?? ""),
  };
}
