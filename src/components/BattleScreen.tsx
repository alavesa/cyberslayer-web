import { useRef, useEffect } from "react";
import { Crosshair, Radar, Bug, Heart, Shield, Skull, Zap, Lock, RefreshCw, Shuffle } from "lucide-react";
import { NUM_LEVELS, ENEMY_ART } from "@/lib/gameEngine";
import type { GameState } from "@/hooks/useGameState";
import type { Weapon, Special } from "@/lib/gameEngine";
import ZoneProgress from "./ZoneProgress";
import FloatingDamage from "./FloatingDamage";
import {
  playAttackSound, playCritSound, playEnemyHitSound, playEnemyDeathSound,
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
}

export default function BattleScreen({ state, attack }: BattleScreenProps) {
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
        // Player also died (shouldn't happen but safety)
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

  const hpPercent = Math.max(0, (state.playerHP / 100) * 100);
  const enemyHpPercent = state.enemyMaxHP > 0 ? Math.max(0, (state.enemyHP / state.enemyMaxHP) * 100) : 0;
  const art = ENEMY_ART[state.enemyName] || "";

  return (
    <div className="min-h-screen bg-background p-3 md:p-6 terminal-grid scanlines crt-glow relative overflow-hidden">
      <div className={`relative z-10 max-w-2xl mx-auto space-y-3 animate-flicker ${state.screenShake ? "screen-shake" : ""}`}>
        {/* Zone header */}
        <div className="bg-card pixel-border p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-pixel text-muted-foreground tracking-wider">
              ZONE {state.level + 1}/{NUM_LEVELS}
            </p>
            <h2 className="font-pixel text-xs text-primary glow-green mt-1">{state.zoneName}</h2>
          </div>
          <ZoneProgress currentLevel={state.level} totalLevels={NUM_LEVELS} />
        </div>

        {/* Main battle area */}
        <div className="grid md:grid-cols-2 gap-3">
          {/* Enemy card */}
          <div className={`bg-card pixel-border-pink p-4 relative ${state.enemyHit ? "animate-damage-flash" : ""}`}>
            <FloatingDamage
              damage={state.lastDamageDealt}
              isCrit={state.lastDamageDealtCrit}
              type="dealt"
              trigger={state.damageDealtTrigger}
            />
            <div className="flex items-center gap-2 font-pixel text-[10px] text-secondary glow-pink mb-3 pb-2 border-b border-secondary/20">
              <Skull className="w-4 h-4" />
              <span>{state.enemyName}</span>
            </div>

            {/* ASCII art enemy */}
            <div className="flex items-center justify-center h-32 mb-3 bg-cyber-dark border border-border/20 overflow-hidden">
              <pre className="text-secondary/80 text-xs leading-tight font-mono glow-pink">{art}</pre>
            </div>

            {/* Enemy HP */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-terminal">
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
                    <div className="flex items-center justify-between text-sm font-terminal">
                      <span className="flex items-center gap-1.5 text-secondary">
                        <Icon className="w-3.5 h-3.5" />
                        {info.label}
                      </span>
                      <Zap className="w-3.5 h-3.5 text-secondary/50" />
                    </div>
                    <p className="text-[11px] font-terminal text-muted-foreground">{info.desc}</p>
                  </div>
                );
              })()}
              <div className="flex justify-between bg-muted/20 px-3 py-1 border border-border/20 text-sm font-terminal">
                <span className="text-muted-foreground">ATK PWR:</span>
                <span className="text-secondary">{state.enemyAtk} per turn</span>
              </div>
            </div>

            {/* Hint */}
            <div className="mt-3 text-center">
              <span className="text-accent font-terminal text-sm glow-yellow animate-pulse">
                ◈ {state.hintText}
              </span>
            </div>
          </div>

          {/* Player stats + actions */}
          <div className="space-y-3">
            {/* Player stats */}
            <div className={`bg-card pixel-border-blue p-4 relative ${state.playerHit ? "animate-damage-flash" : ""}`}>
              <FloatingDamage
                damage={state.lastDamageTaken}
                isCrit={false}
                type="taken"
                trigger={state.damageTakenTrigger}
              />
              <div className="font-pixel text-[10px] text-cyan-400 glow-blue mb-3 pb-2 border-b border-cyan-400/20">
                ▶ OPERATOR
              </div>

              {/* HP */}
              <div className="space-y-1 mb-3">
                <div className="flex items-center gap-2 text-sm font-terminal">
                  <Heart className="w-4 h-4 text-destructive" />
                  <span className="text-destructive">HP</span>
                  <span className="ml-auto text-destructive glow-red">{state.playerHP}/100</span>
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
                <div className="flex items-center gap-2 text-sm font-terminal mb-2 text-cyan-400">
                  <Shield className="w-4 h-4" />
                  <span>SHIELD</span>
                  <span className="ml-auto glow-blue">+{state.shield}</span>
                  <span className="text-[10px] text-cyan-400/50">absorbs dmg</span>
                </div>
              )}

              {/* Ammo reserves */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-pixel text-muted-foreground/60 tracking-wider">AMMO RESERVES</div>
                <div className="grid grid-cols-2 gap-2 text-sm font-terminal">
                  <div className="bg-muted/20 px-3 py-1.5 border border-border/20">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">NMAP:</span>
                      <span className={state.nmapAmmo > 2 ? "text-primary glow-green" : state.nmapAmmo > 0 ? "text-accent glow-yellow" : "text-destructive glow-red"}>
                        {state.nmapAmmo}
                      </span>
                    </div>
                    {state.nmapAmmo === 0 && <p className="text-[10px] text-destructive/70 mt-0.5">DEPLETED</p>}
                  </div>
                  <div className="bg-muted/20 px-3 py-1.5 border border-border/20">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">META:</span>
                      <span className={state.metaAmmo > 1 ? "text-primary glow-green" : state.metaAmmo > 0 ? "text-accent glow-yellow" : "text-destructive glow-red"}>
                        {state.metaAmmo}
                      </span>
                    </div>
                    {state.metaAmmo === 0 && <p className="text-[10px] text-destructive/70 mt-0.5">DEPLETED</p>}
                  </div>
                </div>
              </div>

              {/* Status effects */}
              {state.weaponEncrypted && (
                <div className="mt-2 bg-destructive/10 border border-destructive/30 px-3 py-2">
                  <div className="flex items-center gap-2 font-pixel text-[9px] text-destructive glow-red animate-pulse tracking-wider">
                    <Lock className="w-3.5 h-3.5" />
                    WEAPONS ENCRYPTED
                  </div>
                  <p className="text-[10px] font-terminal text-destructive/60 mt-1">Next attack deals half damage</p>
                </div>
              )}
            </div>

            {/* Combat actions */}
            <div className="bg-card pixel-border-green p-4">
              <div className="flex items-center justify-between font-pixel text-[10px] text-primary glow-green mb-3 pb-2 border-b border-primary/20">
                <span>▶ ATTACKS</span>
                <span className="text-muted-foreground font-terminal text-[10px] glow-green">
                  2x dmg on weakness!
                </span>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => attack("ping")}
                  disabled={state.locked}
                  className="w-full flex items-center gap-3 h-14 bg-primary/20 text-primary pixel-btn px-3 border-primary/40 hover:bg-primary/30"
                >
                  <span className="bg-primary/20 px-1.5 py-0.5 text-[9px] font-pixel border border-primary/30">[1]</span>
                  <Crosshair className="w-4 h-4 shrink-0" />
                  <div className="flex flex-col items-start">
                    <span className="font-terminal text-sm">PING</span>
                    <span className="text-[10px] font-terminal text-primary/50">ICMP trace — infinite</span>
                  </div>
                  <span className="ml-auto text-[9px] font-pixel text-primary/70 shrink-0">8 DMG</span>
                </button>

                <button
                  onClick={() => attack("nmap")}
                  disabled={state.locked || state.nmapAmmo <= 0}
                  className="w-full flex items-center gap-3 h-14 bg-secondary/20 text-secondary pixel-btn px-3 border-secondary/40 hover:bg-secondary/30"
                >
                  <span className="bg-secondary/20 px-1.5 py-0.5 text-[9px] font-pixel border border-secondary/30">[2]</span>
                  <Radar className="w-4 h-4 shrink-0" />
                  <div className="flex flex-col items-start">
                    <span className="font-terminal text-sm">NMAP</span>
                    <span className="text-[10px] font-terminal text-secondary/50">Port scan — limited ammo</span>
                  </div>
                  <div className="ml-auto flex flex-col items-end shrink-0">
                    <span className="text-[9px] font-pixel text-secondary/70">15 DMG</span>
                    <span className={`text-[9px] font-pixel ${state.nmapAmmo > 2 ? "text-secondary/50" : state.nmapAmmo > 0 ? "text-accent" : "text-destructive"}`}>
                      {state.nmapAmmo} left
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => attack("meta")}
                  disabled={state.locked || state.metaAmmo <= 0}
                  className="w-full flex items-center gap-3 h-14 bg-accent/20 text-accent pixel-btn px-3 border-accent/40 hover:bg-accent/30"
                >
                  <span className="bg-accent/20 px-1.5 py-0.5 text-[9px] font-pixel border border-accent/30">[3]</span>
                  <Bug className="w-4 h-4 shrink-0" />
                  <div className="flex flex-col items-start">
                    <span className="font-terminal text-sm">MSPLOIT</span>
                    <span className="text-[10px] font-terminal text-accent/50">Exploit kit — rare ammo</span>
                  </div>
                  <div className="ml-auto flex flex-col items-end shrink-0">
                    <span className="text-[9px] font-pixel text-accent/70">30 DMG</span>
                    <span className={`text-[9px] font-pixel ${state.metaAmmo > 1 ? "text-accent/50" : state.metaAmmo > 0 ? "text-accent" : "text-destructive"}`}>
                      {state.metaAmmo} left
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Combat log */}
        <div className="bg-card pixel-border p-3">
          <div className="text-[9px] font-pixel text-muted-foreground mb-2 tracking-wider">SYSTEM LOG</div>
          <div
            ref={logRef}
            className="h-28 overflow-y-auto space-y-0.5 font-terminal text-sm scrollbar-thin"
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
                <span className="text-muted-foreground/50">{">"}</span> {msg}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
