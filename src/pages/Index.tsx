import { useGameState } from "@/hooks/useGameState";
import { loadSave } from "@/lib/saveData";
import { getRank } from "@/lib/gameEngine";
import BattleScreen from "@/components/BattleScreen";
import EndScreen from "@/components/EndScreen";

function IntroScreen({ onStart }: { onStart: () => void }) {
  const save = loadSave();
  const rank = getRank(save.highLevel);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden terminal-grid scanlines crt-glow">
      <div className="relative z-10 w-full max-w-md animate-flicker">
        {/* Title */}
        <div className="bubble px-6 py-8 mb-10 text-center">
          <h1 className="font-pixel text-2xl md:text-3xl tracking-wider leading-relaxed">
            <span className="text-primary glow-green">CYBER</span>
            <span className="text-secondary glow-pink">SLAYER</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-4 font-terminal">
            [ BREACH 10 CORPORATE NETWORK ZONES ]
          </p>
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
        </div>

        {/* Breach In button */}
        <button
          onClick={onStart}
          className="w-full h-16 bg-primary text-primary-foreground pixel-btn text-sm tracking-widest"
        >
          ▶ BREACH IN
        </button>

        {/* Controls hint */}
        <div className="text-center mt-6">
          <div className="inline-flex gap-1 items-center px-4 py-2 border border-border/30 bg-card/50">
            <span className="font-terminal text-muted-foreground text-sm">
              KEYS: [1] PING &nbsp; [2] NMAP &nbsp; [3] MSPLOIT
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  const { state, attack, startGame, playAgain, goToMenu } = useGameState();

  switch (state.phase) {
    case "intro":
      return <IntroScreen onStart={startGame} />;
    case "battle":
      return <BattleScreen state={state} attack={attack} />;
    case "end":
      return <EndScreen state={state} playAgain={playAgain} goToMenu={goToMenu} />;
  }
}
