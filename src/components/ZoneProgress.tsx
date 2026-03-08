interface ZoneProgressProps {
  currentLevel: number;
  totalLevels: number;
  victory?: boolean;
  defeat?: boolean;
}

export default function ZoneProgress({ currentLevel, totalLevels, victory, defeat }: ZoneProgressProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: totalLevels }, (_, i) => {
        const cleared = i < currentLevel;
        const current = i === currentLevel && !victory && !defeat;

        if (victory) {
          const hue = (i / totalLevels) * 360;
          return (
            <div
              key={i}
              className="w-3 h-3 sm:w-4 sm:h-4 border border-white/20"
              style={{
                backgroundColor: `hsl(${hue}, 80%, 55%)`,
                boxShadow: `0 0 6px hsl(${hue}, 80%, 55%, 0.6)`,
                animationDelay: `${i * 0.1}s`,
                animation: "pulse-glow 1s ease-in-out infinite",
              }}
            />
          );
        }

        return (
          <div
            key={i}
            className={`w-3 h-3 sm:w-4 sm:h-4 border transition-all duration-300 ${
              defeat && cleared
                ? "bg-cyber-green/30 border-cyber-green/20"
                : defeat
                  ? "bg-cyber-red/20 border-cyber-red/30"
                  : cleared
                    ? "bg-cyber-green/50 border-cyber-green/40 shadow-[0_0_4px_hsl(160,100%,50%,0.3)]"
                    : current
                      ? "animate-zone-pulse border-cyber-green/60"
                      : "bg-muted/20 border-muted-foreground/10"
            }`}
          />
        );
      })}
    </div>
  );
}
