import { useReducer, useCallback, useEffect } from "react";
import {
  PLAYER_START_HP, NMAP_START, META_START, NUM_LEVELS,
  LEVELS, calculateDamage, enemyTurn, applyLoot, getWeaknessHint,
  DIFFICULTY_MODS,
  type Weapon, type Special, type Difficulty,
} from "@/lib/gameEngine";
import { updateAfterGame } from "@/lib/saveData";

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
  combatLog: string[];
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
  | { type: "GO_TO_MENU" };

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

function addLog(state: GameState, ...messages: string[]): string[] {
  return [...state.combatLog, ...messages];
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
        combatLog: [`Entering ${LEVELS[0].zone}...`, `${LEVELS[0].enemy} appeared!`],
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
        return { ...state, combatLog: addLog(state, "No Nmap ammo left!") };
      }
      if (weapon === "meta" && state.metaAmmo <= 0) {
        return { ...state, combatLog: addLog(state, "No Metasploit ammo left!") };
      }

      // Deduct ammo
      const nmapAmmo = weapon === "nmap" ? state.nmapAmmo - 1 : state.nmapAmmo;
      const metaAmmo = weapon === "meta" ? state.metaAmmo - 1 : state.metaAmmo;

      // Calculate damage
      const result = calculateDamage(
        weapon, state.enemyWeakness, state.enemySpecial,
        state.weaponEncrypted, state.lastWeapon,
      );

      const log: string[] = [];
      const weaponName = weapon === "ping" ? "Ping" : weapon === "nmap" ? "Nmap" : "Metasploit";
      log.push(`You used ${weaponName}! ${result.damage} dmg!`);
      if (result.isCrit) log.push("CRITICAL HIT! Weakness exploited!");
      if (result.wasEncrypted) log.push("Weapons were encrypted! Damage halved!");
      if (result.wasAdapted) log.push("APT adapted! Damage reduced!");

      const newEnemyHP = Math.max(0, state.enemyHP - result.damage);
      const turnCount = state.turnCount + 1;
      const hitWeakness = state.usedWeaknessThisZone || result.isCrit;

      // Enemy killed
      if (newEnemyHP <= 0) {
        const newKills = state.kills + 1;
        const newLevel = state.level + 1;
        const newZoneCrits = [...state.zoneCrits, hitWeakness];
        log.push(`${state.enemyName} destroyed!`);

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
            combatLog: addLog(state, ...log, "NETWORK SECURED!"),
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
          combatLog: addLog(state, ...log),
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

      if (eTurn.replicated) log.push("Worm replicated! Extra dmg!");
      log.push(`${state.enemyName} attacks for ${eTurn.damage}!`);
      if (eTurn.absorbed > 0) log.push(`Shield absorbed ${eTurn.absorbed} dmg`);
      if (eTurn.encrypted) log.push("Weapons encrypted! Next attack halved!");

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
          combatLog: addLog(state, ...log, "SYSTEM COMPROMISED!"),
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
        combatLog: addLog(state, ...log),
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
        combatLog: [`Entering ${LEVELS[state.level].zone}...`, `${LEVELS[state.level].enemy} appeared!`],
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
        combatLog: [`Entering ${LEVELS[0].zone}...`, `${LEVELS[0].enemy} appeared!`],
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

  return { state, attack, startGame, enterZone, playAgain, goToMenu };
}
