import { useState, useEffect, useMemo } from "react";
import { useGameState } from "@/hooks/useGameState";
import { loadSave } from "@/lib/saveData";
import { getRank, DIFFICULTY_MODS, type Difficulty } from "@/lib/gameEngine";
import BattleScreen from "@/components/BattleScreen";
import EndScreen from "@/components/EndScreen";
import MuteButton from "@/components/MuteButton";
import ScaledArt from "@/components/ScaledArt";

const DEFAULT_SAVE = { highLevel: 0, kills: 0, games: 0, bestTurns: 0 };

const TAGLINES = [
  "THE NETWORK IS COMPROMISED — YOU'RE THE CURE",
  "ROGUE PACKETS DETECTED — INITIATE COUNTERMEASURES",
  "10 ZONES. 10 THREATS. ONE OPERATOR.",
  "THEY BREACHED THE NETWORK — YOU BREACH BACK",
  "ROOT ACCESS REQUIRED — HACK OR BE HACKED",
  "THE FIREWALL HAS FALLEN — YOU'RE THE LAST LINE",
  "INFECTED NETWORK. ARMED OPERATOR. NO BACKUP.",
];

const OPERATOR_FRAMES = [
`  +---+ +------+
  |o o| |root@#|
  | - | |$ _   |
  +-+-+ +------+
   /|\\
   / \\`,
`  +---+ +------+
  |o o| |root@#|
  | . | |$ ### |
  +-+-+ +------+
   /|\\--~
   / \\`,
];

