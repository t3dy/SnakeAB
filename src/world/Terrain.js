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
    movementCost: Infinity,
    passable: false,
    color: '#0066cc',
    emoji: '🌊',
    passableWith: ['swim-fins'],
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
    passableWith: ['climbing-gear'],
  },
  [TERRAIN.HAZARD]: {
    name: 'Hazard',
    movementCost: 1,
    passable: true,
    damagePerTurn: 1,
    color: '#cc0000',
    emoji: '🔥',
  },
};

/**
 * Get movement cost for terrain type
 */
export function getMovementCost(terrainType) {
  return TERRAIN_PROPS[terrainType]?.movementCost ?? Infinity;
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
