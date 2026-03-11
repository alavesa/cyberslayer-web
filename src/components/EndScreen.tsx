import { getRank, getRandomWisdom, NUM_LEVELS, LEVELS, ENEMY_INFO, ZONE_INFO, WEAPON_INFO } from "@/lib/gameEngine";
import type { GameState } from "@/hooks/useGameState";
import ZoneProgress from "./ZoneProgress";
import MuteButton from "./MuteButton";
import ScaledArt from "./ScaledArt";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface EndScreenProps {
  state: GameState;
  playAgain: () => void;
  goToMenu: () => void;
}

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

const VICTORY_QUIPS = [
  "Time to update your LinkedIn to 'Ethical Hacker'.",
  "Network secured! Your reward: another compliance audit.",
  "You did it! Now do the mandatory security training anyway.",
  "The CISO is buying you coffee. Decaf, budget cuts.",
  "Achievement unlocked: Not Getting Fired.",
];

const DEFEAT_QUIPS: Record<string, string[]> = {
  gate: [
    "You got hacked by someone who learned from YouTube.",
    "The Script Kiddie is updating their blog about this.",
  ],
  dmz: [
    "The DMZ was a hostile place. Who knew?",
    "Even the firewall felt sorry for you.",
  ],
  deep: [
    "IT security wants a word with you.",
    "At least you made it past the intern's laptop.",
  ],
  almost: [
    "So close! The APT sends its regards. And a phishing email.",
    "You almost had it. 'Almost' doesn't patch vulnerabilities.",
  ],
  final: [
    "The APT is now using your attack as a case study.",
    "One more hit would've done it. The APT is laughing.",
  ],
};

// Defeat tiers based on how far the player got
function getDefeatTier(level: number) {
  if (level === 0) return {
    label: "INTERCEPTED AT THE GATE",
    subtitle: "The perimeter defenses held you back.",
    quip: pick(DEFEAT_QUIPS.gate),
    emoji: "◈",
    color: "text-destructive",
    glow: "glow-red",
    borderClass: "defeat-banner-early",
    encouragement: "Every great hacker started somewhere. Study the basics — even ping can be powerful when used at the right moment.",
    secTip: "Perimeter security is the first line of defense. Firewalls, IDS/IPS systems, and network access control lists work together to filter unauthorized traffic before it reaches internal systems.",
  };
  if (level <= 2) return {
    label: "CAUGHT IN THE DMZ",
    subtitle: "You breached the outer layers but couldn't go deeper.",
    quip: pick(DEFEAT_QUIPS.dmz),
    emoji: "◈◈",
    color: "text-orange-400",
    glow: "glow-yellow",
    borderClass: "defeat-banner-mid-early",
    encouragement: "You're getting past the basics. Learn to read enemy patterns — some threats replicate, others encrypt your tools.",
    secTip: "The DMZ (Demilitarized Zone) hosts public-facing services isolated from the internal network. Compromising a DMZ server shouldn't give access to internal resources — that's the power of network segmentation.",
  };
  if (level <= 5) return {
    label: "DEEP BREACH DETECTED",
    subtitle: "You infiltrated the core network before being caught.",
    quip: pick(DEFEAT_QUIPS.deep),
    emoji: "◈◈◈",
    color: "text-accent",
    glow: "glow-yellow",
    borderClass: "defeat-banner-mid",
    encouragement: "Impressive progress. The inner zones require careful weapon management — save your strongest exploits for the toughest threats.",
    secTip: "Lateral movement is how attackers pivot from one compromised system to another. Techniques include pass-the-hash, token impersonation, and exploiting trust relationships between systems.",
  };
  if (level <= 8) return {
    label: "ALMOST THERE",
    subtitle: "The core router was within reach...",
    quip: pick(DEFEAT_QUIPS.almost),
    emoji: "◈◈◈◈",
    color: "text-secondary",
    glow: "glow-pink",
    borderClass: "defeat-banner-late",
    encouragement: "So close! The final zones demand adaptability. The APT learns your patterns — vary your attacks to stay unpredictable.",
    secTip: "Advanced threats use adaptive techniques: polymorphic code changes its signature to evade detection, while living-off-the-land attacks use legitimate system tools, making them nearly invisible to traditional antivirus.",
  };
  return {
    label: "ONE STEP FROM VICTORY",
    subtitle: "The APT proved too resilient at the final gate.",
    quip: pick(DEFEAT_QUIPS.final),
    emoji: "◈◈◈◈◈",
    color: "text-primary",
    glow: "glow-green",
    borderClass: "defeat-banner-final",
    encouragement: "You reached the final boss! The APT adapts to repeated attacks — switch weapons each turn to bypass its defenses.",
    secTip: "APT groups (like APT28, APT29, Lazarus Group) are state-sponsored teams that conduct prolonged cyber campaigns. They use zero-days, custom malware, and social engineering in coordinated, multi-stage attacks.",
  };
}

