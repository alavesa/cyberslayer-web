// ─── Constants ───────────────────────────────────────────────────────────────

export const PLAYER_START_HP = 100;
export const NUM_LEVELS = 10;
export const NMAP_START = 6;
export const META_START = 2;
export const DMG_PING = 8;
export const DMG_NMAP = 15;
export const DMG_META = 30;

// ─── Types ───────────────────────────────────────────────────────────────────

export type Weapon = "ping" | "nmap" | "meta";
export type Special = "replicate" | "encrypt" | "adapt" | null;

export interface LevelData {
  zone: string;
  enemy: string;
  hp: number;
  atk: number;
  special: Special;
  weakness: Weapon;
}

// ─── Level Data ──────────────────────────────────────────────────────────────

export const LEVELS: LevelData[] = [
  { zone: "Guest WiFi",    enemy: "Script Kiddie", hp: 12, atk: 3, special: null,        weakness: "ping" },
  { zone: "DMZ",           enemy: "Trojan",        hp: 20, atk: 5, special: null,        weakness: "nmap" },
  { zone: "Web Server",    enemy: "Worm",          hp: 25, atk: 4, special: "replicate", weakness: "ping" },
  { zone: "Email GW",      enemy: "Phisher",       hp: 22, atk: 6, special: null,        weakness: "nmap" },
  { zone: "File Server",   enemy: "Ransomware",    hp: 35, atk: 7, special: "encrypt",  weakness: "meta" },
  { zone: "Active Dir",    enemy: "Rootkit",       hp: 38, atk: 5, special: null,        weakness: "meta" },
  { zone: "Database",      enemy: "SQLi Worm",     hp: 32, atk: 6, special: "replicate", weakness: "nmap" },
  { zone: "SCADA",         enemy: "Zero-Day",      hp: 35, atk: 7, special: null,        weakness: "meta" },
  { zone: "C-Suite",       enemy: "Social Eng",    hp: 28, atk: 8, special: "encrypt",  weakness: "ping" },
  { zone: "Core Router",   enemy: "APT",           hp: 55, atk: 8, special: "adapt",    weakness: "meta" },
];

// ─── Ranks ───────────────────────────────────────────────────────────────────

const RANK_THRESHOLDS: [number, string][] = [
  [0,  "Script Kiddie"],
  [2,  "Packet Pusher"],
  [4,  "Shell Jockey"],
  [6,  "Root Rider"],
  [8,  "Zero-Day Hunter"],
  [10, "Digital Oracle"],
];

export function getRank(level: number): string {
  let rank = RANK_THRESHOLDS[0][1];
  for (const [threshold, name] of RANK_THRESHOLDS) {
    if (level >= threshold) rank = name;
  }
  return rank;
}

// ─── Wisdom Quotes ───────────────────────────────────────────────────────────

export const WISDOMS: string[] = [
  "The firewall whispers: trust no packet.",
  "Every zero-day was once unknown.",
  "Root is a privilege, not a right.",
  "The best backdoor is an open front door.",
  "Patch Tuesday. Exploit Wednesday.",
  "There is no cloud. Just someone else's server.",
  "The weakest link is always human.",
  "Security through obscurity is no security.",
  "In packets we trust. In logs we verify.",
  "The network remembers what you forget.",
  "Encrypt everything. Trust nothing.",
  "A vulnerability shared is a vulnerability squared.",
  "The best exploit needs no code.",
  "Yesterday's patch is tomorrow's attack surface.",
  "Behind every breach: a default password.",
  "The oracle sees all traffic, clear and cipher.",
  "chmod 777: the path of least resistance.",
  "There are no secure systems. Only untested ones.",
  "Social engineering bypasses all firewalls.",
  "The log file knows the truth.",
];

export function getRandomWisdom(): string {
  return WISDOMS[Math.floor(Math.random() * WISDOMS.length)];
}

// ─── Hint Text ───────────────────────────────────────────────────────────────

export function getWeaknessHint(weakness: Weapon): string {
  switch (weakness) {
    case "ping": return "Trace the network!";
    case "nmap": return "Scan its ports!";
    case "meta": return "Exploit it!";
  }
}

// ─── Damage Calculation ──────────────────────────────────────────────────────

export interface DamageResult {
  damage: number;
  isCrit: boolean;
  wasEncrypted: boolean;
  wasAdapted: boolean;
}

