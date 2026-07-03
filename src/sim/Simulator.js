/**
 * Simulator — Main game loop
 * Phase 1-2: Core simulation + encounter resolution
 */

import { ProcGen } from '../world/ProcGen.js';
import { SnakeAgent } from '../agents/SnakeAgent.js';
import { Pathfinding } from '../agents/Pathfinding.js';
import { EncounterResolver } from '../encounters/EncounterResolver.js';
import { TERRAIN, getTerrainProps } from '../world/Terrain.js';

export class Simulator {
  constructor(draftConfig = {}, seed = 'default', difficulty = 'medium') {
    this.draftConfig = draftConfig;
    this.seed = seed;
    this.difficulty = difficulty;

    // Generate world
    this.world = ProcGen.generate(seed, difficulty);

    // Create snake agent
    this.snake = new SnakeAgent(draftConfig);
    const snakeEntity = this.world.getEntitiesAt(1, 1).find(e => e.type === 'snake');
    if (snakeEntity) {
      this.snake.x = 1;
      this.snake.y = 1;
    }

    // Initialize pathfinding
    this.pathfinding = new Pathfinding(this.world, draftConfig.equipment || []);
    this.currentPath = [];
    this.pathIndex = 0;

    // Simulation state
    this.turn = 0;
    this.gameOver = false;
    this.victory = false;
    this.paused = false;
    this.speedMultiplier = 1.0;

    // Encounter state
    this.currentEncounter = null;

    // Log
    this.log = [];
  }

  /**
   * Add log entry
   */
  addLog(message) {
    this.log.push(message);
    console.log(message);
  }

  /**
   * Execute one turn of simulation
   */
  tick() {
    if (this.paused || this.gameOver) return;

    this.snake.nextTurn();
    this.turn++;

    // Apply hazard damage if in hazard zone
    const terrain = this.world.getTerrain(this.snake.x, this.snake.y);
    const terrainProps = getTerrainProps(terrain);
    if (terrainProps.damagePerTurn) {
      this.snake.takeDamage(terrainProps.damagePerTurn);
      this.addLog(`🔥 Hazard damage! Health: ${this.snake.health}`);
    }

    // Check for defeat
    if (!this.snake.isAlive()) {
      this.gameOver = true;
      this.addLog('☠️ Snake died.');
      return;
    }

    // Generate path if needed
    if (this.currentPath.length === 0) {
      const goalX = this.world.width - 2;
      const goalY = this.world.height - 2;
      this.currentPath = this.pathfinding.findPath(this.snake.x, this.snake.y, goalX, goalY);
      this.pathIndex = 0;
    }

    // Move along path
    if (this.currentPath.length > 0 && this.pathIndex < this.currentPath.length) {
      const nextPos = this.currentPath[this.pathIndex];
      this.pathIndex++;

      // Check for collision with entities
      const entities = this.world.getEntitiesAt(nextPos.x, nextPos.y);
      const collidedEntity = entities.find(e => e.type !== 'snake');

      if (collidedEntity) {
        // Trigger encounter
        this.currentEncounter = {
          type: collidedEntity.type,
          entity: collidedEntity,
          position: nextPos,
        };
        this.addLog(`⚡ Encounter: ${collidedEntity.type} at (${nextPos.x}, ${nextPos.y})`);
        return; // Pause for encounter resolution
      }

      // Move snake
      this.world.moveEntity(this.snake.x, this.snake.y, nextPos.x, nextPos.y, this.snake.id);
      this.snake.x = nextPos.x;
      this.snake.y = nextPos.y;

      // Check for goal
      const currentEntities = this.world.getEntitiesAt(this.snake.x, this.snake.y);
      if (currentEntities.some(e => e.type === 'goal')) {
        this.gameOver = true;
        this.victory = true;
        this.snake.addScore(100);
        this.addLog('🏁 Goal reached! Victory!');
        return;
      }
    } else if (this.pathIndex >= this.currentPath.length) {
      // Recalculate path (regenerate every N turns or when stuck)
      this.currentPath = [];
    }
  }

  /**
   * Resolve current encounter using AI decision logic
   */
  resolveEncounter() {
    if (!this.currentEncounter) return;

    const encounter = this.currentEncounter;
    const entity = encounter.entity;
    const entityType = entity.type;

    // Use EncounterResolver to get AI decision and outcome
    const resolution = EncounterResolver.resolveEncounter(entityType, this.snake);

    if (resolution.error) {
      this.addLog(`❓ Encounter error: ${resolution.error}`);
      this.currentEncounter = null;
      return;
    }

    const { chosenOption, outcome, statDelta } = resolution;

    // Apply outcome
    if (statDelta.health !== 0) {
      if (statDelta.health > 0) {
        this.snake.gainHealth(statDelta.health);
      } else {
        this.snake.takeDamage(-statDelta.health);
      }
    }

    if (statDelta.score !== 0) {
      this.snake.addScore(statDelta.score);
    }

    // Log the outcome
    this.addLog(`${outcome.text} [${chosenOption}]`);

    // Remove consumed/defeated entities
    if (entity.type === 'predator' && outcome.text.includes('Victory')) {
      this.world.removeEntity(encounter.position.x, encounter.position.y, entity.id);
    }
    if (entity.type === 'food' || entity.type === 'medicine' || entity.type === 'treasure') {
      this.snake.resourcesGathered++;
      this.world.removeEntity(encounter.position.x, encounter.position.y, entity.id);
    }
    if (entity.type === 'trap' && outcome.text.includes('Successfully')) {
      this.world.removeEntity(encounter.position.x, encounter.position.y, entity.id);
    }

    // Check if snake died
    if (!this.snake.isAlive()) {
      this.gameOver = true;
      this.addLog('☠️ You died.');
    }

    this.currentEncounter = null;
  }

  /**
   * Get game state snapshot
   */
  getState() {
    return {
      turn: this.turn,
      snake: {
        x: this.snake.x,
        y: this.snake.y,
        health: this.snake.health,
        maxHealth: this.snake.maxHealth,
        score: this.snake.score,
        alive: this.snake.alive,
      },
      world: {
        width: this.world.width,
        height: this.world.height,
        tiles: this.world.getAllTiles(),
      },
      gameOver: this.gameOver,
      victory: this.victory,
      encounter: this.currentEncounter,
      log: this.log.slice(-10), // Last 10 log entries
    };
  }

  /**
   * Pause/resume
   */
  setPaused(paused) {
    this.paused = paused;
  }

  /**
   * Set speed multiplier
   */
  setSpeed(multiplier) {
    this.speedMultiplier = multiplier;
  }
}
