interface ZoneProgressProps {
  currentLevel: number;
  totalLevels: number;
  victory?: boolean;
  defeat?: boolean;
  zoneCrits?: boolean[];
  lastAttackCrit?: boolean;
  lastAttackTrigger?: number;
  onZoneClick?: (zoneIndex: number) => void;
}

export default function ZoneProgress({
  currentLevel,
  totalLevels,
  victory,
  defeat,
  zoneCrits = [],
  lastAttackCrit,
  lastAttackTrigger,
  onZoneClick,
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
          const baseClass = "w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 border";
          const clickClass = onZoneClick ? " cursor-pointer hover:scale-125 transition-transform" : "";
          const colorClass = usedWeakness === true
            ? " bg-primary/60 border-primary/50"
            : usedWeakness === false
              ? " bg-orange-400/80 border-orange-300/60"
              : " bg-cyber-green/50 border-cyber-green/40";
          const shadow = usedWeakness === true
            ? "0 0 5px hsl(160, 100%, 50%, 0.4)"
            : usedWeakness === false
              ? "0 0 4px hsl(30, 100%, 55%, 0.5)"
              : "0 0 4px hsl(160, 100%, 50%, 0.3)";

          if (onZoneClick) {
            return (
              <button
                key={i}
                onClick={() => onZoneClick(i)}
                className={baseClass + colorClass + clickClass}
                style={{ boxShadow: shadow }}
                aria-label={`Zone ${i + 1}`}
              />
            );
          }
          return (
            <div
              key={i}
              className={baseClass + colorClass}
              style={{ boxShadow: shadow }}
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