export function calculateDamage(
  weapon: Weapon,
  enemyWeakness: Weapon,
  enemySpecial: Special,
  weaponEncrypted: boolean,
  lastWeapon: Weapon | null,
): DamageResult {
  let dmg = weapon === "ping" ? DMG_PING : weapon === "nmap" ? DMG_NMAP : DMG_META;
  const isCrit = weapon === enemyWeakness;
  let wasEncrypted = false;
  let wasAdapted = false;

  // Weakness bonus: 2x
  if (isCrit) dmg *= 2;

  // Encrypt penalty: halve damage
  if (weaponEncrypted) {
    dmg = Math.floor(dmg / 2);
    wasEncrypted = true;
  }

  // Adapt penalty: 1/3 if same weapon used consecutively
  if (enemySpecial === "adapt" && lastWeapon === weapon) {
    dmg = Math.floor(dmg / 3);
    wasAdapted = true;
  }

  return { damage: dmg, isCrit, wasEncrypted, wasAdapted };
}

// ─── Enemy Turn ──────────────────────────────────────────────────────────────

export interface EnemyTurnResult {
  damage: number;
  absorbed: number;
  hpDamage: number;
  replicated: boolean;
  encrypted: boolean;
}

export function enemyTurn(
  baseAtk: number,
  special: Special,
  turnCount: number,
  shield: number,
): EnemyTurnResult {
  let atk = baseAtk;
  let replicated = false;
  let encrypted = false;

  // Replicate: 1.5x every 3rd turn
  if (special === "replicate" && turnCount % 3 === 0) {
    atk = Math.floor(atk * 1.5);
    replicated = true;
  }

  // Encrypt: set flag every 2nd turn
  if (special === "encrypt" && turnCount % 2 === 0) {
    encrypted = true;
  }

  // Shield absorbs first
  const absorbed = Math.min(shield, atk);
  const hpDamage = atk - absorbed;

  return { damage: atk, absorbed, hpDamage, replicated, encrypted };
}

// ─── Loot (between levels) ───────────────────────────────────────────────────

export interface LootResult {
  healAmount: number;
  nmapGain: number;
  metaGain: number;
  shieldGain: number;
}

export function applyLoot(level: number): LootResult {
  // level is 0-indexed (the level just cleared, post-increment)
  const healAmount = 15 + (level + 1) * 3;
  const nmapGain = 2;
  const metaGain = [2, 4, 7].includes(level) ? 1 : 0;
  const shieldGain = [2, 4, 6, 8].includes(level) ? 10 : 0;

  return { healAmount, nmapGain, metaGain, shieldGain };
}

// ─── ASCII Art ───────────────────────────────────────────────────────────────

export const ENEMY_ART: Record<string, string> = {
  "Script Kiddie": `  ┌──────┐
  │ ◉  ◉ │
  │  ──  │
  │ /  \\ │
  └──┬┬──┘
     ││`,
  "Trojan": `  ╔══════╗
  ║ ▓▓▓▓ ║
  ║ ╠══╣ ║
  ║ ║  ║ ║
  ╚══════╝
   TROJAN`,
  "Worm": `  ~~~~○○
 ○○○○○○○
○○○○○○○○○
 ○○○○○○○
  ○○○○○
   ○○○`,
  "Phisher": `  ┌─────┐
  │ @  @ │
  │  <>  │
  │ /\\/\\ │
  └──┬┬──┘
    /🎣\\`,
  "Ransomware": `  ┌─🔒──┐
  │ $$$$ │
  │ LOCK │
  │ $$$$ │
  └──────┘
  PAY UP!`,
  "Rootkit": `  ┌──────┐
  │ ░░░░ │
  │ ????│
  │ ░░░░ │
  └──────┘
  HIDDEN`,
  "SQLi Worm": `  ';DROP─┐
  │SELECT│
  │ *FROM│
  │users;│
  └──────┘
  INJECT`,
  "Zero-Day": `  ╔═0DAY═╗
  ║ !??! ║
  ║ ?!!? ║
  ║ !??! ║
  ╚══════╝
  UNKNOWN`,
  "Social Eng": `  ┌──────┐
  │ ^  ^ │
  │  ◡◡  │
  │TRUST │
  │  ME  │
  └──────┘`,
  "APT": `  ╔══════╗
  ║▓▓▓▓▓▓║
  ║▓ APT▓║
  ║▓▓▓▓▓▓║
  ╚══════╝
  PERSIST`,
};
