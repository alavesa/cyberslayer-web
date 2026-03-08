import { useRef, useEffect, useState } from "react";
import { Crosshair, Radar, Bug, Heart, Shield, Skull, Zap, Lock, RefreshCw, Shuffle } from "lucide-react";
import { NUM_LEVELS, LEVELS, ENEMY_ART, ENEMY_INFO, ZONE_INFO, WEAPON_INFO, DIFFICULTY_MODS } from "@/lib/gameEngine";
import type { GameState } from "@/hooks/useGameState";
import type { Weapon, Special } from "@/lib/gameEngine";
import ZoneProgress from "./ZoneProgress";
import FloatingDamage from "./FloatingDamage";
import MuteButton from "./MuteButton";
import {
  playAttackSound, playCritSound, playEnemyDeathSound,
  playPlayerDamageSound, playLevelUpSound, playDefeatSound, playVictorySound,
} from "@/lib/sounds";

function getSpecialInfo(special: Special): { label: string; desc: string; icon: typeof Zap } | null {
  switch (special) {
    case "replicate": return { label: "REPLICATE", desc: "1.5x dmg every 3rd turn", icon: RefreshCw };
    case "encrypt": return { label: "ENCRYPT", desc: "Halves your dmg every 2nd turn", icon: Lock };
    case "adapt": return { label: "ADAPT", desc: "Resists repeated weapon use", icon: Shuffle };
    default: return null;
  }
}

interface BattleScreenProps {
  state: GameState;
  attack: (weapon: Weapon) => void;
  enterZone?: () => void;
}