function IntroScreen({ onStart }: { onStart: (difficulty: Difficulty) => void }) {
  const save = useMemo(() => {
    try {
      return loadSave() ?? DEFAULT_SAVE;
    } catch {
      return DEFAULT_SAVE;
    }
  }, []);
  const rank = useMemo(() => getRank(save.highLevel), [save.highLevel]);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const tagline = useMemo(() => TAGLINES[Math.floor(Math.random() * TAGLINES.length)], []);
  const [artFrame, setArtFrame] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      timer = setInterval(() => setArtFrame((f) => (f + 1) % 2), 800);
    };

    const stop = () => {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    start();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-start sm:justify-center p-3 sm:p-4 relative overflow-hidden terminal-grid scanlines crt-glow">
      {/* Mute button */}
      <div className="fixed top-3 right-3 z-20">
        <MuteButton />
      </div>

      <div className="relative z-10 w-full max-w-md animate-flicker py-4 sm:py-0">
        {/* Title */}
        <div className="bubble px-4 py-6 sm:px-6 sm:py-8 mb-6 sm:mb-10 text-center">
          <h1 className="font-pixel text-xl sm:text-2xl md:text-3xl tracking-wider leading-relaxed">
            <span className="text-primary glow-green">CYBER</span>
            <span className="text-secondary glow-pink">SLAYER</span>
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-3 sm:mt-4 font-terminal">
            [ {tagline} ]
          </p>
        </div>

        {/* Operator briefing */}
        <div className="bg-card pixel-border p-4 mb-6">
          <div className="text-xs font-pixel text-cyan-400/80 mb-3 tracking-wider glow-blue">
            OPERATOR BRIEFING
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <div className="flex-shrink-0 w-full sm:w-auto" aria-hidden="true">
              <ScaledArt
                art={OPERATOR_FRAMES[artFrame]}
                className="h-20 sm:h-24"
                artClassName="text-cyan-400/70 glow-blue enemy-idle"
              />
            </div>
            <div className="font-terminal text-sm text-muted-foreground leading-relaxed space-y-2 text-center sm:text-left">
              <p>You are a <span className="text-cyan-400">network operator</span> tasked with breaching a compromised corporate network.</p>
              <p>Eliminate <span className="text-secondary">10 cyber threats</span> using your arsenal: <span className="text-primary">Ping</span>, <span className="text-accent">Nmap</span>, and <span className="text-destructive">Metasploit</span>.</p>
              <p className="text-muted-foreground/60 text-xs">Exploit each threat's weakness for critical damage.</p>
            </div>
          </div>
        </div>

        {/* Stats panel */}
        <div className="bg-card pixel-border p-4 mb-6 space-y-2">
          <div className="text-xs font-pixel text-muted-foreground mb-3 tracking-wider">
            OPERATOR STATUS
          </div>
          <div className="flex justify-between bg-muted/30 px-3 py-2 border border-border/30">
            <span className="text-muted-foreground font-terminal">RANK:</span>
            <span className="text-accent font-terminal glow-yellow">★ {rank} ★</span>
          </div>
          <div className="flex justify-between bg-muted/30 px-3 py-2 border border-border/30">
            <span className="text-muted-foreground font-terminal">BEST LEVEL:</span>
            <span className="text-primary font-terminal glow-green">{save.highLevel}/10</span>
          </div>
          <div className="flex justify-between bg-muted/30 px-3 py-2 border border-border/30">
            <span className="text-muted-foreground font-terminal">TOTAL KILLS:</span>
            <span className="text-secondary font-terminal glow-pink">{save.kills}</span>
          </div>
          <div className="flex justify-between bg-muted/30 px-3 py-2 border border-border/30">
            <span className="text-muted-foreground font-terminal">MISSIONS:</span>
            <span className="text-foreground font-terminal">{save.games}</span>
          </div>
          {save.bestTurns > 0 && (
            <div className="flex justify-between bg-muted/30 px-3 py-2 border border-border/30">
              <span className="text-muted-foreground font-terminal">BEST RUN:</span>
              <span className="text-cyan-400 font-terminal glow-blue">{save.bestTurns} turns</span>
            </div>
          )}
        </div>

        {/* Difficulty selector */}
        <div className="flex gap-2 mb-4" role="radiogroup" aria-label="Difficulty selection">
          {(["easy", "normal", "hard"] as Difficulty[]).map((d) => (
            <button
              key={d}
              role="radio"
              aria-checked={difficulty === d}
              onClick={() => setDifficulty(d)}
              className={`flex-1 min-h-[44px] py-2 font-pixel text-[10px] sm:text-[11px] tracking-wider border transition-all ${
                difficulty === d
                  ? d === "easy"
                    ? "bg-primary/20 text-primary border-primary/50 glow-green"
                    : d === "normal"
                      ? "bg-accent/20 text-accent border-accent/50 glow-yellow"
                      : "bg-destructive/20 text-destructive border-destructive/50 glow-red"
                  : "bg-muted/20 text-muted-foreground border-border/30 hover:border-border/50"
              }`}
            >
              {DIFFICULTY_MODS[d].label}
            </button>
          ))}
        </div>

        {/* Breach In button */}
        <button
          onClick={() => onStart(difficulty)}
          className="w-full h-12 sm:h-14 md:h-16 bg-primary text-primary-foreground pixel-btn text-xs sm:text-sm tracking-widest"
        >
          ▶ BREACH IN
        </button>

        {/* Controls hint */}
        <div className="text-center mt-4 sm:mt-6">
          <div className="inline-flex gap-1 items-center px-3 sm:px-4 py-2 border border-border/30 bg-card/50">
            <span className="font-terminal text-muted-foreground text-xs sm:text-sm">
              [1] PING &nbsp; [2] NMAP &nbsp; [3] MSPLOIT
            </span>
          </div>
        </div>

        {/* Credits */}
        <div className="text-center mt-6 sm:mt-8 font-terminal text-xs text-muted-foreground/50">
          <span>Built by </span>
          <a href="https://www.neversay.no" target="_blank" rel="noopener noreferrer" className="text-muted-foreground/70 hover:text-primary transition-colors">Piia</a>
          <span> with </span>
          <span className="text-muted-foreground/70">Claude</span>
          <span> · </span>
          <a href="https://github.com/alavesa/cyberslayer-web" target="_blank" rel="noopener noreferrer" className="text-muted-foreground/70 hover:text-primary transition-colors">Source</a>
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  const { state, attack, startGame, enterZone, playAgain, goToMenu, runCommand } = useGameState();

  switch (state.phase) {
    case "intro":
      return <IntroScreen onStart={startGame} />;
    case "battle":
    case "transition":
      return <BattleScreen state={state} attack={attack} enterZone={enterZone} goToMenu={goToMenu} runCommand={runCommand} />;
    case "end":
      return <EndScreen state={state} playAgain={playAgain} goToMenu={goToMenu} />;
    default:
      return null;
  }
}
