import { useReducer, useCallback, useEffect } from "react";
import {
  PLAYER_START_HP, NMAP_START, META_START, NUM_LEVELS,
  LEVELS, calculateDamage, enemyTurn, applyLoot, getWeaknessHint,
  DIFFICULTY_MODS, WEAPON_INFO, ENEMY_INFO, ZONE_INFO, getRank,
  type Weapon, type Special, type Difficulty,
} from "@/lib/gameEngine";
import { updateAfterGame } from "@/lib/saveData";

// ─── Log Entry ────────────────────────────────────────────────────────────────

export interface LogEntry {
  text: string;
  tooltip?: string;
  animation?: "crit" | "damage" | "death" | "system";
  isCommand?: boolean;
  isResponse?: boolean;
}

// ─── State ───────────────────────────────────────────────────────────────────

export type Phase = "intro" | "battle" | "transition" | "end";

export interface GameState {
  phase: Phase;
  difficulty: Difficulty;
  // Player
  playerHP: number;
  playerMaxHP: number;
  shield: number;
  nmapAmmo: number;
  metaAmmo: number;
  // Current level (0-indexed)
  level: number;
  kills: number;
  totalTurns: number;
  // Enemy
  enemyHP: number;
  enemyMaxHP: number;
  enemyAtk: number;
  enemyName: string;
  enemySpecial: Special;
  enemyWeakness: Weapon;
  zoneName: string;
  hintText: string;
  // Combat flags
  turnCount: number;
  lastWeapon: Weapon | null;
  weaponEncrypted: boolean;
  locked: boolean;
  // UI
  combatLog: LogEntry[];
  victory: boolean;
  // Animation triggers
  playerHit: boolean;
  enemyHit: boolean;
  // Damage display
  lastDamageDealt: number;
  lastDamageDealtCrit: boolean;
  lastDamageTaken: number;
  damageDealtTrigger: number;
  damageTakenTrigger: number;
  screenShake: boolean;
  // Loot summary (shown during zone transition)
  lootLog: string[];
  // Per-zone tracking: did player exploit the weakness?
  zoneCrits: boolean[];
  usedWeaknessThisZone: boolean;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: "START_GAME"; difficulty: Difficulty }
  | { type: "ATTACK"; weapon: Weapon }
  | { type: "UNLOCK" }
  | { type: "ENTER_ZONE" }
  | { type: "PLAY_AGAIN" }
  | { type: "GO_TO_MENU" }
  | { type: "TERMINAL_CMD"; command: string };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function spawnEnemy(level: number, difficulty: Difficulty = "normal"): Partial<GameState> {
  const data = LEVELS[level];
  const mod = DIFFICULTY_MODS[difficulty];
  const hp = Math.round(data.hp * mod.enemyHP);
  const atk = Math.round(data.atk * mod.enemyAtk);
  return {
    enemyHP: hp,
    enemyMaxHP: hp,
    enemyAtk: atk,
    enemyName: data.enemy,
    enemySpecial: data.special,
    enemyWeakness: data.weakness,
    zoneName: data.zone,
    hintText: getWeaknessHint(data.weakness),
    turnCount: 1,
    lastWeapon: null,
    weaponEncrypted: false,
  };
}

const MAX_LOG_ENTRIES = 150;

const ENCRYPT_TOOLTIP = "Encryption scrambles your attack data, reducing effectiveness by 50%.";
const REPLICATE_TOOLTIP = "Self-replicating malware creates copies to amplify its attack power.";
const ADAPT_TOOLTIP = "Advanced Persistent Threats learn from repeated attacks. Vary your weapons!";

function entry(text: string, opts?: Partial<Omit<LogEntry, "text">>): LogEntry {
  return { text, ...opts };
}

