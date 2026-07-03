/**
 * Tests for Pathfinding (A* algorithm)
 */

import { strict as assert } from 'assert';
import { World } from '../src/world/World.js';
import { TERRAIN } from '../src/world/Terrain.js';
import { Pathfinding } from '../src/agents/Pathfinding.js';

describe('Pathfinding', () => {
  test('should find path on open terrain', () => {
    const world = new World(10, 10);

    // Fill with grass
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        world.setTerrain(x, y, TERRAIN.GRASS);
      }
    }

    const pf = new Pathfinding(world, []);
    const path = pf.findPath(0, 0, 3, 3);

    assert.ok(path.length > 0);
    assert.equal(path[path.length - 1].x, 3);
    assert.equal(path[path.length - 1].y, 3);
    // Path length should be around 6 (Manhattan distance = 6)
    assert.ok(path.length <= 7);
  });

  test('should find shortest path', () => {
    const world = new World(10, 10);

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        world.setTerrain(x, y, TERRAIN.GRASS);
      }
    }

    const pf = new Pathfinding(world, []);
    const path = pf.findPath(0, 0, 5, 0);

    // Shortest path horizontally = 5 steps
    assert.equal(path.length, 5);
    for (let i = 0; i < path.length; i++) {
      assert.equal(path[i].y, 0);
      assert.equal(path[i].x, i + 1);
    }
  });

  test('should avoid impassable terrain', () => {
    const world = new World(10, 10);

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        world.setTerrain(x, y, TERRAIN.GRASS);
      }
    }

    // Create a wall of rocky terrain
    for (let y = 2; y < 8; y++) {
      world.setTerrain(5, y, TERRAIN.ROCKY);
    }

    const pf = new Pathfinding(world, []);
    const path = pf.findPath(0, 5, 9, 5);

    assert.ok(path.length > 0);
    // Path should go around the wall, not through it
    const crossedWall = path.some(p => p.x === 5 && p.y >= 2 && p.y <= 7);
    assert.equal(crossedWall, false);
  });

  test('should allow swimming through rivers with equipment', () => {
    const world = new World(10, 10);

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        world.setTerrain(x, y, TERRAIN.GRASS);
      }
    }

    // Create a small river at x=5, y=5 (single tile)
    world.setTerrain(5, 5, TERRAIN.RIVER);

    // Without swim equipment: should not use the river tile
    const pf1 = new Pathfinding(world, []);
    const path1 = pf1.findPath(4, 5, 6, 5);
    assert.equal(path1.length > 0, true);
    const usesRiver1 = path1.some(p => p.x === 5 && p.y === 5);
    assert.equal(usesRiver1, false);

    // With swim equipment: can use the river tile for shorter path
    const pf2 = new Pathfinding(world, ['swim-fins']);
    const path2 = pf2.findPath(4, 5, 6, 5);
    assert.equal(path2.length > 0, true);
    // Path should go through the river (shorter)
    const usesRiver2 = path2.some(p => p.x === 5 && p.y === 5);
    assert.equal(usesRiver2, true);
  });

  test('should return empty path when no route exists', () => {
    const world = new World(10, 10);

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        world.setTerrain(x, y, x === 5 ? TERRAIN.ROCKY : TERRAIN.GRASS);
      }
    }

    const pf = new Pathfinding(world, []);
    const path = pf.findPath(0, 5, 9, 5);
    assert.equal(path.length, 0);
  });
});

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (err) {
    console.error(`✗ ${name}`);
    console.error(`  ${err.message}`);
    throw err;
  }
}

function describe(name, fn) {
  console.log(`\n${name}`);
  fn();
}
