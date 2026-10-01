"use client";

type FavType = "team" | "league" | "player";
type FavId = string;

const KEY = "varzeshplus:favorites";

function read(): Record<FavType, FavId[]> {
  if (typeof window === "undefined") return { team: [], league: [], player: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { team: [], league: [], player: [] };
    const parsed = JSON.parse(raw);
    return {
      team: Array.isArray(parsed.team) ? parsed.team : [],
      league: Array.isArray(parsed.league) ? parsed.league : [],
      player: Array.isArray(parsed.player) ? parsed.player : [],
    };
  } catch {
    return { team: [], league: [], player: [] };
  }
}

function write(data: Record<FavType, FavId[]>) {
  localStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent("varzeshplus:fav-change", { detail: data }));
}

export function getFavorites(type: FavType): FavId[] {
  return read()[type];
}

export function isFavorite(type: FavType, id: FavId): boolean {
  return read()[type].includes(id);
}

export function toggleFavorite(type: FavType, id: FavId): boolean {
  const data = read();
  const list = data[type];
  const idx = list.indexOf(id);
  const nowFav = idx === -1;
  if (nowFav) list.push(id);
  else list.splice(idx, 1);
  write(data);
  return nowFav;
}

export function favCount(type: FavType): number {
  return read()[type].length;
}
