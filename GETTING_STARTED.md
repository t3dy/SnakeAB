# Getting Started with SNAKEAB

## Quick Start

```bash
cd C:\Dev\SNAKEAB
npm install
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## What You'll See

### First Run
1. **20×20 grid** with colored tiles (green grass, blue river, gray rocky, red hazard)
2. **Snake** (blue square) at bottom-left
3. **Goal** (green flag) at top-right
4. **Food** (yellow circles) scattered on the map
5. **Predators** (orange circles) roaming the world

### Controls
- **Start Simulation** — Begin the game
- **Pause** — Pause/resume
- **Step** — Advance one turn manually
- **Speed Slider** — Control tick speed (0.1x to 2x)
- **Difficulty** — Easy/Medium/Hard (affects terrain density)
- **Seed** — Reproducible world generation

### Gameplay
1. Click **Start**
2. Watch snake move autonomously toward the goal
3. Snake encounters entities (food, predators, terrain)
4. When encounter happens, simulation pauses (Phase 2: player will make decisions)
5. Check the debug log for what's happening

---

## How the Game Works

### The World
- **Terrain types**: Grass (passable), River (blocked unless swimming), Rocky (blocked unless climbing), Dirt (slow), Hazard (damage)
- **Entities**: Snake, Food, Predators, Goal
- **Seeded generation**: Same seed = same world layout

### The Snake
- Moves autonomously toward the goal using A* pathfinding
- Affected by personality and equipment (foundation for Phase 2)
- Health decreases in hazard zones
- Game ends if health reaches 0 or snake reaches goal

### Encounters
When snake meets an entity, simulation pauses:
- **Food**: Gain health
- **Predator**: Combat (Phase 2: choose fight/flee/hide)
- **Hazard**: Take damage

---

## Project Structure

```
C:\Dev\SNAKEAB/
├── src/                     ← Source code
│   ├── world/               ← World generation and terrain
│   ├── agents/              ← Snake AI and pathfinding
│   ├── encounters/          ← Encounter system (Phase 2)
│   ├── ui/                  ← Rendering and interface
│   ├── sim/                 ← Main game loop
│   └── index.html + main.js ← Entry point
│
├── tests/                   ← Unit tests (20 passing)
├── package.json             ← Dependencies
└── README.md                ← Technical overview
```

---

## Key Files to Understand

**If you want to...**

- **Understand the world** → Read `src/world/World.js`
- **Learn procgen** → Read `src/world/ProcGen.js`
- **See snake AI** → Read `src/agents/SnakeAgent.js` + `src/agents/Pathfinding.js`
- **Understand game loop** → Read `src/sim/Simulator.js`
- **See rendering** → Read `src/ui/Renderer.js`
- **Run tests** → `npm test`

---

## Debugging

### Enable Logs
The debug log on the right side shows real-time game events:
- Snake movement
- Encounters
- Damage taken
- Scores

### Check Tests
```bash
npm test
```

All 20 tests should pass. If any fail, the system is broken.

### Modify Difficulty
Change the seed and difficulty to explore different worlds:
- **Easy**: Sparse terrain, gentle
- **Medium**: Moderate challenges
- **Hard**: Dense obstacles, many predators

---

## What's Implemented vs. What's Not

### ✅ Implemented (Phase 1)
- World generation with validation
- A* pathfinding
- Snake autonomous movement
- Real-time rendering
- Collision detection
- Encounter triggering

### ⏳ Coming Soon (Phase 2)
- Encounter decisions (fight, flee, hide, gather, etc.)
- Personality-driven AI decisions
- Combat resolution
- Equipment effects

### ⏳ Later (Phase 3-4)
- Draft UI (pick snake attributes)
- Encounter display popups
- Flavor text and story
- Full progression system

---

## Architecture Philosophy

**One-way data flow:**
```
Simulator (source of truth)
    ↓
    ├→ Updates SnakeAgent state
    ├→ Updates World state
    └→ Triggers Encounters
         ↓
         Renderer reads state and draws to canvas
         UI reads state and updates display
```

**No circular dependencies:**
- Renderer reads state but never modifies it
- UI dispatches events to Simulator
- Simulator is the only thing that changes state

---

## Next Steps for Development

### To add Phase 2 (Encounter System):
1. Implement `src/encounters/EncounterTypes.js` with 5 types
2. Implement `src/encounters/EncounterResolver.js` with decision logic
3. Wire into `src/sim/Simulator.js` in the `resolveEncounter()` method
4. Write tests

See `C:\Dev\SnakeAutobattler\PLAN.md` for full spec.

### To run tests while developing:
```bash
npm run test:watch
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot find module" | Run `npm install` |
| Port 5173 in use | Change port in `vite.config.js` |
| Snake doesn't move | Check browser console for errors |
| Procgen crash | Check seed/difficulty settings |
| Tests fail | Run `npm test` to see which one; check error message |

---

## Resources

- **Full Design**: `C:\Dev\SnakeAutobattler\DESIGN.md`
- **Engineering Plan**: `C:\Dev\SnakeAutobattler\PLAN.md`  
- **Phase 1 Summary**: `PHASE_1_COMPLETE.md`
- **Architecture**: `ENGINEERING_SUMMARY.md`

---

## Have Fun!

The game is designed to show **emergent storytelling** through autonomous AI decisions. In Phase 2, your draft choices (personality, equipment) will directly affect how the snake responds to encounters.

For now, watch how the seeded world generation creates different maps, and how the A* pathfinding navigates around obstacles. The foundation is solid!

