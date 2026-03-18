const STORAGE_KEY = "cyberslayer";

export interface SaveData {
  highLevel: number;
  kills: number;
  games: number;
  bestTurns: number | null;
}

const DEFAULT_SAVE: SaveData = { highLevel: 0, kills: 0, games: 0, bestTurns: null };

function sanitizeNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : fallback;
}

function sanitizeSave(data: SaveData): SaveData {
  return {
    highLevel: sanitizeNumber(data.highLevel, 0),
    kills: sanitizeNumber(data.kills, 0),
    games: sanitizeNumber(data.games, 0),
    bestTurns: data.bestTurns === null ? null : sanitizeNumber(data.bestTurns, 0),
  };
}

function writeDirect(data: SaveData): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (e) {
    console.warn("Save failed", e);
  }
}

export function loadSave(): SaveData {
  try {
    if (typeof localStorage === "undefined") return { ...DEFAULT_SAVE };
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SAVE };
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return { ...DEFAULT_SAVE };
    return {
      highLevel: sanitizeNumber(parsed.highLevel, 0),
      kills: sanitizeNumber(parsed.kills, 0),
      games: sanitizeNumber(parsed.games, 0),
      bestTurns: parsed.bestTurns === null ? null : (typeof parsed.bestTurns === "number" && Number.isFinite(parsed.bestTurns) && parsed.bestTurns >= 0 ? Math.floor(parsed.bestTurns) : null),
    };
  } catch {
    return { ...DEFAULT_SAVE };
  }
}

export function writeSave(data: Partial<SaveData>): void {
  const current = loadSave();
  const merged = sanitizeSave({ ...current, ...data } as SaveData);
  writeDirect(merged);
}

export function updateAfterGame(levelReached: number, killsThisRun: number, totalTurns?: number): void {
  const current = loadSave();
  let bestTurns = current.bestTurns;
  // Save best turns on victory (levelReached >= 10)
  if (totalTurns !== undefined && levelReached >= 10) {
    bestTurns = current.bestTurns === null ? totalTurns : Math.min(current.bestTurns, totalTurns);
  }
  const merged: SaveData = {
    highLevel: Math.max(current.highLevel, levelReached),
    kills: current.kills + killsThisRun,
    games: current.games + 1,
    bestTurns,
  };
  writeDirect(sanitizeSave(merged));
}
