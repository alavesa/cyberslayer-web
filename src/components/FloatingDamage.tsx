import { useEffect, useState } from "react";

interface DamageEntry {
  id: number;
  value: number;
  isCrit: boolean;
  type: "dealt" | "taken";
}

interface FloatingDamageProps {
  damage: number;
  isCrit: boolean;
  type: "dealt" | "taken";
  trigger: number; // increment to spawn a new number
}

let nextId = 0;

export default function FloatingDamage({ damage, isCrit, type, trigger }: FloatingDamageProps) {
  const [entries, setEntries] = useState<DamageEntry[]>([]);

  useEffect(() => {
    if (trigger === 0 || damage === 0) return;

    const id = nextId++;
    setEntries((prev) => [...prev, { id, value: damage, isCrit, type }]);

    const timer = setTimeout(() => {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }, 900);

    return () => clearTimeout(timer);
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {entries.map((entry) => {
        const offsetX = Math.random() * 40 - 20;
        return (
          <div
            key={entry.id}
            className={`absolute left-1/2 floating-damage font-pixel ${
              entry.isCrit
                ? "text-accent glow-yellow text-lg"
                : entry.type === "taken"
                  ? "text-destructive glow-red text-sm"
                  : "text-primary glow-green text-sm"
            }`}
            style={{
              top: entry.type === "dealt" ? "30%" : "20%",
              marginLeft: `${offsetX}px`,
            }}
          >
            {entry.isCrit && "★ "}
            -{entry.value}
            {entry.isCrit && " ★"}
          </div>
        );
      })}
    </div>
  );
}
