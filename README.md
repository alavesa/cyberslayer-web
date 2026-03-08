# CyberSlayer

A turn-based cybersecurity combat game built for the browser. Breach 10 corporate network zones, exploit enemy weaknesses, and secure the network. Inspired by the badge game https://github.com/alavesa/cyberslayer

## Gameplay

You are a **network operator** infiltrating a compromised corporate network. Your mission: breach 10 zones, eliminate the cyber threats within, and secure the network. Each zone contains a progressively more dangerous threat — from Script Kiddies to Advanced Persistent Threats. Choose your attacks wisely:

| Weapon | Damage | Ammo | Description |
|--------|--------|------|-------------|
| **Ping** | 10 | Infinite | ICMP Echo Request — always available |
| **Nmap** | 18 | Limited | Network Mapper — ammo replenished between zones |
| **Metasploit** | 32 | Rare | Exploit framework — powerful but scarce |

### Mechanics

- **Weakness system** — Each enemy is weak to one weapon. Hitting the weakness deals 2x damage (shown as a critical hit).
- **Enemy specials** — Some enemies have abilities:
  - **Replicate** — 1.5x attack damage every 3rd turn
  - **Encrypt** — Halves your damage every 2nd turn
  - **Adapt** — Resists repeated use of the same weapon
- **Shield** — Absorbs incoming damage before HP is affected. Gained between zones.
- **Loot** — Clearing a zone heals HP and restocks ammo.
- **Difficulty modes** — Easy, Normal, and Hard adjust player HP and enemy stats.
- **Speed run tracker** — Best turn count is saved on victory.

### Controls

| Key | Action |
|-----|--------|
| `1` | Ping |
| `2` | Nmap |
| `3` | Metasploit |

Or tap/click the attack buttons. Fully playable on mobile.

### Difficulty Modes

| Mode | Player HP | Enemy HP | Enemy ATK |
|------|-----------|----------|-----------|
| Easy | +30% | -25% | -25% |
| Normal | 100 HP | Standard | Standard |
| Hard | -20% | +25% | +25% |

## Features

- Operator briefing with animated ASCII art on the intro screen
- Animated 2-frame ASCII art for all enemies and the operator
- Responsive design — mobile (320px+), tablet, and desktop
- Mute/volume toggle with persistent preference
- Floating damage numbers on hits
- Screen shake on critical hits and taking damage
- Synthesized retro sound effects (Web Audio API — no audio files)
- CRT scanlines, terminal grid, and glow effects
- Scrollable combat log with color-coded messages
- VS badge overlay during battle phase
- Per-zone weakness tracking on end screen
- Tiered defeat screens (5 tiers) with cybersecurity tips and tactical advice
- Educational info about real-world threats and network zones

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Web Audio API (synthesized sounds)
- LocalStorage (persistent save data)

## Development

```sh
git clone https://github.com/alavesa/cyberslayer-web.git
cd cyberslayer-web
npm install
npm run dev
```

## Project Structure

```
src/
  lib/
    gameEngine.ts     # Levels, damage calc, enemy turns, loot, difficulty
    sounds.ts         # Synthesized retro sound effects + mute toggle
    saveData.ts       # LocalStorage persistence + speed run tracking
  hooks/
    useGameState.ts   # Game state reducer + keyboard controls
  components/
    BattleScreen.tsx  # Main combat UI
    EndScreen.tsx     # Victory/defeat screen with intel report
    FloatingDamage.tsx # Animated damage numbers
    ZoneProgress.tsx  # Zone progress indicator with weakness tracking
    MuteButton.tsx    # Shared mute/volume toggle
  pages/
    Index.tsx         # Intro screen + phase routing
```

## License

MIT
