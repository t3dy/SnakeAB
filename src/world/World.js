/**
 * World — Grid-based game world
 * Phase 1: Core world container
 */

export class World {
  constructor(width = 20, height = 20) {
    this.width = width;
    this.height = height;

    // 2D array of terrain types
    this.terrain = Array(height)
      .fill(null)
      .map(() => Array(width).fill(null));

    // Entity map: { `${x},${y}`: [entity1, entity2, ...] }
    this.entities = new Map();
  }

  /**
   * Set terrain at position
   */
  setTerrain(x, y, terrainType) {
    if (this.isInBounds(x, y)) {
      this.terrain[y][x] = terrainType;
    }
  }

  /**
   * Get terrain at position
   */
  getTerrain(x, y) {
    if (this.isInBounds(x, y)) {
      return this.terrain[y][x];
    }
    return null;
  }

  /**
   * Add entity to world at position
   */
  addEntity(entity, x, y) {
    if (!this.isInBounds(x, y)) return false;

    const key = `${x},${y}`;
    if (!this.entities.has(key)) {
      this.entities.set(key, []);
    }

    const entityCopy = { ...entity, x, y };
    this.entities.get(key).push(entityCopy);
    return true;
  }

  /**
   * Get entities at position
   */
  getEntitiesAt(x, y) {
    if (!this.isInBounds(x, y)) return [];
    const key = `${x},${y}`;
    return this.entities.get(key) || [];
  }

  /**
   * Remove entity from position
   */
  removeEntity(x, y, entityId) {
    if (!this.isInBounds(x, y)) return false;

    const key = `${x},${y}`;
    const entities = this.entities.get(key);
    if (!entities) return false;

    const idx = entities.findIndex(e => e.id === entityId);
    if (idx >= 0) {
      entities.splice(idx, 1);
      if (entities.length === 0) {
        this.entities.delete(key);
      }
      return true;
    }
    return false;
  }

  /**
   * Move entity from one position to another
   */
  moveEntity(fromX, fromY, toX, toY, entityId) {
    if (!this.isInBounds(toX, toY)) return false;

    const fromKey = `${fromX},${fromY}`;
    const toKey = `${toX},${toY}`;

    const entities = this.entities.get(fromKey);
    if (!entities) return false;

    const idx = entities.findIndex(e => e.id === entityId);
    if (idx < 0) return false;

    const entity = entities.splice(idx, 1)[0];
    if (entities.length === 0) {
      this.entities.delete(fromKey);
    }

    entity.x = toX;
    entity.y = toY;

    if (!this.entities.has(toKey)) {
      this.entities.set(toKey, []);
    }
    this.entities.get(toKey).push(entity);
    return true;
  }

  /**
   * Check if position is within bounds
   */
  isInBounds(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  /**
   * Get all tiles with their terrain and entities
   */
  getAllTiles() {
    const tiles = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const key = `${x},${y}`;
        tiles.push({
          x,
          y,
          terrain: this.terrain[y][x],
          entities: this.entities.get(key) || [],
        });
      }
    }
    return tiles;
  }

  /**
   * Get a random empty grass tile
   */
  getRandomEmptyTile(terrainType = null) {
    const candidates = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const t = this.terrain[y][x];
        if (terrainType && t !== terrainType) continue;

        const entities = this.getEntitiesAt(x, y);
        if (entities.length === 0) {
          candidates.push({ x, y });
        }
      }
    }

    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  /**
   * Get all tiles of a specific terrain type
   */
  getTilesOfType(terrainType) {
    const tiles = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.terrain[y][x] === terrainType) {
          tiles.push({ x, y });
        }
      }
    }
    return tiles;
  }
}