function addLog(state: GameState, ...entries: LogEntry[]): LogEntry[] {
  const combined = [...state.combatLog, ...entries];
  return combined.length > MAX_LOG_ENTRIES ? combined.slice(-MAX_LOG_ENTRIES) : combined;
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "START_GAME": {
      const diff = action.difficulty;
      const mod = DIFFICULTY_MODS[diff];
      const maxHP = Math.round(PLAYER_START_HP * mod.playerHP);
      const enemy = spawnEnemy(0, diff);
      return {
        ...state,
        phase: "battle",
        difficulty: diff,
        playerHP: maxHP,
        playerMaxHP: maxHP,
        shield: 0,
        nmapAmmo: NMAP_START,
        metaAmmo: META_START,
        level: 0,
        kills: 0,
        totalTurns: 0,
        ...enemy,
        combatLog: [
          entry(`Entering ${LEVELS[0].zone}...`, { tooltip: ZONE_INFO[LEVELS[0].zone] }),
          entry(`${LEVELS[0].enemy} appeared!`, { tooltip: ENEMY_INFO[LEVELS[0].enemy] }),
        ],
        victory: false,
        locked: false,
        playerHit: false,
        enemyHit: false,
        lastDamageDealt: 0,
        lastDamageDealtCrit: false,
        lastDamageTaken: 0,
        damageDealtTrigger: 0,
        damageTakenTrigger: 0,
        screenShake: false,
        lootLog: [],
        zoneCrits: [],
        usedWeaknessThisZone: false,
      };
    }

    case "ATTACK": {
      if (state.locked || state.phase !== "battle") return state;

      const { weapon } = action;
      const newTotalTurns = state.totalTurns + 1;

      // Ammo check
      if (weapon === "nmap" && state.nmapAmmo <= 0) {
        return { ...state, combatLog: addLog(state, entry("No Nmap ammo left!")) };
      }
      if (weapon === "meta" && state.metaAmmo <= 0) {
        return { ...state, combatLog: addLog(state, entry("No Metasploit ammo left!")) };
      }

      // Deduct ammo
      const nmapAmmo = weapon === "nmap" ? state.nmapAmmo - 1 : state.nmapAmmo;
      const metaAmmo = weapon === "meta" ? state.metaAmmo - 1 : state.metaAmmo;

      // Calculate damage
      const result = calculateDamage(
        weapon, state.enemyWeakness, state.enemySpecial,
        state.weaponEncrypted, state.lastWeapon,
      );

      const entries: LogEntry[] = [];
      const weaponName = weapon === "ping" ? "Ping" : weapon === "nmap" ? "Nmap" : "Metasploit";
      entries.push(entry(`You used ${weaponName}! ${result.damage} dmg!`, {
        tooltip: WEAPON_INFO[weapon].desc,
        animation: "damage",
      }));
      if (result.isCrit) entries.push(entry("CRITICAL HIT! Weakness exploited!", { animation: "crit" }));
      if (result.wasEncrypted) entries.push(entry("Weapons were encrypted! Damage halved!", {
        tooltip: ENCRYPT_TOOLTIP,
      }));
      if (result.wasAdapted) entries.push(entry("APT adapted! Damage reduced!", {
        tooltip: ADAPT_TOOLTIP,
      }));

      const newEnemyHP = Math.max(0, state.enemyHP - result.damage);
      const turnCount = state.turnCount + 1;
      const hitWeakness = state.usedWeaknessThisZone || result.isCrit;

      // Enemy killed
      if (newEnemyHP <= 0) {
        const newKills = state.kills + 1;
        const newLevel = state.level + 1;
        const newZoneCrits = [...state.zoneCrits, hitWeakness];
        entries.push(entry(`${state.enemyName} destroyed!`, { animation: "death" }));

        // Victory — all 10 zones cleared
        if (newLevel >= NUM_LEVELS) {
          updateAfterGame(newLevel, newKills, newTotalTurns);
          return {
            ...state,
            phase: "end",
            enemyHP: 0,
            kills: newKills,
            level: newLevel,
            totalTurns: newTotalTurns,
            turnCount,
            nmapAmmo, metaAmmo,
            combatLog: addLog(state, ...entries, entry("NETWORK SECURED!", { animation: "system" })),
            victory: true,
            locked: true,
            lastWeapon: weapon,
            weaponEncrypted: false,
            enemyHit: true,
            playerHit: false,
            lastDamageDealt: result.damage,
            lastDamageDealtCrit: result.isCrit,
            lastDamageTaken: 0,
            damageDealtTrigger: state.damageDealtTrigger + 1,
            damageTakenTrigger: state.damageTakenTrigger,
            screenShake: result.isCrit,
            zoneCrits: newZoneCrits,
            usedWeaknessThisZone: false,
          };
        }

        // Apply loot and go to transition screen
        const loot = applyLoot(state.level);
        const healedHP = Math.min(state.playerMaxHP, state.playerHP + loot.healAmount);
        const newShield = state.shield + loot.shieldGain;

        const lootMessages: string[] = [];
        lootMessages.push(`+${loot.healAmount} HP restored`);
        if (loot.nmapGain > 0) lootMessages.push(`+${loot.nmapGain} Nmap ammo`);
        if (loot.metaGain > 0) lootMessages.push(`+${loot.metaGain} Metasploit ammo`);
        if (loot.shieldGain > 0) lootMessages.push(`+${loot.shieldGain} Shield`);

        return {
          ...state,
          phase: "transition",
          enemyHP: 0,
          level: newLevel,
          kills: newKills,
          totalTurns: newTotalTurns,
          turnCount,
          playerHP: healedHP,
          shield: newShield,
          nmapAmmo: nmapAmmo + loot.nmapGain,
          metaAmmo: metaAmmo + loot.metaGain,
          combatLog: addLog(state, ...entries),
          locked: true,
          enemyHit: true,
          playerHit: false,
          lastDamageDealt: result.damage,
          lastDamageDealtCrit: result.isCrit,
          lastDamageTaken: 0,
          damageDealtTrigger: state.damageDealtTrigger + 1,
          damageTakenTrigger: state.damageTakenTrigger,
          screenShake: result.isCrit,
          lootLog: lootMessages,
          zoneCrits: newZoneCrits,
          usedWeaknessThisZone: false,
        };
      }

      // Enemy survives — enemy turn
      const eTurn = enemyTurn(state.enemyAtk, state.enemySpecial, turnCount, state.shield);

      if (eTurn.replicated) entries.push(entry("Worm replicated! Extra dmg!", {
        tooltip: REPLICATE_TOOLTIP,
      }));
      entries.push(entry(`${state.enemyName} attacks for ${eTurn.damage}!`, { animation: "damage" }));
      if (eTurn.absorbed > 0) entries.push(entry(`Shield absorbed ${eTurn.absorbed} dmg`));
      if (eTurn.encrypted) entries.push(entry("Weapons encrypted! Next attack halved!", {
        tooltip: ENCRYPT_TOOLTIP,
      }));

      const newPlayerHP = state.playerHP - eTurn.hpDamage;
      const newShield = state.shield - eTurn.absorbed;

      // Player dies
      if (newPlayerHP <= 0) {
        updateAfterGame(state.level, state.kills);
        return {
          ...state,
          phase: "end",
          playerHP: 0,
          shield: newShield,
          enemyHP: newEnemyHP,
          nmapAmmo, metaAmmo,
          totalTurns: newTotalTurns,
          turnCount,
          lastWeapon: weapon,
          weaponEncrypted: eTurn.encrypted,
          kills: state.kills,
          combatLog: addLog(state, ...entries, entry("SYSTEM COMPROMISED!", { animation: "system" })),
          victory: false,
          locked: true,
          playerHit: true,
          enemyHit: true,
          lastDamageDealt: result.damage,
          lastDamageDealtCrit: result.isCrit,
          lastDamageTaken: eTurn.hpDamage,
          damageDealtTrigger: state.damageDealtTrigger + 1,
          damageTakenTrigger: eTurn.hpDamage > 0 ? state.damageTakenTrigger + 1 : state.damageTakenTrigger,
          screenShake: true,
          usedWeaknessThisZone: hitWeakness,
        };
      }

      return {
        ...state,
        playerHP: newPlayerHP,
        shield: newShield,
        enemyHP: newEnemyHP,
        nmapAmmo, metaAmmo,
        totalTurns: newTotalTurns,
        turnCount,
        lastWeapon: weapon,
        weaponEncrypted: eTurn.encrypted,
        combatLog: addLog(state, ...entries),
        locked: true,
        playerHit: eTurn.hpDamage > 0,
        enemyHit: true,
        lastDamageDealt: result.damage,
        lastDamageDealtCrit: result.isCrit,
        lastDamageTaken: eTurn.hpDamage,
        damageDealtTrigger: state.damageDealtTrigger + 1,
        damageTakenTrigger: eTurn.hpDamage > 0 ? state.damageTakenTrigger + 1 : state.damageTakenTrigger,
        screenShake: result.isCrit || eTurn.hpDamage > 0,
        usedWeaknessThisZone: hitWeakness,
      };
    }

    case "UNLOCK":
      return { ...state, locked: false, playerHit: false, enemyHit: false, screenShake: false };

    case "ENTER_ZONE": {
      if (state.phase !== "transition") return state;
      const nextEnemy = spawnEnemy(state.level, state.difficulty);
      return {
        ...state,
        ...nextEnemy,
        phase: "battle",
        combatLog: [
          entry(`Entering ${LEVELS[state.level].zone}...`, { tooltip: ZONE_INFO[LEVELS[state.level].zone] }),
          entry(`${LEVELS[state.level].enemy} appeared!`, { tooltip: ENEMY_INFO[LEVELS[state.level].enemy] }),
        ],
        locked: false,
        playerHit: false,
        enemyHit: false,
        screenShake: false,
        lootLog: [],
      };
    }

    case "PLAY_AGAIN": {
      const mod = DIFFICULTY_MODS[state.difficulty];
      const maxHP = Math.round(PLAYER_START_HP * mod.playerHP);
      const enemy = spawnEnemy(0, state.difficulty);
      return {
        ...state,
        phase: "battle",
        playerHP: maxHP,
        playerMaxHP: maxHP,
        shield: 0,
        nmapAmmo: NMAP_START,
        metaAmmo: META_START,
        level: 0,
        kills: 0,
        totalTurns: 0,
        ...enemy,
        combatLog: [
          entry(`Entering ${LEVELS[0].zone}...`, { tooltip: ZONE_INFO[LEVELS[0].zone] }),
          entry(`${LEVELS[0].enemy} appeared!`, { tooltip: ENEMY_INFO[LEVELS[0].enemy] }),
        ],
        victory: false,
        locked: false,
        playerHit: false,
        enemyHit: false,
        lastDamageDealt: 0,
        lastDamageDealtCrit: false,
        lastDamageTaken: 0,
        damageDealtTrigger: 0,
        damageTakenTrigger: 0,
        screenShake: false,
        lootLog: [],
        zoneCrits: [],
        usedWeaknessThisZone: false,
      };
    }

    case "GO_TO_MENU":
      return { ...state, phase: "intro", combatLog: [], locked: false, playerHit: false, enemyHit: false, screenShake: false };

    case "TERMINAL_CMD": {
      const cmd = action.command.trim().toLowerCase();
      const parts = cmd.split(/\s+/);
      const base = parts[0];
      const arg = parts.slice(1).join(" ");

      const responses: LogEntry[] = [entry(`> ${action.command.trim()}`, { isCommand: true })];

      if (base === "help") {
        responses.push(entry("Available commands: help, scan, status, info <topic>, whoami", { isResponse: true }));
        responses.push(entry("Topics: ping, nmap, metasploit, or any enemy/zone name", { isResponse: true }));
      } else if (base === "scan") {
        const weaknessName = state.enemyWeakness === "ping" ? "Ping" : state.enemyWeakness === "nmap" ? "Nmap" : "Metasploit";
        const specialLabel = state.enemySpecial ? state.enemySpecial.toUpperCase() : "NONE";
        responses.push(entry(`[SCAN] ${state.enemyName} | HP: ${state.enemyHP}/${state.enemyMaxHP} | ATK: ${state.enemyAtk}`, { isResponse: true }));
        responses.push(entry(`[SCAN] Weakness: ${weaknessName} | Special: ${specialLabel}`, { isResponse: true }));
        if (ENEMY_INFO[state.enemyName]) {
          responses.push(entry(`[SCAN] ${ENEMY_INFO[state.enemyName]}`, { isResponse: true }));
        }
      } else if (base === "status") {
        responses.push(entry(`[SYS] HP: ${state.playerHP}/${state.playerMaxHP} | Shield: ${state.shield}`, { isResponse: true }));
        responses.push(entry(`[SYS] Nmap: ${state.nmapAmmo} | Meta: ${state.metaAmmo} | Turn: ${state.turnCount}`, { isResponse: true }));
        if (state.weaponEncrypted) responses.push(entry("[SYS] WARNING: Weapons currently encrypted!", { isResponse: true }));
      } else if (base === "info") {
        const topic = arg.toLowerCase();
        if (topic === "ping") {
          responses.push(entry(`[INFO] ${WEAPON_INFO.ping.fullName}: ${WEAPON_INFO.ping.desc}`, { isResponse: true }));
        } else if (topic === "nmap") {
          responses.push(entry(`[INFO] ${WEAPON_INFO.nmap.fullName}: ${WEAPON_INFO.nmap.desc}`, { isResponse: true }));
        } else if (topic === "metasploit" || topic === "msploit" || topic === "meta") {
          responses.push(entry(`[INFO] ${WEAPON_INFO.meta.fullName}: ${WEAPON_INFO.meta.desc}`, { isResponse: true }));
        } else {
          // Try enemy names
          const enemyMatch = Object.keys(ENEMY_INFO).find(e => e.toLowerCase() === topic || e.toLowerCase().includes(topic));
          if (enemyMatch) {
            responses.push(entry(`[INFO] ${enemyMatch}: ${ENEMY_INFO[enemyMatch]}`, { isResponse: true }));
          } else {
            // Try zone names
            const zoneMatch = Object.keys(ZONE_INFO).find(z => z.toLowerCase() === topic || z.toLowerCase().includes(topic));
            if (zoneMatch) {
              responses.push(entry(`[INFO] ${zoneMatch}: ${ZONE_INFO[zoneMatch]}`, { isResponse: true }));
            } else {
              responses.push(entry(`[ERR] Unknown topic: "${arg}". Try: ping, nmap, metasploit, or an enemy/zone name`, { isResponse: true }));
            }
          }
        }
      } else if (base === "whoami") {
        const rank = getRank(state.level);
        responses.push(entry(`[SYS] Rank: ${rank} | Zone: ${state.level + 1}/${NUM_LEVELS} | Kills: ${state.kills}`, { isResponse: true }));
      } else if (cmd === "") {
        return state;
      } else {
        responses.push(entry(`[ERR] Command not found: "${base}". Type "help" for available commands.`, { isResponse: true }));
      }

      return { ...state, combatLog: addLog(state, ...responses) };
    }

    default:
      return state;
  }
}

