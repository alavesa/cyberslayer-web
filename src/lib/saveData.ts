const STORAGE_KEY = "cyberslayer";

export interface SaveData {
  highLevel: number;
  kills: number;
  games: number;
  bestTurns: number;
}

const DEFAULT_SAVE: SaveData = { highLevel: 0, kills: 0, games: 0, bestTurns: 0 };

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SAVE };
    return { ...DEFAULT_SAVE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SAVE };
  }
}

export function writeSave(data: Partial<SaveData>): void {
  const current = loadSave();
  const merged = { ...current, ...data };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
}

export function updateAfterGame(levelReached: number, killsThisRun: number, totalTurns?: number): void {
  const current = loadSave();
  const update: Partial<SaveData> = {
    highLevel: Math.max(current.highLevel, levelReached),
    kills: current.kills + killsThisRun,
    games: current.games + 1,
  };
  // Save best turns on victory (levelReached === 10)
  if (totalTurns && levelReached >= 10) {
    update.bestTurns = current.bestTurns > 0 ? Math.min(current.bestTurns, totalTurns) : totalTurns;
  }
  writeSave(update);
}
