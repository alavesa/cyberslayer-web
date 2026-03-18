import { useEffect, useRef, useState } from "react";

interface DamageEntry {
  id: number;
  value: number;
  isCrit: boolean;
  type: "dealt" | "taken";
  offsetX: number;
}

interface FloatingDamageProps {
  damage: number;
  isCrit: boolean;
  type: "dealt" | "taken";
  trigger: number; // increment to spawn a new number
}

export default function FloatingDamage({ damage, isCrit, type, trigger }: FloatingDamageProps) {
  const [entries, setEntries] = useState<DamageEntry[]>([]);
  const nextIdRef = useRef(0);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (trigger === 0 || damage === 0) return;

    const id = nextIdRef.current++;
    setEntries((prev) => [
      ...prev,
      { id, value: damage, isCrit, type, offsetX: Math.random() * 40 - 20 },
    ]);

    timersRef.current.set(
      id,
      setTimeout(() => {
        setEntries((prev) => prev.filter((e) => e.id !== id));
        timersRef.current.delete(id);
      }, 900)
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally capturing snapshot of damage/isCrit/type at trigger time
  }, [trigger]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {entries.map((entry) => (
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
            marginLeft: `${entry.offsetX}px`,
          }}
        >
          {entry.isCrit && "★ "}
          -{entry.value}
          {entry.isCrit && " ★"}
        </div>
      ))}
    </div>
  );
}
