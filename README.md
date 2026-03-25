# CyberSlayer

[![Reviewed by PatchPilots](https://img.shields.io/badge/reviewed%20by-PatchPilots-blue)](https://github.com/alavesa/patchpilots)

A turn-based cybersecurity combat game built for the browser. Breach 10 corporate network zones, exploit enemy weaknesses, and secure the network. Inspired by the badge game https://github.com/alavesa/cyberslayer

**Play now: [https://cyberslayer.win/](https://cyberslayer.win/)**

![cyberslayer_linkedin](https://github.com/user-attachments/assets/cbf0b2c7-131f-490e-919c-837a4e26aef7)

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

### Terminal Commands

Type commands in the terminal input during battle:

| Command | Description |
|---------|-------------|
| `help` | List available commands |
| `scan` | Show current enemy stats and weakness |
| `status` | Show player HP, shield, ammo |
| `info <topic>` | Look up weapons, enemies, or zones |
| `whoami` | Show rank and progress |

Plus hidden easter eggs — try common Linux commands for surprises.

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
- Interactive combat terminal with command input (`help`, `scan`, `status`, `info`, `whoami`)
- Terminal easter eggs — try `sudo`, `vim`, `coffee`, `rm -rf /`, and more
- Tap-to-learn tooltips on combat log entries (weapons, enemies, zones, specials)
- Inline log animations (crit flash, damage slide, death shake, system reveal)
- VS badge overlay during battle phase
- Per-zone weakness tracking on end screen (tappable lights link to zone details)
- Tiered defeat screens (5 tiers) with cybersecurity tips, tactical advice, and humor
- Random victory and defeat quips
- Sarcastic wisdom quotes from the Oracle
- Educational info about real-world threats and network zones
- Content Security Policy and localStorage validation

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

## Roadmap

See [ROADMAP.md](ROADMAP.md) for the full development roadmap, including:

- **Phase 1** — Expanded arsenal (Wireshark, Burp Suite, Hashcat, Firewall, Honeypot, John the Ripper)
- **Phase 2** — New threats & zones (extend to 15-20 zones with new enemy specials like DDoS, Polymorphic, Exfiltrate)
- **Phase 3** — Player progression (skill tree, perks, loadouts, achievements)
- **Phase 4** — Advanced combat (status effects, combos, defense actions, boss phases)
- **Phase 5** — Game modes (tutorial, endless, daily challenge, speed run, PvP)
- **Phase 6** — Polish & content (sound, story, PWA, accessibility)

## License

MIT
