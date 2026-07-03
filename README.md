# SNAKEAB — Engineering Project

Active engineering project for the **SnakeAutobattler** game.

## Quick Start

```bash
cd C:\Dev\SNAKEAB
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

## Design Reference

Full design documentation is in `C:\Dev\SnakeAutobattler\`:
- **DESIGN.md** — Complete game specification
- **PLAN.md** — Engineering roadmap
- **HANDOVER.md** — Current state & open questions

## Project Structure

```
src/
  index.html              ← Browser entry point
  main.js                 ← App orchestration & main loop
  
  world/
    World.js              ← Grid container
    Terrain.js            ← Tile type definitions
    ProcGen.js            ← Procedural generation
  
  agents/
    SnakeAgent.js         ← Snake state management
    Pathfinding.js        ← A* pathfinding
    DecisionEngine.js     ← AI decision logic (Phase 2)
  
  encounters/
    EncounterTypes.js     ← Encounter definitions
    EncounterResolver.js  ← Scene resolution (Phase 2)
  
  ui/
    Renderer.js           ← Canvas rendering
    DraftUI.js            ← Draft interface (Phase 3)
  
  sim/
    Simulator.js          ← Main game loop

tests/
  *.test.js               ← Unit tests
```

## Current Phase

**Phase 1: World & Simulation Foundation** ✅ (In Progress)

### Implemented
- ✅ World grid management (add/move/remove entities)
- ✅ Terrain system (tile types, passability)
- ✅ Procedural generation (seeded, terrain distribution, pathfinding validation)
- ✅ A* pathfinding (shortest path, equipment-aware)
- ✅ Snake agent state (health, score, personality)
- ✅ Main simulator loop (movement, collision detection, encounters)
- ✅ Canvas renderer (grid display, entities, snake)
- ✅ Basic UI controls (start, pause, step, speed)

### Upcoming (Phase 1.4)
- [ ] Entity encounter collision detection
- [ ] Encounter resolution system
- [ ] Draft UI (Phase 3)
- [ ] Encounter popup display (Phase 3)

## Testing

```bash
npm test                  # Run tests once
npm run test:watch      # Watch mode
```

## Development Rules

1. **Test-first**: Write failing test → implement → verify
2. **No console logs** in production code
3. **Encounters gated**: Options only available with required stats/equipment
4. **Procgen validates**: Pathfinding checked before accepting world
5. **Design-first**: Read `C:\Dev\SnakeAutobattler\DESIGN.md` for spec

## Architecture Notes

- **World** is a grid container; doesn't know about game rules
- **Simulator** orchestrates everything: moves snake, checks collisions, triggers encounters
- **Pathfinding** is decoupled: works on any world, any equipment
- **SnakeAgent** is pure state: stats, inventory, personality — no simulation logic
- **Renderer** reads state and draws; never modifies state

## Next Steps

1. **Complete Phase 1**: Encounter collision detection + resolution
2. **Phase 2**: Full encounter system with all 5 types (predator, food, trap, NPC, hazard)
3. **Phase 3**: Draft UI + encounter display popups
4. **Phase 4**: Polish, balance, comprehensive tests

## Links

- Design: `C:\Dev\SnakeAutobattler\DESIGN.md`
- Roadmap: `C:\Dev\SnakeAutobattler\PLAN.md`
- Previous work: `C:\Dev\SnakeAutobattler\` (design archive)

