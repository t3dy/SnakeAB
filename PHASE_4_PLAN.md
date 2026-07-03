# Phase 4: Feature Expansion & Polish

## Overview

Expand SnakeAB from a playable prototype to a feature-rich autobattler with meaningful equipment choices, varied encounters, progression, and polished UI.

---

## Phase 4A: Encounter Expansion

### Goals
- Add Medicine & Treasure entities
- Expand encounter outcome variation (5+ branches per type)
- Implement Hazard Zones with persistent damage
- Richer encounter descriptions

### Tasks
- [ ] **4A.1** New entity types: Medicine, Treasure
  - Medicine: +15 health (more than food)
  - Treasure: +50 score, special loot flags
  
- [ ] **4A.2** Hazard zones system
  - Fire, Swamp, Radiation zones
  - Damage per turn inside
  - Equipment can mitigate (torch for fire, etc.)
  
- [ ] **4A.3** Outcome variation
  - Each encounter type: 5-8 outcome branches
  - Conditional outcomes based on stats/equipment
  - Flavor text variations
  
- [ ] **4A.4** Encounter descriptions
  - Template system for dynamic text
  - Equipment/personality-aware flavor
  - Success/failure narratives

**Acceptance**: 50+ tests, no encounter type has <5 outcomes

---

## Phase 4B: Equipment Synergies

### Goals
- Define combo effects (2+ items together unlock bonuses)
- UI shows synergy hints during draft
- Synergies unlock new encounter options

### Tasks
- [ ] **4B.1** Synergy definitions
  - Armor + Camouflage = "Shadow Guard" (+2 hide, -1 enemy detection)
  - Venom + Strength = "Venomous Fangs" (+3 attack damage)
  - Torch + Intelligence = "Bright Mind" (reveals hidden options)
  - Swim Fins + Climbing Gear = "Universal Explorer" (all terrain)
  - Multiple synergies per combo (2-3 items = 2-3 effects)
  
- [ ] **4B.2** Synergy system
  - Check active synergies in SnakeAgent
  - getSynergies() returns active combos
  - Each synergy applies modifiers to decisions/outcomes
  
- [ ] **4B.3** Draft UI enhancement
  - Highlight synergies when items selected
  - Show bonus preview ("+2 Hide with Armor+Camouflage")
  - Visual feedback on combo coverage
  
- [ ] **4B.4** Encounter synergy effects
  - Synergies unlock/enhance options
  - Synergies add damage/defense bonuses
  - Synergies reveal secret encounter branches

**Acceptance**: 15+ synergy definitions, UI shows combos, 20+ tests

---

## Phase 4C: UI Polish & Animations

### Goals
- Smooth animations for world/encounters
- Better visual feedback
- Responsive design
- Accessibility improvements

### Tasks
- [ ] **4C.1** Canvas animations
  - Snake movement interpolation (smooth walk, not teleport)
  - Entity fade-in/fade-out
  - Damage flash on snake
  - Heal glow on health gain
  
- [ ] **4C.2** Encounter UI polish
  - Animated popup entrance
  - Option button hover effects (3D lift)
  - Outcome text fade-in
  - Stat change animations (+5 health in green, -3 damage in red)
  
- [ ] **4C.3** Draft UI improvements
  - Card flip animations on selection
  - Equipment synergy glow
  - Personality icon animations
  
- [ ] **4C.4** Responsive design
  - Mobile-friendly layout (stack vertically)
  - Touch controls for mobile
  - Viewport testing at 3 sizes
  
- [ ] **4C.5** Accessibility
  - ARIA labels on buttons
  - Keyboard navigation (Tab, Enter, Escape)
  - High contrast mode option
  - Screen reader friendly

**Acceptance**: No jank, 60 FPS target, mobile layout works

---

## Phase 4D: Progression & Difficulty Tiers

### Goals
- Multiple difficulty tiers (Easy → Medium → Hard → Nightmare)
- Unlock progression (beat Hard to access Nightmare)
- Scaling rewards and stakes
- Leaderboard skeleton

### Tasks
- [ ] **4D.1** Difficulty tiers
  - Easy: Few hazards, weak predators, abundant food
  - Medium: Balanced world, stat checks required
  - Hard: Sparse resources, dangerous predators
  - Nightmare: Lethal world, high-stakes encounters
  
- [ ] **4D.2** Scaling system
  - Difficulty affects terrain distribution
  - Predator/hazard aggression scales
  - Food scarcity increases
  - Reward multipliers (score ×1, ×1.5, ×2, ×3)
  
- [ ] **4D.3** Unlock progression
  - Unlock Hard after beating Medium with score >500
  - Unlock Nightmare after beating Hard with score >1000
  - Track best scores per difficulty
  - Persist progression to localStorage
  
- [ ] **4D.4** Run history
  - Store last 10 runs (draft, outcome, score, turns)
  - View run history screen
  - Replay functionality
  
- [ ] **4D.5** Leaderboard skeleton
  - Local high scores (top 10 per difficulty)
  - Display on main menu
  - Future: cloud sync (Firebase)

**Acceptance**: All 4 difficulties playable, progression tracked, 10 runs stored

---

## Implementation Order

1. **4A - Encounter Expansion** (3-4 hours)
   - New entities (Medicine, Treasure)
   - Hazard zones
   - Outcome variation
   - Flavor text
   - Tests for all

2. **4B - Equipment Synergies** (2-3 hours)
   - Synergy definitions
   - System implementation
   - Draft UI integration
   - Tests

3. **4C - UI Polish** (2-3 hours)
   - Animations
   - Responsive design
   - Accessibility

4. **4D - Progression** (2-3 hours)
   - Difficulty tiers
   - Unlock system
   - Run history
   - Leaderboard UI

**Total**: ~10-12 hours for full Phase 4

---

## Success Criteria

- ✅ 80+ tests (cumulative)
- ✅ 5+ entity types
- ✅ 15+ equipment synergies
- ✅ 8+ outcomes per encounter type
- ✅ 4 difficulty tiers
- ✅ Responsive UI (mobile, tablet, desktop)
- ✅ 60 FPS performance
- ✅ All features documented

---

## Testing Strategy

**Unit Tests**:
- New entity types and behaviors
- Synergy calculations
- Difficulty scaling
- Unlock logic

**Integration Tests**:
- Full run through each difficulty
- Synergy interaction with encounters
- UI responsive at breakpoints

**Manual Tests**:
- Mobile gameplay
- Animation smoothness
- Accessibility (keyboard nav, screen reader)
- Performance profiling

---

## Deployment

Each completed phase:
- Update PHASE_4X_COMPLETE.md
- Commit with detailed message
- Push to GitHub
- Auto-deploy to Vercel
- Test live version

**Vercel auto-deploys on every push** — no manual deployment needed.

