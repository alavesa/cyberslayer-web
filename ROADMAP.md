# CyberSlayer Roadmap

## Phase 1: Expanded Arsenal (New Attacks)

Currently: 3 weapons (Ping, Nmap, Metasploit)

| Weapon | Damage | Ammo | Real-world tool |
|---|---|---|---|
| **Wireshark** | 14 | Limited | Packet analyzer — bonus dmg to network-type enemies |
| **Burp Suite** | 22 | Limited | Web app scanner — strong vs web-layer threats |
| **Hashcat** | 28 | Rare | Password cracker — bypasses encrypt special |
| **Firewall** | 0 (defensive) | Cooldown | Blocks next enemy attack entirely |
| **Honeypot** | Special | 1/zone | Lure enemy into attacking itself for 1 turn |
| **John the Ripper** | 20 | Limited | Brute-force — multi-hit (2 smaller attacks) |

Expands weapon bar to 4-6 slots with a scrollable/paged weapon selector on mobile.

## Phase 2: New Threats & Zones (Expanded Campaign)

Currently: 10 zones, 10 enemies, 3 specials (replicate, encrypt, adapt)

### New enemy specials

| Special | Effect | Enemies |
|---|---|---|
| **Exfiltrate** | Steals player shield each turn | Spyware, Infostealer |
| **Polymorphic** | Changes weakness every 2 turns | Polymorphic Virus |
| **DDoS** | Multi-hit (2-3 smaller attacks per turn) | Botnet |
| **Privilege Escalation** | ATK increases each turn it survives | Rootkit v2, Insider Threat |
| **Obfuscate** | Hides weakness hint until scanned | Fileless Malware |
| **Phish Chain** | On hit, spawns a weaker "Credential" minion | Spear Phisher |

### New enemies & zones (extend to 15-20 zones)

| Zone | Enemy | Special |
|---|---|---|
| VPN Gateway | Botnet | DDoS |
| Cloud Instance | Cryptominer | Privilege Escalation |
| CI/CD Pipeline | Supply Chain Atk | Polymorphic |
| IoT Network | Mirai Variant | Replicate + DDoS |
| Backup Server | Wiper Malware | Encrypt (irreversible) |
| SOC Dashboard | Insider Threat | Obfuscate |
| DNS Server | DNS Tunneler | Exfiltrate |
| VoIP System | Vishing Bot | Phish Chain |
| Honeypot Lab | Fileless Malware | Obfuscate |
| Air-Gapped Net | State Actor | Adapt + Privilege Escalation |

## Phase 3: Player Progression

- **Skill tree** — unlock new weapons and passive buffs between runs (persistent across games)
- **Perks** — choose 1 of 3 random perks after clearing every 3rd zone (e.g., "+10% crit dmg", "shield regen", "extra ammo drops")
- **Loadout selection** — pick 4 weapons from your unlocked arsenal before each run
- **Achievements** — "Beat the game without using Metasploit", "Clear 5 zones without taking damage", etc.

## Phase 4: Advanced Combat Mechanics

- **Status effects** — poison (DoT), stun (skip enemy turn), weaken (reduce enemy ATK)
- **Combo system** — using specific weapon sequences triggers bonus effects (e.g., Nmap → Metasploit = "Targeted Exploit" for 1.5x)
- **Defense actions** — use a turn to Patch (heal), Harden (gain shield), or Analyze (reveal weakness)
- **Boss phases** — final boss (APT / State Actor) has multiple phases with changing specials and a health gate

## Phase 5: Game Modes

- **Endless mode** — infinite zones with scaling difficulty, leaderboard by zones cleared
- **Daily challenge** — fixed seed run, everyone gets same enemies/RNG, compete on turn count
- **Speed run mode** — timer + turn counter, global leaderboard
- **Multiplayer (PvP)** — take turns attacking each other's "network" (stretch goal)

## Phase 6: Polish & Content

- **Sound overhaul** — unique attack sounds per weapon, enemy-specific ambient sounds
- **Story bits** — short narrative text between zones (intercepted comms, threat intel briefings)
- **Unlockable ASCII art skins** — alternate operator appearances
- **Mobile PWA** — installable app with offline support
- **Accessibility** — screen reader support, high contrast mode, reduced motion
