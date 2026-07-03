/**
 * Terrain — Tile type definitions and properties
 * Phase 1: Core terrain system
 */

export const TERRAIN = {
  GRASS: 'grass',
  RIVER: 'river',
  DIRT: 'dirt',
  ROCKY: 'rocky',
  HAZARD: 'hazard',
};

export const TERRAIN_PROPS = {
  [TERRAIN.GRASS]: {
    name: 'Grass',
    movementCost: 1,
    passable: true,
    color: '#2d5016',
    emoji: '🌱',
  },
  [TERRAIN.RIVER]: {
    name: 'River',
    // Every snake can swim — it is slow and cold without fins.
    // With swim-fins the water becomes a highway.
    movementCost: 4,
    passable: true,
    color: '#0066cc',
    emoji: '🌊',
    fastWith: ['swim-fins'],
    fastCost: 1,
  },
  [TERRAIN.DIRT]: {
    name: 'Dirt',
    movementCost: 2,
    passable: true,
    color: '#8b7355',
    emoji: '🟫',
  },
  [TERRAIN.ROCKY]: {
    name: 'Rocky',
    movementCost: Infinity,
    passable: false,
    color: '#666666',
    emoji: '🪨',
    passableWith: ['climbing-gear', 'grappling-vine'],
  },
  [TERRAIN.HAZARD]: {
    name: 'Ember-field',
    movementCost: 1,
    passable: true,
    damagePerTurn: 1,
    color: '#cc0000',
    emoji: '🔥',
  },
};

/**
 * Get movement cost for terrain type (equipment-aware)
 */
export function getMovementCost(terrainType, equipment = []) {
  const props = TERRAIN_PROPS[terrainType];
  if (!props) return Infinity;
  if (props.fastWith && props.fastWith.some(req => equipment.includes(req))) {
    return props.fastCost;
  }
  if (props.passableWith && props.passableWith.some(req => equipment.includes(req))) {
    return 1.5;
  }
  return props.movementCost;
}

/**
 * Check if terrain is passable (with optional equipment)
 */
export function isPassable(terrainType, equipment = []) {
  const props = TERRAIN_PROPS[terrainType];
  if (!props) return false;
  if (props.passable) return true;
  if (props.passableWith) {
    return props.passableWith.some(req => equipment.includes(req));
  }
  return false;
}

/**
 * Get terrain properties
 */
export function getTerrainProps(terrainType) {
  return TERRAIN_PROPS[terrainType] || {};
}
