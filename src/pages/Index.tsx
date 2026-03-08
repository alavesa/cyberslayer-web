import { useState, useEffect } from "react";
import { useGameState } from "@/hooks/useGameState";
import { loadSave } from "@/lib/saveData";
import { getRank, DIFFICULTY_MODS, type Difficulty } from "@/lib/gameEngine";
import BattleScreen from "@/components/BattleScreen";
import EndScreen from "@/components/EndScreen";
import MuteButton from "@/components/MuteButton";

const OPERATOR_FRAMES = [
`  ┌───┐ ┌──────┐
  │° °│ │root@█│
  │ ─ │ │$ _   │
  └─┬─┘ └──────┘
  ─/│\\─
   / \\`,
`  ┌───┐ ┌──────┐
  │° °│ │root@█│
  │ ▪ │ │$ ▓▓▓ │
  └─┬─┘ └──────┘
  ─/│\\──~
   / \\`,
];

function IntroScreen({ onStart }: { onStart: (difficulty: Difficulty) => void }) {
  const save = loadSave();
  const rank = getRank(save.highLevel);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [artFrame, setArtFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setArtFrame((f) => (f + 1) % 2), 800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center p-3 sm:p-4 relative overflow-hidden terminal-grid scanlines crt-glow">
      {/* Mute button */}
      <div className="fixed top-3 right-3 z-20">
        <MuteButton />
      </div>

      <div className="relative z-10 w-full max-w-md animate-flicker">
        {/* Title */}
        <div className="bubble px-4 py-6 sm:px-6 sm:py-8 mb-6 sm:mb-10 text-center">
          <h1 className="font-pixel text-2xl sm:text-3xl md:text-4xl tracking-wider leading-relaxed">
            <span className="text-primary glow-green">CYBER</span>
            <span className="text-secondary glow-pink">SLAYER</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-3 sm:mt-4 font-terminal">
            [ BREACH 10 CORPORATE NETWORK ZONES ]
          </p>
        </div>

        {/* Operator briefing */}
        <div className="bg-card pixel-border p-4 mb-6">
          <div className="text-xs sm:text-sm font-pixel text-cyan-400/80 mb-3 tracking-wider glow-blue">
            OPERATOR BRIEFING
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <pre className="text-cyan-400/70 text-[10px] sm:text-xs leading-tight font-mono glow-blue enemy-idle">
                {OPERATOR_FRAMES[artFrame]}
              </pre>
            </div>
            <div className="font-terminal text-sm sm:text-base text-muted-foreground leading-relaxed space-y-2">
              <p>You are a <span className="text-cyan-400">network operator</span> tasked with breaching a compromised corporate network.</p>
              <p>Eliminate <span className="text-secondary">10 cyber threats</span> using your arsenal: <span className="text-primary">Ping</span>, <span className="text-accent">Nmap</span>, and <span className="text-destructive">Metasploit</span>.</p>
              <p className="text-muted-foreground/60 text-xs sm:text-sm">Exploit each threat's weakness for critical damage.</p>
            </div>
          </div>
        </div>

        {/* Stats panel */}
        <div className="bg-card pixel-border p-4 mb-6 space-y-2">
          <div className="text-xs sm:text-sm font-pixel text-muted-foreground mb-3 tracking-wider">
            OPERATOR STATUS
          </div>
          <div className="flex justify-between bg-muted/30 px-3 py-2 border border-border/30">
            <span className="text-muted-foreground font-terminal text-sm sm:text-base">RANK:</span>
            <span className="text-accent font-terminal text-sm sm:text-base glow-yellow">★ {rank} ★</span>
          </div>
          <div className="flex justify-between bg-muted/30 px-3 py-2 border border-border/30">
            <span className="text-muted-foreground font-terminal text-sm sm:text-base">BEST LEVEL:</span>
            <span className="text-primary font-terminal text-sm sm:text-base glow-green">{save.highLevel}/10</span>
          </div>
          <div className="flex justify-between bg-muted/30 px-3 py-2 border border-border/30">
            <span className="text-muted-foreground font-terminal text-sm sm:text-base">TOTAL KILLS:</span>
            <span className="text-secondary font-terminal text-sm sm:text-base glow-pink">{save.kills}</span>
          </div>
          <div className="flex justify-between bg-muted/30 px-3 py-2 border border-border/30">
            <span className="text-muted-foreground font-terminal text-sm sm:text-base">MISSIONS:</span>
            <span className="text-foreground font-terminal text-sm sm:text-base">{save.games}</span>
          </div>
          {save.bestTurns > 0 && (
            <div className="flex justify-between bg-muted/30 px-3 py-2 border border-border/30">
              <span className="text-muted-foreground font-terminal text-sm sm:text-base">BEST RUN:</span>
              <span className="text-cyan-400 font-terminal text-sm sm:text-base glow-blue">{save.bestTurns} turns</span>
            </div>
          )}
        </div>

        {/* Difficulty selector */}
        <div className="flex gap-2 mb-4">
          {(["easy", "normal", "hard"] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`flex-1 py-2.5 font-pixel text-xs sm:text-sm tracking-wider border transition-all ${
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
          className="w-full h-14 sm:h-16 md:h-18 bg-primary text-primary-foreground pixel-btn text-sm sm:text-base tracking-widest"
        >
          ▶ BREACH IN
        </button>

        {/* Controls hint */}
        <div className="text-center mt-4 sm:mt-6">
          <div className="inline-flex gap-1 items-center px-3 sm:px-4 py-2 border border-border/30 bg-card/50">
            <span className="font-terminal text-muted-foreground text-sm sm:text-base">
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
  const { state, attack, startGame, enterZone, playAgain, goToMenu } = useGameState();

  switch (state.phase) {
    case "intro":
      return <IntroScreen onStart={startGame} />;
    case "battle":
    case "transition":
      return <BattleScreen state={state} attack={attack} enterZone={enterZone} />;
    case "end":
      return <EndScreen state={state} playAgain={playAgain} goToMenu={goToMenu} />;
  }
}