export default function BattleScreen({ state, attack, enterZone }: BattleScreenProps) {
  const logRef = useRef<HTMLDivElement>(null);

  const prevTriggerRef = useRef(0);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [state.combatLog]);

  // Sound effects
  useEffect(() => {
    if (state.damageDealtTrigger === 0 || state.damageDealtTrigger === prevTriggerRef.current) return;
    prevTriggerRef.current = state.damageDealtTrigger;

    // Enemy killed
    if (state.enemyHP <= 0) {
      if (state.victory) {
        playVictorySound();
      } else if (state.phase === "end") {
        playDefeatSound();
      } else {
        playEnemyDeathSound();
        setTimeout(() => playLevelUpSound(), 300);
      }
      return;
    }

    // Player died
    if (state.playerHP <= 0) {
      playAttackSound();
      setTimeout(() => playDefeatSound(), 200);
      return;
    }

    // Normal combat
    if (state.lastDamageDealtCrit) {
      playCritSound();
    } else {
      playAttackSound();
    }

    if (state.lastDamageTaken > 0) {
      setTimeout(() => playPlayerDamageSound(), 150);
    }
  }, [state.damageDealtTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-advance from transition phase
  useEffect(() => {
    if (state.phase === "transition" && enterZone) {
      const timer = setTimeout(enterZone, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.phase, enterZone]);

  // ASCII art frame animation
  const [artFrame, setArtFrame] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setArtFrame((f) => (f + 1) % 2), 800);
    return () => clearInterval(interval);
  }, []);

  const isTransition = state.phase === "transition";
  const hpPercent = Math.max(0, (state.playerHP / state.playerMaxHP) * 100);
  const enemyHpPercent = state.enemyMaxHP > 0 ? Math.max(0, (state.enemyHP / state.enemyMaxHP) * 100) : 0;
  const artFrames = ENEMY_ART[state.enemyName] || [""];
  const art = artFrames[artFrame % artFrames.length];
  const nextZone = isTransition && state.level < NUM_LEVELS ? LEVELS[state.level] : null;

  const diffLabel = DIFFICULTY_MODS[state.difficulty].label;

  return (
    <div className="min-h-[100dvh] bg-background p-2 sm:p-3 md:p-6 terminal-grid scanlines crt-glow relative overflow-hidden">
      <div className="fixed top-3 right-3 z-20">
        <MuteButton />
      </div>

      <div className={`relative z-10 max-w-2xl mx-auto space-y-2 sm:space-y-3 animate-flicker ${state.screenShake ? "screen-shake" : ""}`}>
        {/* Zone header */}
        <div className="bg-card pixel-border p-2 sm:p-3 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-pixel text-muted-foreground tracking-wider">
              ZONE {isTransition ? state.level : state.level + 1}/{NUM_LEVELS}
              {state.difficulty !== "normal" && (
                <span className={`ml-2 ${state.difficulty === "easy" ? "text-primary" : "text-destructive"}`}>
                  [{diffLabel}]
                </span>
              )}
            </p>
            <h2 className="font-pixel text-xs sm:text-sm text-primary glow-green mt-1 truncate">
              {isTransition ? "ZONE CLEARED" : state.zoneName}
            </h2>
            {!isTransition && ZONE_INFO[state.zoneName] && (
              <p className="hidden sm:block text-sm font-terminal text-muted-foreground/70 mt-1 leading-snug">
                {ZONE_INFO[state.zoneName]}
              </p>
            )}
          </div>
          <ZoneProgress
            currentLevel={state.level}
            totalLevels={NUM_LEVELS}
            zoneCrits={state.zoneCrits}
            lastAttackCrit={state.lastDamageDealtCrit}
            lastAttackTrigger={state.damageDealtTrigger}
          />
        </div>

        {/* Main battle area — always 2-column on desktop */}
        <div className="grid md:grid-cols-2 gap-2 sm:gap-3 relative">
          {/* VS badge — desktop only, during battle */}
          {!isTransition && (
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="bg-background border border-accent/40 px-2 py-1 font-pixel text-xs text-accent glow-yellow">
                VS
              </div>
            </div>
          )}

          {/* Left: Enemy card / Transition info */}
          <div className={`bg-card pixel-border-pink p-3 sm:p-4 relative ${state.enemyHit ? "animate-damage-flash" : ""}`}>
            <FloatingDamage
              damage={state.lastDamageDealt}
              isCrit={state.lastDamageDealtCrit}
              type="dealt"
              trigger={state.damageDealtTrigger}
            />

            {isTransition ? (
              <>
                {/* Loot acquired */}
                <div className="font-pixel text-xs sm:text-sm text-primary glow-green mb-3 pb-2 border-b border-primary/20 tracking-wider">
                  ◈ ZONE {state.level} CLEARED ◈
                </div>
                <div className="space-y-2 mb-4">
                  <p className="font-pixel text-xs sm:text-sm text-primary/80 tracking-wider">LOOT ACQUIRED</p>
                  {state.lootLog.map((msg, i) => (
                    <p key={i} className="text-green-400 font-terminal text-sm sm:text-base animate-slide-up" style={{ animationDelay: `${i * 150}ms` }}>
                      {msg}
                    </p>
                  ))}
                </div>

                {/* Next zone preview */}
                {nextZone && (
                  <div className="border-t border-secondary/20 pt-3 space-y-2">
                    <p className="font-pixel text-xs sm:text-sm text-muted-foreground tracking-wider">
                      NEXT: ZONE {state.level + 1}/{NUM_LEVELS}
                    </p>
                    <h3 className="font-pixel text-sm sm:text-base text-primary glow-green animate-glitch">
                      {nextZone.zone}
                    </h3>
                    {ZONE_INFO[nextZone.zone] && (
                      <p className="text-sm font-terminal text-muted-foreground/70 leading-snug">
                        {ZONE_INFO[nextZone.zone]}
                      </p>
                    )}
                    <p className="font-terminal text-sm sm:text-base text-secondary glow-pink">
                      Threat: {nextZone.enemy}
                    </p>
                    {ENEMY_INFO[nextZone.enemy] && (
                      <p className="text-sm font-terminal text-secondary/70 leading-snug">
                        {ENEMY_INFO[nextZone.enemy]}
                      </p>
                    )}
                    <div className="flex gap-1 mt-2">
                      {Array.from({ length: NUM_LEVELS }, (_, i) => (
                        <div
                          key={i}
                          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 border transition-all duration-300 ${
                            i < state.level
                              ? "bg-primary/50 border-primary/40"
                              : i === state.level
                                ? "bg-primary border-primary animate-pulse-glow"
                                : "bg-muted/30 border-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 font-pixel text-xs sm:text-sm text-secondary glow-pink mb-3 pb-2 border-b border-secondary/20">
                  <Skull className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>THREAT: {state.enemyName}</span>
                  <span className="ml-auto font-terminal text-xs text-secondary/50">ENEMY</span>
                </div>

                {/* ASCII art enemy */}
                <div className="flex items-center justify-center h-24 sm:h-32 mb-2 sm:mb-3 bg-cyber-dark border border-border/20 overflow-hidden">
                  <pre className="text-secondary/80 text-[10px] sm:text-xs leading-tight font-mono glow-pink enemy-idle">{art}</pre>
                </div>

                {/* Enemy intel */}
                {ENEMY_INFO[state.enemyName] && (
                  <div className="hidden sm:block bg-muted/20 px-3 py-2 mb-3 border border-secondary/20">
                    <p className="text-xs sm:text-sm font-pixel text-secondary/70 tracking-wider mb-1">THREAT INTEL</p>
                    <p className="text-sm font-terminal text-muted-foreground leading-snug">
                      {ENEMY_INFO[state.enemyName]}
                    </p>
                  </div>
                )}

                {/* Enemy HP */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm sm:text-base font-terminal">
                    <span className="text-muted-foreground">HP</span>
                    <span className="text-secondary glow-pink">{state.enemyHP}/{state.enemyMaxHP}</span>
                  </div>
                  <div className="pixel-progress h-4 relative">
                    <div
                      className="h-full bg-secondary pixel-progress-fill transition-all duration-300"
                      style={{ width: `${enemyHpPercent}%` }}
                    />
                  </div>
                  {(() => {
                    const info = getSpecialInfo(state.enemySpecial);
                    if (!info) return null;
                    const Icon = info.icon;
                    return (
                      <div className="bg-muted/20 px-3 py-2 border border-secondary/20 space-y-1">
                        <div className="flex items-center justify-between text-sm sm:text-base font-terminal">
                          <span className="flex items-center gap-1.5 text-secondary">
                            <Icon className="w-3.5 h-3.5" />
                            {info.label}
                          </span>
                          <Zap className="w-3.5 h-3.5 text-secondary/70" />
                        </div>
                        <p className="text-xs sm:text-sm font-terminal text-muted-foreground">{info.desc}</p>
                      </div>
                    );
                  })()}
                  <div className="flex justify-between bg-muted/20 px-3 py-1 border border-border/20 text-sm sm:text-base font-terminal">
                    <span className="text-muted-foreground">ATK PWR:</span>
                    <span className="text-secondary">{state.enemyAtk} per turn</span>
                  </div>
                </div>

                {/* Hint */}
                <div className="mt-3 text-center">
                  <span className="text-accent font-terminal text-sm sm:text-base glow-yellow animate-pulse">
                    ◈ {state.hintText}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Right: Player stats + actions */}
          <div className="space-y-2 sm:space-y-3">
            {/* Player stats */}
            <div className={`bg-card pixel-border-blue p-3 sm:p-4 relative ${state.playerHit ? "animate-damage-flash" : ""}`}>
              <FloatingDamage
                damage={state.lastDamageTaken}
                isCrit={false}
                type="taken"
                trigger={state.damageTakenTrigger}
              />
              <div className="font-pixel text-xs sm:text-sm text-cyan-400 glow-blue mb-3 pb-2 border-b border-cyan-400/20 flex items-center justify-between">
                <span>▶ OPERATOR</span>
                <span className="font-terminal text-xs text-cyan-400/50">YOU</span>
              </div>

              {/* Operator terminal art */}
              <div className="flex items-center justify-center h-24 sm:h-32 mb-3 bg-cyber-dark border border-border/20 overflow-hidden">
                <pre className="text-cyan-400/70 text-[10px] sm:text-xs leading-tight font-mono glow-blue enemy-idle">{artFrame === 0
? `  ┌───┐ ┌──────┐
  │° °│ │root@█│
  │ ─ │ │$ _   │
  └─┬─┘ └──────┘
  ─/│\\─
   / \\`
: `  ┌───┐ ┌──────┐
  │° °│ │root@█│
  │ ▪ │ │$ ▓▓▓ │
  └─┬─┘ └──────┘
  ─/│\\──~
   / \\`}</pre>
              </div>

              {/* HP */}
              <div className="space-y-1 mb-3">
                <div className="flex items-center gap-2 text-sm sm:text-base font-terminal">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
                  <span className="text-destructive">HP</span>
                  <span className="ml-auto text-destructive glow-red">{state.playerHP}/{state.playerMaxHP}</span>
                </div>
                <div className="pixel-progress h-4 relative">
                  <div
                    className="h-full bg-destructive pixel-progress-fill transition-all duration-300"
                    style={{ width: `${hpPercent}%` }}
                  />
                </div>
              </div>

              {/* Shield */}
              {state.shield > 0 && (
                <div className="flex items-center gap-2 text-sm sm:text-base font-terminal mb-2 text-cyan-400">
                  <Shield className="w-4 h-4" />
                  <span>SHIELD</span>
                  <span className="ml-auto glow-blue">+{state.shield}</span>
                  <span className="text-xs text-cyan-400/70">absorbs dmg</span>
                </div>
              )}

              {/* Ammo reserves */}
              <div className="space-y-1.5">
                <div className="text-xs sm:text-sm font-pixel text-muted-foreground/80 tracking-wider">AMMO RESERVES</div>
                <div className="grid grid-cols-2 gap-2 text-sm font-terminal">
                  <div className="bg-muted/20 px-3 py-1.5 border border-border/20">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">NMAP:</span>
                      <span className={state.nmapAmmo > 2 ? "text-primary glow-green" : state.nmapAmmo > 0 ? "text-accent glow-yellow" : "text-destructive glow-red"}>
                        {state.nmapAmmo}
                      </span>
                    </div>
                    {state.nmapAmmo === 0 && <p className="text-xs text-destructive/70 mt-0.5">DEPLETED</p>}
                  </div>
                  <div className="bg-muted/20 px-3 py-1.5 border border-border/20">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">META:</span>
                      <span className={state.metaAmmo > 1 ? "text-primary glow-green" : state.metaAmmo > 0 ? "text-accent glow-yellow" : "text-destructive glow-red"}>
                        {state.metaAmmo}
                      </span>
                    </div>
                    {state.metaAmmo === 0 && <p className="text-xs text-destructive/70 mt-0.5">DEPLETED</p>}
                  </div>
                </div>
              </div>

              {/* Status effects */}
              {state.weaponEncrypted && (
                <div className="mt-2 bg-destructive/10 border border-destructive/30 px-3 py-2">
                  <div className="flex items-center gap-2 font-pixel text-xs sm:text-sm text-destructive glow-red animate-pulse tracking-wider">
                    <Lock className="w-3.5 h-3.5" />
                    WEAPONS ENCRYPTED
                  </div>
                  <p className="text-xs sm:text-sm font-terminal text-destructive/80 mt-1">Next attack deals half damage</p>
                </div>
              )}
            </div>

            {/* Combat actions */}
            <div className={`bg-card pixel-border-green p-3 sm:p-4 ${!state.locked && !isTransition ? "attack-ready" : ""}`}>
              <div className="flex items-center justify-between font-pixel text-xs sm:text-sm text-primary glow-green mb-2 sm:mb-3 pb-2 border-b border-primary/20">
                <span>{!state.locked && !isTransition ? "▶ SELECT ATTACK" : "▶ ATTACKS"}</span>
                <span className={`font-terminal text-xs sm:text-sm ${!state.locked && !isTransition ? "text-primary glow-green animate-pulse" : "text-muted-foreground"}`}>
                  {!state.locked && !isTransition ? "TAP OR 1-3" : "2x on weakness!"}
                </span>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => attack("ping")}
                  disabled={state.locked || isTransition}
                  className={`w-full flex items-center gap-2 sm:gap-3 min-h-[2.75rem] sm:min-h-[3.5rem] bg-primary/20 text-primary pixel-btn px-2 sm:px-3 border-primary/40 hover:bg-primary/30 ${!state.locked && !isTransition ? "cursor-pointer attack-btn-pulse" : ""}`}
                >
                  <span className="hidden sm:inline bg-primary/20 px-1.5 py-0.5 text-[11px] font-pixel border border-primary/30">[1]</span>
                  <Crosshair className="w-4 h-4 shrink-0" />
                  <div className="flex flex-col items-start min-w-0">
                    <span className="font-terminal text-sm sm:text-base">PING</span>
                    <span className="hidden sm:inline text-[11px] font-terminal text-primary/70">{WEAPON_INFO.ping.fullName}</span>
                  </div>
                  <span className="ml-auto text-[10px] sm:text-[11px] font-pixel text-primary/70 shrink-0">10 DMG</span>
                </button>

                <button
                  onClick={() => attack("nmap")}
                  disabled={state.locked || state.nmapAmmo <= 0 || isTransition}
                  className={`w-full flex items-center gap-2 sm:gap-3 min-h-[2.75rem] sm:min-h-[3.5rem] bg-secondary/20 text-secondary pixel-btn px-2 sm:px-3 border-secondary/40 hover:bg-secondary/30 ${!state.locked && !isTransition && state.nmapAmmo > 0 ? "cursor-pointer attack-btn-pulse" : ""}`}
                >
                  <span className="hidden sm:inline bg-secondary/20 px-1.5 py-0.5 text-[11px] font-pixel border border-secondary/30">[2]</span>
                  <Radar className="w-4 h-4 shrink-0" />
                  <div className="flex flex-col items-start min-w-0">
                    <span className="font-terminal text-sm sm:text-base">NMAP</span>
                    <span className="hidden sm:inline text-[11px] font-terminal text-secondary/70">{WEAPON_INFO.nmap.fullName}</span>
                  </div>
                  <div className="ml-auto flex flex-col items-end shrink-0">
                    <span className="text-[10px] sm:text-[11px] font-pixel text-secondary/70">18 DMG</span>
                    <span className={`text-[10px] sm:text-[11px] font-pixel ${state.nmapAmmo > 2 ? "text-secondary/70" : state.nmapAmmo > 0 ? "text-accent" : "text-destructive"}`}>
                      {state.nmapAmmo} left
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => attack("meta")}
                  disabled={state.locked || state.metaAmmo <= 0 || isTransition}
                  className={`w-full flex items-center gap-2 sm:gap-3 min-h-[2.75rem] sm:min-h-[3.5rem] bg-accent/20 text-accent pixel-btn px-2 sm:px-3 border-accent/40 hover:bg-accent/30 ${!state.locked && !isTransition && state.metaAmmo > 0 ? "cursor-pointer attack-btn-pulse" : ""}`}
                >
                  <span className="hidden sm:inline bg-accent/20 px-1.5 py-0.5 text-[11px] font-pixel border border-accent/30">[3]</span>
                  <Bug className="w-4 h-4 shrink-0" />
                  <div className="flex flex-col items-start min-w-0">
                    <span className="font-terminal text-sm sm:text-base">MSPLOIT</span>
                    <span className="hidden sm:inline text-[11px] font-terminal text-accent/70">{WEAPON_INFO.meta.fullName}</span>
                  </div>
                  <div className="ml-auto flex flex-col items-end shrink-0">
                    <span className="text-[10px] sm:text-[11px] font-pixel text-accent/70">32 DMG</span>
                    <span className={`text-[10px] sm:text-[11px] font-pixel ${state.metaAmmo > 1 ? "text-accent/70" : state.metaAmmo > 0 ? "text-accent" : "text-destructive"}`}>
                      {state.metaAmmo} left
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Turn indicator */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-card/50 border border-border/20">
          <span className="font-terminal text-xs sm:text-sm text-muted-foreground">
            TURN {state.turnCount}
          </span>
          <span className={`font-pixel text-xs sm:text-sm tracking-wider ${
            isTransition
              ? "text-cyan-400 glow-blue"
              : state.locked
                ? "text-secondary glow-pink"
                : "text-primary glow-green"
          }`}>
            {isTransition ? "BREACHING NEXT ZONE..." : state.locked ? "PROCESSING..." : "YOUR MOVE"}
          </span>
        </div>

        {/* Operator terminal log */}
        <div className="bg-card pixel-border p-2 sm:p-3">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm font-pixel text-muted-foreground tracking-wider">OPERATOR TERMINAL</span>
            <span className="text-xs sm:text-sm font-terminal text-muted-foreground/40">root@cyberslayer ~</span>
          </div>
          <div
            ref={logRef}
            className="h-32 sm:h-40 overflow-y-auto space-y-0.5 font-terminal text-sm sm:text-base scrollbar-thin"
          >
            {state.combatLog.map((msg, i) => (
              <p
                key={i}
                className={`log-entry ${
                  msg.includes("CRITICAL") ? "text-accent glow-yellow font-bold" :
                  msg.includes("destroyed") || msg.includes("SECURED") ? "text-primary glow-green font-bold" :
                  msg.includes("attacks") || msg.includes("COMPROMISED") ? "text-destructive glow-red" :
                  msg.includes("encrypted") || msg.includes("halved") ? "text-secondary glow-pink" :
                  msg.includes("adapted") || msg.includes("reduced") ? "text-secondary" :
                  msg.includes("Healed") || msg.includes("+") ? "text-green-400" :
                  msg.includes("appeared") || msg.includes("Entering") ? "text-cyan-400" :
                  "text-muted-foreground"
                }`}
              >
                <span className="text-cyan-400/40">$</span> {msg}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
