# CyberSlayer

A turn-based cybersecurity combat game built for the browser. Breach 10 corporate network zones, exploit enemy weaknesses, and secure the network.

## Gameplay

You are an operator infiltrating a corporate network. Each zone contains a threat — from Script Kiddies to Advanced Persistent Threats. Choose your attacks wisely:

| Weapon | Damage | Ammo | Description |
|--------|--------|------|-------------|
| **Ping** | 8 | Infinite | ICMP trace — always available |
| **Nmap** | 15 | Limited | Port scanner — ammo replenished between zones |
| **Metasploit** | 30 | Rare | Exploit kit — powerful but scarce |

### Mechanics

- **Weakness system** — Each enemy is weak to one weapon. Hitting the weakness deals 2x damage (shown as a critical hit).
- **Enemy specials** — Some enemies have abilities:
  - **Replicate** — 1.5x attack damage every 3rd turn
  - **Encrypt** — Halves your damage every 2nd turn
  - **Adapt** — Resists repeated use of the same weapon
- **Shield** — Absorbs incoming damage before HP is affected. Gained between zones.
- **Loot** — Clearing a zone heals HP and restocks ammo.

### Controls

| Key | Action |
|-----|--------|
| `1` | Ping |
| `2` | Nmap |
| `3` | Metasploit |

Or click the attack buttons.

## Effects

- Floating damage numbers on hits
- Screen shake on critical hits and taking damage
- Synthesized retro sound effects (Web Audio API — no audio files)
- CRT scanlines, terminal grid, and glow effects
- Animated combat log with color-coded messages

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
    gameEngine.ts    # Levels, damage calc, enemy turns, loot
    sounds.ts        # Synthesized retro sound effects
    saveData.ts      # LocalStorage persistence
  hooks/
    useGameState.ts  # Game state reducer + keyboard controls
  components/
    BattleScreen.tsx  # Main combat UI
    EndScreen.tsx     # Victory/defeat screen
    FloatingDamage.tsx # Animated damage numbers
    ZoneProgress.tsx  # Zone progress indicator
  pages/
    Index.tsx         # Intro screen + routing between phases
```

## License

MIT
