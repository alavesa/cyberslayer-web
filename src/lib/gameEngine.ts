// ─── Constants ───────────────────────────────────────────────────────────────

export const PLAYER_START_HP = 100;
export const NUM_LEVELS = 10;
export const NMAP_START = 8;
export const META_START = 3;
export const DMG_PING = 10;
export const DMG_NMAP = 18;
export const DMG_META = 32;

// ─── Types ───────────────────────────────────────────────────────────────────

export type Weapon = "ping" | "nmap" | "meta";
export type Special = "replicate" | "encrypt" | "adapt" | null;
export type Difficulty = "easy" | "normal" | "hard";

export const DIFFICULTY_MODS: Record<Difficulty, { playerHP: number; enemyHP: number; enemyAtk: number; label: string }> = {
  easy:   { playerHP: 1.3, enemyHP: 0.75, enemyAtk: 0.75, label: "EASY" },
  normal: { playerHP: 1,   enemyHP: 1,    enemyAtk: 1,    label: "NORMAL" },
  hard:   { playerHP: 0.8, enemyHP: 1.25, enemyAtk: 1.25, label: "HARD" },
};

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
  { zone: "Guest WiFi",    enemy: "Script Kiddie", hp: 18, atk: 5,  special: null,        weakness: "ping" },
  { zone: "DMZ",           enemy: "Trojan",        hp: 28, atk: 7,  special: null,        weakness: "nmap" },
  { zone: "Web Server",    enemy: "Worm",          hp: 32, atk: 6,  special: "replicate", weakness: "ping" },
  { zone: "Email GW",      enemy: "Phisher",       hp: 30, atk: 8,  special: null,        weakness: "nmap" },
  { zone: "File Server",   enemy: "Ransomware",    hp: 38, atk: 8,  special: "encrypt",  weakness: "meta" },
  { zone: "Active Dir",    enemy: "Rootkit",       hp: 42, atk: 7,  special: null,        weakness: "meta" },
  { zone: "Database",      enemy: "SQLi Worm",     hp: 36, atk: 8,  special: "replicate", weakness: "nmap" },
  { zone: "SCADA",         enemy: "Zero-Day",      hp: 40, atk: 9,  special: null,        weakness: "meta" },
  { zone: "C-Suite",       enemy: "Social Eng",    hp: 34, atk: 10, special: "encrypt",  weakness: "ping" },
  { zone: "Core Router",   enemy: "APT",           hp: 58, atk: 10, special: "adapt",    weakness: "meta" },
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
  const healAmount = 20 + (level + 1) * 3;
  const nmapGain = 2;
  const metaGain = [1, 3, 5, 7].includes(level) ? 1 : 0;
  const shieldGain = [2, 4, 6, 8].includes(level) ? 10 : 0;

  return { healAmount, nmapGain, metaGain, shieldGain };
}

// ─── Educational Info ────────────────────────────────────────────────────────

export const WEAPON_INFO: Record<Weapon, { name: string; fullName: string; desc: string }> = {
  ping: {
    name: "PING",
    fullName: "ICMP Echo Request",
    desc: "Sends ICMP packets to test if a host is reachable. Used for network diagnostics and host discovery.",
  },
  nmap: {
    name: "NMAP",
    fullName: "Network Mapper",
    desc: "Open-source port scanner that discovers hosts, services, and vulnerabilities on a network.",
  },
  meta: {
    name: "MSPLOIT",
    fullName: "Metasploit Framework",
    desc: "Penetration testing framework with exploit modules for finding and validating vulnerabilities.",
  },
};

export const ENEMY_INFO: Record<string, string> = {
  "Script Kiddie": "An unskilled attacker who uses pre-made tools without understanding how they work.",
  "Trojan": "Malware disguised as legitimate software. Named after the Trojan Horse — it tricks users into running it.",
  "Worm": "Self-replicating malware that spreads across networks without user interaction, exploiting vulnerabilities.",
  "Phisher": "Social engineering attack that uses fake emails or sites to steal credentials and sensitive data.",
  "Ransomware": "Encrypts victim files and demands payment for decryption keys. A top enterprise threat.",
  "Rootkit": "Stealthy malware that hides deep in the OS, evading detection while maintaining persistent access.",
  "SQLi Worm": "Exploits SQL injection flaws — inserting malicious queries to extract or destroy database contents.",
  "Zero-Day": "An exploit targeting an unknown vulnerability — no patch exists yet. Extremely dangerous.",
  "Social Eng": "Manipulates people into breaking security procedures. The human element is the weakest link.",
  "APT": "Advanced Persistent Threat — a prolonged, targeted attack by skilled adversaries, often state-sponsored.",
};

