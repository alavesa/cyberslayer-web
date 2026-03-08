import { getRank, getRandomWisdom, NUM_LEVELS } from "@/lib/gameEngine";
import type { GameState } from "@/hooks/useGameState";
import ZoneProgress from "./ZoneProgress";
import { useMemo } from "react";

interface EndScreenProps {
  state: GameState;
  playAgain: () => void;
  goToMenu: () => void;
}

export default function EndScreen({ state, playAgain, goToMenu }: EndScreenProps) {
  const wisdom = useMemo(() => getRandomWisdom(), []);
  const rank = getRank(state.level);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 terminal-grid scanlines crt-glow relative overflow-hidden">
      <div className="relative z-10 w-full max-w-md animate-flicker">
        {/* Result header */}
        <div className="bubble px-6 py-8 text-center mb-6">
          {state.victory ? (
            <>
              <p className="font-pixel text-[10px] text-primary glow-green tracking-widest mb-3">
                ◈ MISSION COMPLETE ◈
              </p>
              <h1 className="font-pixel text-sm md:text-base text-primary glow-green leading-relaxed mb-2">
                NETWORK SECURED!
              </h1>
              <p className="font-pixel text-2xl md:text-3xl text-accent glow-yellow">
                VICTORY
              </p>
            </>
          ) : (
            <>
              <p className="font-pixel text-[10px] text-destructive glow-red tracking-widest mb-3">
                ◈ MISSION FAILED ◈
              </p>
              <h1 className="font-pixel text-sm md:text-base text-destructive glow-red leading-relaxed mb-2">
                SYSTEM COMPROMISED
              </h1>
              <p className="font-pixel text-2xl md:text-3xl text-secondary glow-pink">
                PWNED
              </p>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="bg-card pixel-border p-4 space-y-2 mb-6">
          <div className="font-pixel text-[9px] text-muted-foreground tracking-wider mb-2">
            DEBRIEF
          </div>
          <div className="flex justify-between bg-muted/20 px-3 py-2 border border-border/20 font-terminal text-sm">
            <span className="text-muted-foreground">RANK:</span>
            <span className="text-accent glow-yellow">★ {rank} ★</span>
          </div>
          <div className="flex justify-between bg-muted/20 px-3 py-2 border border-border/20 font-terminal text-sm">
            <span className="text-muted-foreground">ZONES BREACHED:</span>
            <span className="text-primary glow-green">{state.level}/{NUM_LEVELS}</span>
          </div>
          <div className="flex justify-between bg-muted/20 px-3 py-2 border border-border/20 font-terminal text-sm">
            <span className="text-muted-foreground">THREATS SLAIN:</span>
            <span className="text-secondary glow-pink">{state.kills}</span>
          </div>

          <div className="flex items-center justify-center pt-2">
            <ZoneProgress
              currentLevel={state.level}
              totalLevels={NUM_LEVELS}
              victory={state.victory}
              defeat={!state.victory}
            />
          </div>
        </div>

        {/* Wisdom */}
        <div className="bg-card pixel-border-blue p-4 text-center mb-6">
          <p className="font-pixel text-[9px] text-cyan-400/60 tracking-wider mb-2">ORACLE SAYS</p>
          <p className="text-cyan-400 font-terminal text-sm glow-blue italic">"{wisdom}"</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={goToMenu}
            className="flex-1 h-14 bg-secondary/20 text-secondary pixel-btn tracking-widest border-secondary/40"
          >
            MENU
          </button>
          <button
            onClick={playAgain}
            className="flex-1 h-14 bg-primary/20 text-primary pixel-btn tracking-widest border-primary/40"
          >
            AGAIN
          </button>
        </div>
      </div>
    </div>
  );
}
