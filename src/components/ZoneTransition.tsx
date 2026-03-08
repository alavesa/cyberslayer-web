import { useEffect, useState } from "react";
import { LEVELS, NUM_LEVELS } from "@/lib/gameEngine";

interface ZoneTransitionProps {
  level: number;
  lootLog: string[];
  onComplete: () => void;
}

export default function ZoneTransition({ level, lootLog, onComplete }: ZoneTransitionProps) {
  const [phase, setPhase] = useState<"in" | "loot" | "zone" | "out">("in");
  const data = LEVELS[level];

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("loot"), 100);
    const t2 = setTimeout(() => setPhase("zone"), 1400);
    const t3 = setTimeout(() => setPhase("out"), 2600);
    const t4 = setTimeout(onComplete, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm terminal-grid scanlines">
      {/* Loot phase */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-400 ${
          phase === "loot" ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="font-pixel text-xs text-primary glow-green tracking-widest mb-4">
          ZONE {level} CLEARED
        </p>
        <div className="bg-card pixel-border-green p-4 w-64 space-y-2">
          <p className="font-pixel text-[11px] text-primary/60 tracking-wider mb-2">LOOT ACQUIRED</p>
          {lootLog.map((msg, i) => (
            <p key={i} className="text-green-400 font-terminal text-sm animate-slide-up" style={{ animationDelay: `${i * 150}ms` }}>
              {msg}
            </p>
          ))}
        </div>
      </div>

      {/* Zone intro phase */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-400 ${
          phase === "zone" || phase === "out" ? "opacity-100" : "opacity-0"
        } ${phase === "out" ? "opacity-0" : ""}`}
      >
        <p className="font-pixel text-xs text-muted-foreground tracking-widest mb-4">
          BREACHING ZONE {level + 1}/{NUM_LEVELS}
        </p>
        <h2 className="font-pixel text-lg md:text-xl text-primary glow-green animate-glitch">
          {data.zone}
        </h2>
        <p className="font-terminal text-sm text-secondary glow-pink mt-3">
          Threat: {data.enemy}
        </p>
        <div className="mt-6 flex gap-1">
          {Array.from({ length: NUM_LEVELS }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 border transition-all duration-300 ${
                i < level
                  ? "bg-primary/50 border-primary/40"
                  : i === level
                    ? "bg-primary border-primary animate-pulse-glow"
                    : "bg-muted/20 border-muted-foreground/10"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
