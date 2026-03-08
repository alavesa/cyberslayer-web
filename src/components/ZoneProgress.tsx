interface ZoneProgressProps {
  currentLevel: number;
  totalLevels: number;
  victory?: boolean;
  defeat?: boolean;
  zoneCrits?: boolean[];
  lastAttackCrit?: boolean;
  lastAttackTrigger?: number;
}

export default function ZoneProgress({
  currentLevel,
  totalLevels,
  victory,
  defeat,
  zoneCrits = [],
  lastAttackCrit,
  lastAttackTrigger,
}: ZoneProgressProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: totalLevels }, (_, i) => {
        const cleared = i < currentLevel;
        const current = i === currentLevel && !victory && !defeat;
        const usedWeakness = zoneCrits[i];

        // Victory: rainbow colors with staggered animation
        if (victory) {
          const hue = (i / totalLevels) * 360;
          return (
            <div
              key={i}
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 border border-white/30 zone-light-rainbow"
              style={{
                backgroundColor: `hsl(${hue}, 85%, 55%)`,
                boxShadow: `0 0 8px hsl(${hue}, 85%, 55%, 0.7), 0 0 16px hsl(${hue}, 85%, 55%, 0.3)`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          );
        }

        // Current zone: flash on attack
        if (current && lastAttackTrigger && lastAttackTrigger > 0) {
          return (
            <div
              key={`${i}-${lastAttackTrigger}`}
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 border transition-all duration-300 ${
                lastAttackCrit
                  ? "zone-light-crit border-primary"
                  : "zone-light-miss border-destructive/60"
              }`}
            />
          );
        }

        // Current zone: pulsing
        if (current) {
          return (
            <div
              key={i}
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 border animate-zone-pulse border-cyber-green/60"
            />
          );
        }

        // Cleared zones: green if weakness exploited, orange/red if not
        if (cleared) {
          if (usedWeakness === true) {
            return (
              <div
                key={i}
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 border bg-primary/60 border-primary/50"
                style={{ boxShadow: "0 0 5px hsl(160, 100%, 50%, 0.4)" }}
              />
            );
          }
          if (usedWeakness === false) {
            return (
              <div
                key={i}
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 border bg-orange-500/50 border-orange-400/40"
                style={{ boxShadow: "0 0 4px hsl(30, 90%, 50%, 0.3)" }}
              />
            );
          }
          // No crit data available (fallback)
          return (
            <div
              key={i}
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 border bg-cyber-green/50 border-cyber-green/40 shadow-[0_0_4px_hsl(160,100%,50%,0.3)]"
            />
          );
        }

        // Defeat: cleared vs failed
        if (defeat) {
          return (
            <div
              key={i}
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 border bg-cyber-red/20 border-cyber-red/30"
            />
          );
        }

        // Future zones
        return (
          <div
            key={i}
            className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 border bg-muted/20 border-muted-foreground/10"
          />
        );
      })}
    </div>
  );
}
