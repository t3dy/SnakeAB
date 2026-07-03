/**
 * Tests for World and Terrain systems
 */

import { strict as assert } from 'assert';
import { World } from '../src/world/World.js';
import { TERRAIN, getMovementCost, isPassable } from '../src/world/Terrain.js';

describe('Terrain', () => {
  test('should return correct movement costs', () => {
    assert.equal(getMovementCost(TERRAIN.GRASS), 1);
    assert.equal(getMovementCost(TERRAIN.DIRT), 2);
    // Every snake can swim — slowly without fins, fast with them
    assert.equal(getMovementCost(TERRAIN.RIVER), 4);
    assert.equal(getMovementCost(TERRAIN.RIVER, ['swim-fins']), 1);
    assert.equal(getMovementCost(TERRAIN.ROCKY), Infinity);
    assert.equal(getMovementCost(TERRAIN.ROCKY, ['climbing-gear']), 1.5);
  });

  test('should identify passable terrain', () => {
    assert.equal(isPassable(TERRAIN.GRASS), true);
    assert.equal(isPassable(TERRAIN.DIRT), true);
    // Snakes are born swimmers: rivers are passable to all
    assert.equal(isPassable(TERRAIN.RIVER), true);
    assert.equal(isPassable(TERRAIN.ROCKY), false);
  });

  test('should allow passage with equipment', () => {
    assert.equal(isPassable(TERRAIN.RIVER, ['swim-fins']), true);
    assert.equal(isPassable(TERRAIN.ROCKY, ['climbing-gear']), true);
    assert.equal(isPassable(TERRAIN.ROCKY, ['grappling-vine']), true);
    assert.equal(isPassable(TERRAIN.ROCKY, ['swim-fins']), false);
  });
});

describe('World', () => {
  test('should create a world with correct dimensions', () => {
    const world = new World(20, 20);
    assert.equal(world.width, 20);
    assert.equal(world.height, 20);
  });

  test('should set and get terrain', () => {
    const world = new World(10, 10);
    world.setTerrain(5, 5, TERRAIN.GRASS);
    assert.equal(world.getTerrain(5, 5), TERRAIN.GRASS);

    world.setTerrain(5, 5, TERRAIN.RIVER);
    assert.equal(world.getTerrain(5, 5), TERRAIN.RIVER);
  });

  test('should add and retrieve entities', () => {
    const world = new World(10, 10);
    const entity = { id: 'test-entity', type: 'food' };

    world.addEntity(entity, 5, 5);
    const entities = world.getEntitiesAt(5, 5);

    assert.equal(entities.length, 1);
    assert.equal(entities[0].id, 'test-entity');
    assert.equal(entities[0].x, 5);
    assert.equal(entities[0].y, 5);
  });

  test('should move entities', () => {
    const world = new World(10, 10);
    const entity = { id: 'snake', type: 'snake' };

    world.addEntity(entity, 2, 2);
    assert.equal(world.getEntitiesAt(2, 2).length, 1);
    assert.equal(world.getEntitiesAt(3, 3).length, 0);

    world.moveEntity(2, 2, 3, 3, 'snake');
    assert.equal(world.getEntitiesAt(2, 2).length, 0);
    assert.equal(world.getEntitiesAt(3, 3).length, 1);
    assert.equal(world.getEntitiesAt(3, 3)[0].x, 3);
    assert.equal(world.getEntitiesAt(3, 3)[0].y, 3);
  });

  test('should remove entities', () => {
    const world = new World(10, 10);
    const entity = { id: 'test', type: 'test' };

    world.addEntity(entity, 5, 5);
    assert.equal(world.getEntitiesAt(5, 5).length, 1);

    world.removeEntity(5, 5, 'test');
    assert.equal(world.getEntitiesAt(5, 5).length, 0);
  });

  test('should respect bounds', () => {
    const world = new World(10, 10);
    assert.equal(world.isInBounds(5, 5), true);
    assert.equal(world.isInBounds(0, 0), true);
    assert.equal(world.isInBounds(9, 9), true);
    assert.equal(world.isInBounds(10, 10), false);
    assert.equal(world.isInBounds(-1, 5), false);
  });

  test('should get all tiles', () => {
    const world = new World(3, 3);
    world.setTerrain(0, 0, TERRAIN.GRASS);
    world.setTerrain(1, 1, TERRAIN.RIVER);

    const tiles = world.getAllTiles();
    assert.equal(tiles.length, 9);

    const grass = tiles.find(t => t.x === 0 && t.y === 0);
    assert.equal(grass.terrain, TERRAIN.GRASS);

    const river = tiles.find(t => t.x === 1 && t.y === 1);
    assert.equal(river.terrain, TERRAIN.RIVER);
  });

  test('should find random empty tiles', () => {
    const world = new World(10, 10);
    world.addEntity({ id: 'entity1', type: 'test' }, 5, 5);

    const tile = world.getRandomEmptyTile();
    assert.ok(tile);
    assert.ok(tile.x >= 0 && tile.x < 10);
    assert.ok(tile.y >= 0 && tile.y < 10);
    // Should not be the occupied tile
    assert.notEqual(tile.x === 5 && tile.y === 5, true);
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
