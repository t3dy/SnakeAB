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
  static generate(seed, difficulty = 'medium', width = 20, height = 20) {
    const world = new World(width, height);
    const rng = new SeededRandom(seed);

    // Distribution by difficulty
    const distributions = {
      easy: { river: 0.15, rocky: 0.05, hazard: 0.02 },
      medium: { river: 0.25, rocky: 0.15, hazard: 0.05 },
      hard: { river: 0.35, rocky: 0.25, hazard: 0.10 },
    };

    const dist = distributions[difficulty] || distributions.medium;

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
    world.addEntity({ id: 'snake', type: 'snake' }, snakePos.x, snakePos.y);

    // Place goal at (width-2, height-2)
    const goalPos = { x: width - 2, y: height - 2 };
    world.addEntity({ id: 'goal', type: 'goal' }, goalPos.x, goalPos.y);

    // Validate pathfinding
    const pf = new Pathfinding(world, []);
    const path = pf.findPath(snakePos.x, snakePos.y, goalPos.x, goalPos.y);

    if (!path || path.length === 0) {
      // Regenerate if no path (retry up to 3 times)
      return ProcGen.generate(seed + '-retry', difficulty, width, height);
    }

    // Place food on some grass tiles
    const numFood = Math.max(3, Math.floor((width * height) / 50));
    for (let i = 0; i < numFood; i++) {
      const tile = world.getRandomEmptyTile(TERRAIN.GRASS);
      if (tile) {
        world.addEntity({ id: `food-${i}`, type: 'food', value: 10 }, tile.x, tile.y);
      }
    }

    // Place predators
    const numPredators = Math.max(1, Math.floor((width * height) / 100));
    for (let i = 0; i < numPredators; i++) {
      const tile = world.getRandomEmptyTile(TERRAIN.GRASS);
      if (tile) {
        world.addEntity({ id: `predator-${i}`, type: 'predator', threat: 5 }, tile.x, tile.y);
      }
    }

    return world;
  }
}
