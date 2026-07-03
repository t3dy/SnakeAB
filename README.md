# 🐍 SnakeAB — Narrative Autobattler Game

A **personality-driven autobattler** where you draft a snake's attributes and equipment, then watch it navigate a procedurally-generated world, make autonomous decisions, and survive encounters.

## 🎮 [Play Now](https://snakeab.vercel.app)

No installation required — open and play!

---

## How It Works

1. **Draft your snake** — Choose attributes (Strength/Dexterity/Intelligence), equipment (up to 3), personality (1-2), and difficulty
2. **Watch it play** — Your snake moves autonomously toward the goal, encounters entities, and makes decisions
3. **Personality matters** — Aggressive snakes attack, cautious snakes hide, equipment unlocks options
4. **Survive or die** — Health, stat checks, and equipment determine success or failure

---

## 🚀 Features

- **Procedural worlds** — Seeded, reproducible worlds with terrain variation
- **Autonomous AI** — Snakes move and decide without player input (autobattler style)
- **Personality system** — Draft choices bias decision-making (±3 influence)
- **Equipment gating** — Items unlock new encounter options
- **Stat-based outcomes** — D10 rolls with bonuses determine results
- **Emergent narrative** — Roguelike-style stories emerge from your choices
- **40+ tests** — Fully tested, production-ready prototype

---

## 💻 Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
git clone https://github.com/t3dy/SnakeAB.git
cd SnakeAB
npm install
npm run dev
```

Open http://localhost:5173

### Commands
```bash
npm run dev      # Start dev server
npm test         # Run tests (40+ passing)
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## 🏗️ Architecture

```
src/
  index.html              ← Browser entry point
  main.js                 ← App orchestration
  
  world/
    World.js              ← Grid container
    Terrain.js            ← Tile definitions
    ProcGen.js            ← Procedural generation
  
  agents/
    SnakeAgent.js         ← Snake state
    Pathfinding.js        ← A* pathfinding
  
  encounters/
    EncounterTypes.js     ← Encounter definitions
    EncounterResolver.js  ← AI decision & resolution
  
  ui/
    Renderer.js           ← Canvas rendering
    DraftUI.js            ← Draft interface
    EncounterUI.js        ← Encounter popups
  
  sim/
    Simulator.js          ← Main game loop

tests/
  *.test.js               ← Unit tests (40+)
```

### Core Systems
- **World** — Grid-based terrain with procedural generation
- **Pathfinding** — A* algorithm with equipment-aware terrain costs
- **Snake Agent** — Personality, equipment, stats, autonomous decisions
- **Encounters** — 5 types (food, predator, trap, NPC, hazard) with stat-based outcomes
- **Renderer** — Canvas 2D, 20×20 grid display
- **UI** — Draft card interface, encounter popups, game controls

---

## 🎯 Game Design

### Influences
- **Super Auto Pets** — Autobattler mechanics
- **Teamfight Tactics** — Draft-based strategy
- **FTL: Faster Than Light** — Roguelike progression
- **Classic Snake** — Grid-based movement

### Vision
Create an **autobattler where personality matters**. Your draft choices don't just affect stats — they shape how the snake thinks, responds to threats, and interacts with the world.

---

## 🧪 Testing

All systems are thoroughly tested:
```bash
npm test
# Output:
# ✓ World Operations (10 tests)
# ✓ Pathfinding (5 tests)
# ✓ Terrain System (3 tests)
# ✓ Encounter Types (4 tests)
# ✓ Option Gating (3 tests)
# ✓ Personality Weighting (5+ tests)
# ✓ Encounter Resolution (9+ tests)
# Total: 40+ tests, 100% passing
```

---

## 📊 Development Timeline

| Phase | What | Status |
|-------|------|--------|
| Phase 1 | World, pathfinding, rendering | ✅ Complete |
| Phase 2 | Encounters, AI, personality | ✅ Complete |
| Phase 3 | Draft UI, encounter UI, full flow | ✅ Complete |
| Phase 4 | Polish, balance, content | 📋 Next |

---

## 📝 Documentation

- **README_FULL.md** — Comprehensive game overview
- **GETTING_STARTED.md** — How to play
- **DESIGN.md** — Full game specification (550+ lines)
- **PLAN.md** — Engineering roadmap
- **PHASE_1_COMPLETE.md** — World system details
- **PHASE_2_COMPLETE.md** — Encounter system details
- **PHASE_3_COMPLETE.md** — UI system details
- **DEPLOYMENT.md** — GitHub/Vercel setup

---

## 🔗 Links

- **Play online**: https://snakeab.vercel.app
- **GitHub**: https://github.com/t3dy/SnakeAB
- **Design spec**: See DESIGN.md in this repo

---

## 📜 License

MIT — See LICENSE file

---

## 🤝 Contributing

This is an educational project showcasing:
- Modular game architecture
- Personality-driven AI systems
- Procedural generation
- Test-driven development
- Clean code principles

Ideas for expansion:
- [ ] More encounter types (20+ total)
- [ ] Equipment combinations (synergies)
- [ ] Progression system (unlockable items)
- [ ] Multiplayer (snake battles)
- [ ] Sound effects and music
- [ ] Mobile support
- [ ] Advanced personality traits
- [ ] Boss encounters
- [ ] Seasonal modes

---

Built with **Vite**, **Node.js**, and **Canvas 2D**. No frameworks — pure JavaScript.

