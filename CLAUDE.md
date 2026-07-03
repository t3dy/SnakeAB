# SNAKEAB — Engineering Project

**Active engineering project** for the SnakeAutobattler game.

**Design docs** are in `C:\Dev\SnakeAutobattler\`:
- Read `C:\Dev\SnakeAutobattler\CLAUDE.md` first
- Then `C:\Dev\SnakeAutobattler\DESIGN.md` for full spec
- Then `C:\Dev\SnakeAutobattler\PLAN.md` for roadmap

**This directory** contains the implementation.

## Quick Start

```bash
cd C:\Dev\SNAKEAB
npm install
npm run dev
# Open http://localhost:5173
```

## Structure

```
src/
  index.html              ← Entry point
  main.js                 ← App initialization
  world/
    World.js              ← Grid container
    Terrain.js            ← Tile definitions
    ProcGen.js            ← Procedural generation (Phase 1)
  agents/
    SnakeAgent.js         ← Snake state
    Pathfinding.js        ← A* pathfinding (Phase 1)
    DecisionEngine.js     ← AI decision logic (Phase 2)
  encounters/
    EncounterTypes.js     ← Encounter definitions
    EncounterResolver.js  ← Scene resolution (Phase 2)
  ui/
    Renderer.js           ← Canvas rendering (Phase 3)
    DraftUI.js            ← Draft interface (Phase 3)
  sim/
    Simulator.js          ← Main loop (Phase 1)
```

## Current Phase

**Phase 1: World & Simulation Foundation**

### Tasks (In Progress)
- [ ] **1.1** Procgen world generation with terrain distribution
- [ ] **1.2** A* pathfinding with personality bias
- [ ] **1.3** Main simulator loop (move, collide, encounter)

### Acceptance Gates
- World generated at all difficulties with valid pathfinding
- Snake can pathfind across generated world
- Personality affects movement decisions
- Full simulation runs start → goal with encounters triggered

## Testing

```bash
npm test                  # Run all tests once
npm run test:watch      # Watch mode
```

Tests should be written **first** (TDD). See `tests/` for examples.

## Agent Specializations

From `.claude/settings.json`:
- **serpent-architect** → `src/world/*`, `src/encounters/*`
- **decision-engine** → `src/agents/*`, encounter resolver
- **ui-forge** → `src/ui/*`, `src/main.js`
- **test-warden** → `tests/`, scenario validation

## Standing Rules

1. **Design-first**: Spec is in `C:\Dev\SnakeAutobattler\DESIGN.md`
2. **Test-first**: Write failing test, implement, verify
3. **No console logs** in production (use debug flag)
4. **Encounters are gated**: Options unavailable without required stats/equipment
5. **Procgen validates**: Pathfinding checked before accepting world