export const ZONE_INFO: Record<string, string> = {
  "Guest WiFi": "The entry point. Guest networks should be isolated from internal systems via network segmentation.",
  "DMZ": "Demilitarized Zone — a network segment that exposes external-facing services while protecting the internal LAN.",
  "Web Server": "Hosts public applications. Common attack surface for XSS, CSRF, and remote code execution.",
  "Email GW": "Email Gateway — filters inbound mail for spam, phishing, and malicious attachments before delivery.",
  "File Server": "Stores shared files. A prime target for ransomware encryption and data exfiltration.",
  "Active Dir": "Active Directory — Microsoft's identity service. Compromising it means controlling the entire domain.",
  "Database": "Stores critical data. Must be protected against SQL injection, privilege escalation, and data leaks.",
  "SCADA": "Supervisory Control and Data Acquisition — controls industrial systems. Attacks here have physical consequences.",
  "C-Suite": "Executive systems with high-value targets. Social engineering is the primary attack vector here.",
  "Core Router": "The backbone of network routing. Compromising it gives an attacker control over all traffic flow.",
};

// ─── ASCII Art (2 frames per enemy for animation) ───────────────────────────

export const ENEMY_ART: Record<string, string[]> = {
  "Script Kiddie": [
`  ┌──────┐
  │ ◉  ◉ │
  │  ──  │
  │ /  \\ │
  └──┬┬──┘
  ╔══╧╧══╗`,
`  ┌──────┐
  │ ◉  ◉ │
  │  ──  │
  │ \\  / │
  └──┬┬──┘
  ╔══╧╧══╗`,
  ],
  "Trojan": [
`    ╋
  ┌─╋──┐
  │ ╋  │
  │FREE│
  │WIFI│
  └────┘`,
`    ╋
  ┌─╋──┐
  │▓▓▓▓│
  │▓>>▓│
  │▓▓▓▓│
  └────┘`,
  ],
  "Worm": [
`  ~~~~○○
 ○○○○○○○
○○○○○○○○○
 ○○○○○○○
  ○○○○○
   ○○○`,
`○○~~~~
 ○○○○○○○
  ○○○○○○○○○
 ○○○○○○○
○○○○○
○○○`,
  ],
  "Phisher": [
`  ┌──────┐
  │ LOGIN │
  │user:__│
  │pass:__│
  │[SUBMIT]│
  └──────┘`,
`  ┌──────┐
  │ LOG1N │
  │user:__│
  │pass:__│
  │[SU8MIT]│
  └──────┘`,
  ],
  "Ransomware": [
`  ┌─🔒──┐
  │ $$$$ │
  │ LOCK │
  │ $$$$ │
  └──────┘
  PAY UP!`,
`  ┌─🔒──┐
  │ $$$$│
  │ LOCK │
  │$$$$  │
  └──────┘
  PAY UP!`,
  ],
  "Rootkit": [
`  ┌──────┐
  │ ░░░░ │
  │ ????│
  │ ░░░░ │
  └──────┘
  HIDDEN`,
`  ┌──────┐
  │ ▒▒▒▒ │
  │ ????│
  │ ▒▒▒▒ │
  └──────┘
  H??DEN`,
  ],
  "SQLi Worm": [
`  ';DROP─┐
  │SELECT│
  │ *FROM│
  │users;│
  └──────┘
  INJECT`,
`  ';DROP─┐
  │SELECT│
  │ *FROM│
  │pass; │
  └──────┘
  INJECT`,
  ],
  "Zero-Day": [
`  ╔═0DAY═╗
  ║ !??! ║
  ║ ?!!? ║
  ║ !??! ║
  ╚══════╝
  UNKNOWN`,
`  ╔═0DAY═╗
  ║ ?!!? ║
  ║ !??! ║
  ║ ?!!? ║
  ╚══════╝
  UNKN0WN`,
  ],
  "Social Eng": [
`  ┌──────┐
  │ ^  ^ │
  │  ◡◡  │
  │TRUST │
  │  ME  │
  └──────┘`,
`  ┌──────┐
  │ ◠  ◠ │
  │  ◡◡  │
  │TRUST │
  │  ME? │
  └──────┘`,
  ],
  "APT": [
`  ╔══════╗
  ║▓▓▓▓▓▓║
  ║▓ APT▓║
  ║▓▓▓▓▓▓║
  ╚══════╝
  PERSIST`,
`  ╔══════╗
  ║░▓░▓░▓║
  ║▓ APT░║
  ║▓░▓░▓░║
  ╚══════╝
  PERSIST`,
  ],
};
