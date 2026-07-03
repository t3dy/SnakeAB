/**
 * Pathfinding — A* algorithm with personality bias
 * Phase 1: Core pathfinding for autonomous movement
 */

import { TERRAIN, isPassable } from '../world/Terrain.js';

export class Pathfinding {
  constructor(world, equipment = []) {
    this.world = world;
    this.equipment = equipment;
  }

  /**
   * Find path from start to goal using A*
   * Returns array of {x, y} positions (excluding start, including goal)
   */
  findPath(startX, startY, goalX, goalY) {
    const openSet = new Set();
    const cameFrom = new Map();
    const gScore = new Map(); // Cost from start
    const fScore = new Map(); // Estimated total cost

    const key = (x, y) => `${x},${y}`;
    const h = (x, y) => Math.abs(x - goalX) + Math.abs(y - goalY); // Manhattan distance

    const startKey = key(startX, startY);
    openSet.add(startKey);
    gScore.set(startKey, 0);
    fScore.set(startKey, h(startX, startY));

    while (openSet.size > 0) {
      // Find node in openSet with lowest fScore
      let current = null;
      let lowestF = Infinity;
      for (const nodeKey of openSet) {
        const f = fScore.get(nodeKey) || Infinity;
        if (f < lowestF) {
          lowestF = f;
          current = nodeKey;
        }
      }

      if (!current) break;

      const [cx, cy] = current.split(',').map(Number);

      if (cx === goalX && cy === goalY) {
        // Reconstruct path
        const path = [];
        let k = key(goalX, goalY);
        while (cameFrom.has(k)) {
          const [x, y] = k.split(',').map(Number);
          path.unshift({ x, y });
          k = cameFrom.get(k);
        }
        return path;
      }

      openSet.delete(current);

      // Check neighbors (4-directional)
      const neighbors = [
        { x: cx + 1, y: cy },
        { x: cx - 1, y: cy },
        { x: cx, y: cy + 1 },
        { x: cx, y: cy - 1 },
      ];

      for (const neighbor of neighbors) {
        if (!this.world.isInBounds(neighbor.x, neighbor.y)) continue;

        const terrain = this.world.getTerrain(neighbor.x, neighbor.y);
        if (!isPassable(terrain, this.equipment)) continue;

        const nKey = key(neighbor.x, neighbor.y);
        const tentativeG = (gScore.get(current) || 0) + 1;

        if (!gScore.has(nKey) || tentativeG < gScore.get(nKey)) {
          cameFrom.set(nKey, current);
          gScore.set(nKey, tentativeG);
          fScore.set(nKey, tentativeG + h(neighbor.x, neighbor.y));

          if (!openSet.has(nKey)) {
            openSet.add(nKey);
          }
        }
      }
    }

    return []; // No path found
  }

  /**
   * Find path biased by personality
   * Personality affects goal selection and path weighting
   */
  findPathWithPersonality(startX, startY, personality = []) {
    // Phase 2: Implement personality biasing
    // For now, just use basic pathfinding to nearest objective

    // Common objectives by personality
    if (personality.includes('aggressive')) {
      // Path toward predators (not implemented in Phase 1)
    }
    if (personality.includes('cautious')) {
      // Path away from hazards
    }
    if (personality.includes('greedy')) {
      // Path toward food
    }

    // Default: path toward goal
    const goalX = this.world.width - 2;
    const goalY = this.world.height - 2;
    return this.findPath(startX, startY, goalX, goalY);
  }
}