const VICTORY_FRAMES = [
`  +---+ +------+
  |^ ^| |root@#|
  | u | |$ WIN |
  +-+-+ +------+
   /|\\--~
/ \\`,
`  +---+ +------+
  |' '| |root@#|
  | u | |$ *** |
  +-+-+ +------+
   \\|/--~
/ \\`,
];

const DEFEAT_FRAMES = [
`  +---+ +------+
  |x x| |root@#|
  | - | |$ ERR |
  +-+-+ +------+
   /|\\
   / \\`,
`  +---+ +------+
  |- -| |root@#|
  | _ | |$ ... |
  +-+-+ +------+
   /|\\
   / \\`,
];

export default function EndScreen({ state, playAgain, goToMenu }: EndScreenProps) {
  const wisdom = useMemo(() => getRandomWisdom(), []);
  const victoryQuip = useMemo(() => pick(VICTORY_QUIPS), []);
  const rank = getRank(state.level);
  const [expandedZone, setExpandedZone] = useState<number | null>(null);
  const [legendTooltip, setLegendTooltip] = useState<"weakness" | "brute" | null>(null);
  const [artFrame, setArtFrame] = useState(0);
  const zoneRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleZoneClick = useCallback((zoneIndex: number) => {
    setExpandedZone(expandedZone === zoneIndex ? null : zoneIndex);
    setTimeout(() => {
      zoneRefs.current[zoneIndex]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 50);
  }, [expandedZone]);

  useEffect(() => {
    const timer = setInterval(() => setArtFrame((f) => (f + 1) % 2), 800);
    return () => clearInterval(timer);
  }, []);

  // Zones the player breached
  const breachedZones = LEVELS.slice(0, state.level);
  // The zone they died on (if defeat)
  const failedZone = !state.victory && state.level < NUM_LEVELS ? LEVELS[state.level] : null;
  // Defeat tier messaging
  const defeatTier = !state.victory ? getDefeatTier(state.level) : null;

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-start sm:justify-center p-3 sm:p-4 relative overflow-hidden terminal-grid scanlines crt-glow">
      {/* Victory particle effects */}
      {state.victory && (
        <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
          {Array.from({ length: 24 }, (_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${(i * 4.3) % 100}%`,
                animationDelay: `${(i * 0.2) % 2}s`,
                animationDuration: `${2.5 + (i % 3) * 0.8}s`,
              }}
            >
              <div
                className="w-2 h-2"
                style={{
                  background: ['hsl(160 100% 50%)', 'hsl(320 100% 60%)', 'hsl(50 100% 55%)', 'hsl(200 100% 55%)'][i % 4],
                  transform: `rotate(${i * 37}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Mute button */}
      <div className="fixed top-3 right-3 z-20">
        <MuteButton />
      </div>

      <div className="relative z-10 w-full max-w-md animate-flicker py-4 sm:py-0">
        {/* Result header */}
        <div className={`px-4 py-6 sm:px-6 sm:py-8 text-center mb-4 sm:mb-6 ${state.victory ? 'victory-banner' : defeatTier?.borderClass || 'bubble'}`}>
          {state.victory ? (
            <>
              <p className="font-pixel text-[10px] sm:text-xs text-primary glow-green tracking-widest mb-2 sm:mb-3 animate-pulse">
                ◈ ◈ ◈ MISSION COMPLETE ◈ ◈ ◈
              </p>
              <h1 className="font-pixel text-sm sm:text-base md:text-lg text-primary glow-green leading-relaxed mb-2 sm:mb-3 animate-victory-glow">
                NETWORK SECURED!
              </h1>
              <ScaledArt
                art={VICTORY_FRAMES[artFrame]}
                className="h-20 sm:h-24 my-3 sm:my-4"
                artClassName="text-primary/80 glow-green enemy-idle"
              />
              <p className="font-pixel text-2xl sm:text-3xl md:text-4xl text-accent glow-yellow animate-victory-bounce">
                VICTORY
              </p>
              <div className="mt-4 flex justify-center gap-1">
                {['V','I','C','T','O','R','Y'].map((ch, i) => (
                  <span
                    key={i}
                    className="font-pixel text-xs animate-victory-letter"
                    style={{
                      animationDelay: `${i * 0.1}s`,
                      color: ['hsl(160 100% 50%)', 'hsl(200 100% 55%)', 'hsl(50 100% 55%)', 'hsl(320 100% 60%)'][i % 4],
                    }}
                  >
                    {ch}
                  </span>
                ))}
              </div>
              <p className="font-terminal text-xs text-primary/50 mt-3 italic">
                {victoryQuip}
              </p>
            </>
          ) : defeatTier && (
            <>
              <p className={`font-pixel text-xs ${defeatTier.color} ${defeatTier.glow} tracking-widest mb-3`}>
                {defeatTier.emoji} MISSION FAILED {defeatTier.emoji}
              </p>
              <h1 className={`font-pixel text-sm md:text-base ${defeatTier.color} ${defeatTier.glow} leading-relaxed mb-2`}>
                {defeatTier.label}
              </h1>
              <ScaledArt
                art={DEFEAT_FRAMES[artFrame]}
                className="h-20 sm:h-24 my-3"
                artClassName={`${defeatTier.color} opacity-60`}
              />
              <p className="font-terminal text-sm text-muted-foreground mt-2">
                {defeatTier.subtitle}
              </p>
              <p className="font-terminal text-xs text-muted-foreground/50 mt-1 italic">
                {defeatTier.quip}
              </p>
              {/* Progress visualization */}
              <div className="mt-4 flex justify-center items-center gap-0.5">
                {Array.from({ length: NUM_LEVELS }, (_, i) => (
                  <div
                    key={i}
                    className={`h-2 transition-all duration-300 ${
                      i < state.level
                        ? "w-3 bg-primary/70"
                        : i === state.level
                          ? "w-3 bg-destructive/80 animate-pulse"
                          : "w-3 bg-muted/20"
                    }`}
                  />
                ))}
              </div>
              <p className="font-pixel text-[11px] text-muted-foreground mt-2">
                {Math.round((state.level / NUM_LEVELS) * 100)}% INFILTRATED
              </p>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="bg-card pixel-border p-3 sm:p-4 space-y-2 mb-4 sm:mb-6">
          <div className="font-pixel text-[11px] text-muted-foreground tracking-wider mb-2">
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
          <div className="flex justify-between bg-muted/20 px-3 py-2 border border-border/20 font-terminal text-sm">
            <span className="text-muted-foreground">TOTAL TURNS:</span>
            <span className="text-cyan-400 glow-blue">{state.totalTurns}</span>
          </div>

          <div className="flex items-center justify-center pt-2">
            <ZoneProgress
              currentLevel={state.level}
              totalLevels={NUM_LEVELS}
              victory={state.victory}
              defeat={!state.victory}
              zoneCrits={state.zoneCrits}
              onZoneClick={handleZoneClick}
            />
          </div>
          {state.zoneCrits.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-center gap-4 font-terminal text-[11px]">
                <button
                  onClick={() => setLegendTooltip(legendTooltip === "weakness" ? null : "weakness")}
                  className="flex items-center gap-1.5 min-h-[44px] px-2 hover:bg-muted/20 transition-colors cursor-pointer"
                >
                  <span className="w-2.5 h-2.5 bg-primary/60 border border-primary/50 inline-block" />
                  <span className={`${legendTooltip === "weakness" ? "text-primary underline" : "text-muted-foreground"}`}>Weakness used</span>
                </button>
                <button
                  onClick={() => setLegendTooltip(legendTooltip === "brute" ? null : "brute")}
                  className="flex items-center gap-1.5 min-h-[44px] px-2 hover:bg-muted/20 transition-colors cursor-pointer"
                >
                  <span className="w-2.5 h-2.5 bg-orange-400/80 border border-orange-300/60 inline-block" />
                  <span className={`${legendTooltip === "brute" ? "text-orange-400 underline" : "text-muted-foreground"}`}>Brute forced</span>
                </button>
              </div>
              {legendTooltip && (
                <div className="mt-1 mx-2 px-3 py-2 bg-muted/20 border border-border/30 font-terminal text-xs text-muted-foreground leading-relaxed animate-slide-down">
                  {legendTooltip === "weakness"
                    ? "Exploiting a known vulnerability is the most efficient attack vector. In real penetration testing, reconnaissance reveals which tools and techniques are most effective against specific targets — just like using the right weapon against an enemy's weakness."
                    : "Brute forcing means overpowering a target without exploiting a specific weakness. It works, but costs more resources. In cybersecurity, brute-force attacks try every possible combination — slower and noisier than targeted exploits."}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Wisdom - highlighted */}
        <div className="wisdom-panel p-3 sm:p-5 text-center mb-4 sm:mb-6 relative overflow-hidden">
          <div className="absolute inset-0 wisdom-shimmer" />
          <div className="relative z-10">
            <p className="font-pixel text-[11px] text-cyan-300 tracking-widest mb-3">
              ◇ ORACLE TRANSMISSION ◇
            </p>
            <p className="text-cyan-300 font-terminal text-sm sm:text-base glow-blue leading-relaxed">
              "{wisdom}"
            </p>
            <div className="mt-3 flex justify-center gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-cyan-400/60 animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Educational: Zone Report */}
        <div className="bg-card pixel-border-green p-3 sm:p-4 mb-4 sm:mb-6">
          <p className="font-pixel text-[11px] text-primary/80 tracking-wider mb-1">
            INTEL REPORT — ZONES BREACHED
          </p>
          <p className="font-terminal text-xs text-muted-foreground/70 mb-3">
            Tap a zone to learn about real-world threats
          </p>

          {breachedZones.map((lvl, i) => (
            <div key={i} className="mb-2" ref={(el) => { zoneRefs.current[i] = el; }}>
              <button
                onClick={() => setExpandedZone(expandedZone === i ? null : i)}
                aria-expanded={expandedZone === i}
                className="w-full text-left bg-muted/20 px-3 py-2 border border-border/20 hover:border-primary/30 transition-colors cursor-pointer group"
              >
                <div className="flex justify-between items-center gap-2 min-w-0">
                  <span className="font-terminal text-sm text-primary/90 flex items-center gap-1 min-w-0">
                    <span className="shrink-0">{i + 1}.</span>
                    <span className="truncate">{lvl.zone}</span>
                    <span className={`text-[11px] shrink-0 transition-transform duration-200 ${expandedZone === i ? "rotate-90" : ""} text-primary/50 group-hover:text-primary/80`}>▶</span>
                  </span>
                  <span className="font-terminal text-xs sm:text-sm text-secondary/80 shrink-0">
                    {lvl.enemy} ✓
                  </span>
                </div>
              </button>
              {expandedZone === i && (
                <div className="bg-muted/10 px-3 py-2 border-x border-b border-border/20 space-y-2 animate-slide-down">
                  <div>
                    <p className="font-pixel text-[11px] text-cyan-400/80 tracking-wider mb-1">ZONE</p>
                    <p className="font-terminal text-sm text-muted-foreground leading-relaxed">
                      {ZONE_INFO[lvl.zone]}
                    </p>
                  </div>
                  <div>
                    <p className="font-pixel text-[11px] text-secondary/80 tracking-wider mb-1">THREAT</p>
                    <p className="font-terminal text-sm text-muted-foreground leading-relaxed">
                      {ENEMY_INFO[lvl.enemy]}
                    </p>
                  </div>
                  <div>
                    <p className="font-pixel text-[11px] text-accent/80 tracking-wider mb-1">WEAKNESS</p>
                    <p className="font-terminal text-sm text-muted-foreground">
                      {WEAPON_INFO[lvl.weakness].name} — {WEAPON_INFO[lvl.weakness].desc}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Failed zone info */}
          {failedZone && (
            <div className="mt-3 border-t border-destructive/30 pt-3">
              <div className="bg-destructive/10 px-3 py-2 border border-destructive/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-terminal text-sm text-destructive/90">
                    {state.level + 1}. {failedZone.zone}
                  </span>
                  <span className="font-terminal text-sm text-destructive/70">
                    vs {failedZone.enemy} ✗
                  </span>
                </div>
                <p className="font-pixel text-[11px] text-destructive/60 tracking-wider mb-1">WHAT STOPPED YOU</p>
                <p className="font-terminal text-sm text-muted-foreground leading-relaxed">
                  {ENEMY_INFO[failedZone.enemy]}
                </p>
                <p className="font-pixel text-[11px] text-accent/70 tracking-wider mt-2 mb-1">TIP</p>
                <p className="font-terminal text-sm text-accent/80">
                  This threat is weak to {WEAPON_INFO[failedZone.weakness].name}. {WEAPON_INFO[failedZone.weakness].desc}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Encouragement (defeat only) */}
        {defeatTier && (
          <div className="bg-card pixel-border-pink p-3 sm:p-4 mb-4 sm:mb-6">
            <p className="font-pixel text-[11px] text-secondary/80 tracking-wider mb-2">
              TACTICAL ADVICE
            </p>
            <p className="font-terminal text-sm text-muted-foreground leading-relaxed">
              {defeatTier.encouragement}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2 sm:gap-3 pb-4">
          <button
            onClick={goToMenu}
            className="flex-1 h-11 sm:h-14 bg-secondary/20 text-secondary pixel-btn tracking-widest border-secondary/40"
          >
            MENU
          </button>
          <button
            onClick={playAgain}
            className={`flex-1 h-11 sm:h-14 bg-primary/20 text-primary pixel-btn tracking-widest border-primary/40 ${state.victory ? 'attack-btn-pulse' : ''}`}
          >
            AGAIN
          </button>
        </div>
      </div>
    </div>
  );
}