// ─── Initial State ───────────────────────────────────────────────────────────

const initialState: GameState = {
  phase: "intro",
  difficulty: "normal",
  playerHP: PLAYER_START_HP,
  playerMaxHP: PLAYER_START_HP,
  shield: 0,
  nmapAmmo: NMAP_START,
  metaAmmo: META_START,
  level: 0,
  kills: 0,
  totalTurns: 0,
  enemyHP: 0,
  enemyMaxHP: 0,
  enemyAtk: 0,
  enemyName: "",
  enemySpecial: null,
  enemyWeakness: "ping",
  zoneName: "",
  hintText: "",
  turnCount: 1,
  lastWeapon: null,
  weaponEncrypted: false,
  locked: false,
  combatLog: [],
  victory: false,
  playerHit: false,
  enemyHit: false,
  lastDamageDealt: 0,
  lastDamageDealtCrit: false,
  lastDamageTaken: 0,
  damageDealtTrigger: 0,
  damageTakenTrigger: 0,
  screenShake: false,
  lootLog: [],
  zoneCrits: [],
  usedWeaknessThisZone: false,
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Auto-unlock after lock (animation delay)
  useEffect(() => {
    if (state.locked && state.phase === "battle") {
      const timer = setTimeout(() => dispatch({ type: "UNLOCK" }), 600);
      return () => clearTimeout(timer);
    }
  }, [state.locked, state.phase]);

  // Keyboard shortcuts
  useEffect(() => {
    if (state.phase !== "battle" || state.locked) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "1") dispatch({ type: "ATTACK", weapon: "ping" });
      else if (e.key === "2") dispatch({ type: "ATTACK", weapon: "nmap" });
      else if (e.key === "3") dispatch({ type: "ATTACK", weapon: "meta" });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.phase, state.locked]);

  const attack = useCallback((weapon: Weapon) => {
    dispatch({ type: "ATTACK", weapon });
  }, []);

  const startGame = useCallback((difficulty: Difficulty = "normal") => dispatch({ type: "START_GAME", difficulty }), []);
  const enterZone = useCallback(() => dispatch({ type: "ENTER_ZONE" }), []);
  const playAgain = useCallback(() => dispatch({ type: "PLAY_AGAIN" }), []);
  const goToMenu = useCallback(() => dispatch({ type: "GO_TO_MENU" }), []);
  const runCommand = useCallback((command: string) => dispatch({ type: "TERMINAL_CMD", command }), []);

  return { state, attack, startGame, enterZone, playAgain, goToMenu, runCommand };
}
