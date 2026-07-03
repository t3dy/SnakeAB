/**
 * ProcGen — Procedural world generation
 * Phase 1: Generate worlds with validated pathfinding
 */

import { World } from './World.js';
import { TERRAIN } from './Terrain.js';
import { Pathfinding } from '../agents/Pathfinding.js';

/**
 * Simple seeded RNG
 */
class SeededRandom {
  constructor(seed) {
    this.seed = this.hashCode(seed) % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  hashCode(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      h = (h << 5) - h + char;
      h = h & h; // Convert to 32-bit integer
    }
    return Math.abs(h);
  }

  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
}

/**
 * Generate a procedural world
 */
export class ProcGen {
  static generate(seed, difficulty = 'medium', width = 20, height = 20, retriesLeft = 5) {
    const world = new World(width, height);
    const rng = new SeededRandom(seed);

    // Distribution by difficulty
    const distributions = {
      easy: { river: 0.15, rocky: 0.05, hazard: 0.02 },
      medium: { river: 0.25, rocky: 0.15, hazard: 0.05 },
      hard: { river: 0.35, rocky: 0.25, hazard: 0.10 },
      nightmare: { river: 0.40, rocky: 0.30, hazard: 0.15 },
    };

    // Entity abundance scaling by difficulty
    const entityScaling = {
      easy: { food: 1.5, medicine: 1.5, predators: 0.5, traps: 0.5 },
      medium: { food: 1.0, medicine: 1.0, predators: 1.0, traps: 1.0 },
      hard: { food: 0.7, medicine: 0.7, predators: 1.5, traps: 1.5 },
      nightmare: { food: 0.5, medicine: 0.5, predators: 2.0, traps: 2.0 },
    };

    const dist = distributions[difficulty] || distributions.medium;
    const scaling = entityScaling[difficulty] || entityScaling.medium;

    // Initialize all to GRASS
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        world.setTerrain(x, y, TERRAIN.GRASS);
      }
    }

    // Distribute terrain
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const rand = rng.next();

        if (rand < dist.hazard) {
          world.setTerrain(x, y, TERRAIN.HAZARD);
        } else if (rand < dist.hazard + dist.rocky) {
          world.setTerrain(x, y, TERRAIN.ROCKY);
        } else if (rand < dist.hazard + dist.rocky + dist.river) {
          world.setTerrain(x, y, TERRAIN.RIVER);
        } else if (rand < dist.hazard + dist.rocky + dist.river + 0.1) {
          world.setTerrain(x, y, TERRAIN.DIRT);
        }
      }
    }

    // Place snake at (1, 1)
    const snakePos = { x: 1, y: 1 };

    // Place goal at (width-2, height-2)
    const goalPos = { x: width - 2, y: height - 2 };

    // Carve a guaranteed winding path from start to goal so every
    // seed is solvable, even at nightmare terrain density
    ProcGen.carvePath(world, rng, snakePos, goalPos);

    world.addEntity({ id: 'snake', type: 'snake' }, snakePos.x, snakePos.y);
    world.addEntity({ id: 'goal', type: 'goal' }, goalPos.x, goalPos.y);

    // Validate pathfinding (safety net on top of carved path)
    const pf = new Pathfinding(world, []);
    const path = pf.findPath(snakePos.x, snakePos.y, goalPos.x, goalPos.y);

    if ((!path || path.length === 0) && retriesLeft > 0) {
      return ProcGen.generate(seed + '-retry', difficulty, width, height, retriesLeft - 1);
    }

    // Place food on some grass tiles (scaled by difficulty)
    const numFood = Math.max(2, Math.round(((width * height) / 50) * scaling.food));
    for (let i = 0; i < numFood; i++) {
      const tile = world.getRandomEmptyTile(TERRAIN.GRASS);
      if (tile) {
        world.addEntity({ id: `food-${i}`, type: 'food', value: 10 }, tile.x, tile.y);
      }
    }

    // Place medicine (rarer than food)
    const numMedicine = Math.max(1, Math.round(((width * height) / 150) * scaling.medicine));
    for (let i = 0; i < numMedicine; i++) {
      const tile = world.getRandomEmptyTile(TERRAIN.GRASS);
      if (tile) {
        world.addEntity({ id: `medicine-${i}`, type: 'medicine', value: 15 }, tile.x, tile.y);
      }
    }

    // Place treasure (very rare)
    const numTreasure = Math.max(1, Math.floor((width * height) / 200));
    for (let i = 0; i < numTreasure; i++) {
      const tile = world.getRandomEmptyTile(TERRAIN.GRASS);
      if (tile) {
        world.addEntity({ id: `treasure-${i}`, type: 'treasure', value: 50 }, tile.x, tile.y);
      }
    }

    // Place predators (scaled by difficulty)
    const numPredators = Math.max(1, Math.round(((width * height) / 100) * scaling.predators));
    for (let i = 0; i < numPredators; i++) {
      const tile = world.getRandomEmptyTile(TERRAIN.GRASS);
      if (tile) {
        world.addEntity({ id: `predator-${i}`, type: 'predator', threat: 5 }, tile.x, tile.y);
      }
    }

    // Place traps (scaled by difficulty)
    const numTraps = Math.max(1, Math.round(((width * height) / 120) * scaling.traps));
    for (let i = 0; i < numTraps; i++) {
      const tile = world.getRandomEmptyTile(TERRAIN.GRASS);
      if (tile) {
        world.addEntity({ id: `trap-${i}`, type: 'trap', danger: 3 }, tile.x, tile.y);
      }
    }

    // Place NPCs (friendly or neutral entities)
    const numNPCs = Math.max(1, Math.floor((width * height) / 130));
    for (let i = 0; i < numNPCs; i++) {
      const tile = world.getRandomEmptyTile(TERRAIN.GRASS);
      if (tile) {
        world.addEntity({ id: `npc-${i}`, type: 'npc', disposition: 'neutral' }, tile.x, tile.y);
      }
    }

    return world;
  }

  /**
   * Carve a winding walkable corridor from start to goal.
   * Random walk biased toward the goal; every visited tile
   * becomes GRASS. Guarantees the world is solvable.
   */
  static carvePath(world, rng, start, goal) {
    let x = start.x;
    let y = start.y;
    world.setTerrain(x, y, TERRAIN.GRASS);

    const maxSteps = world.width * world.height * 4;
    let steps = 0;

    while ((x !== goal.x || y !== goal.y) && steps < maxSteps) {
      steps++;

      // 70% of the time move toward the goal, 30% wander
      const towardGoal = rng.next() < 0.7;
      let dx = 0;
      let dy = 0;

      if (towardGoal) {
        // Move along whichever axis is farther from the goal
        if (Math.abs(goal.x - x) > Math.abs(goal.y - y)) {
          dx = Math.sign(goal.x - x);
        } else {
          dy = Math.sign(goal.y - y);
        }
      } else {
        // Random orthogonal wander
        if (rng.next() < 0.5) {
          dx = rng.next() < 0.5 ? -1 : 1;
        } else {
          dy = rng.next() < 0.5 ? -1 : 1;
        }
      }

      const nx = Math.max(0, Math.min(world.width - 1, x + dx));
      const ny = Math.max(0, Math.min(world.height - 1, y + dy));
      x = nx;
      y = ny;
      world.setTerrain(x, y, TERRAIN.GRASS);
    }

    // Ensure endpoints are clear
    world.setTerrain(start.x, start.y, TERRAIN.GRASS);
    world.setTerrain(goal.x, goal.y, TERRAIN.GRASS);
  }
}
