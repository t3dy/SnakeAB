/**
 * Simulator — Main game loop
 * Phase 1-2: Core simulation + encounter resolution
 */

import { ProcGen } from '../world/ProcGen.js';
import { SnakeAgent } from '../agents/SnakeAgent.js';
import { Pathfinding } from '../agents/Pathfinding.js';
import { EncounterResolver } from '../encounters/EncounterResolver.js';
import { TERRAIN, getTerrainProps } from '../world/Terrain.js';
import { DIFFICULTIES } from '../game/Progression.js';

export class Simulator {
  constructor(draftConfig = {}, seed = 'default', difficulty = 'medium') {
    this.draftConfig = draftConfig;
    this.seed = seed;
    this.difficulty = difficulty;

    // Score multiplier from difficulty tier
    const tier = Object.values(DIFFICULTIES).find(d => d.id === difficulty);
    this.scoreMultiplier = tier ? tier.scoreMultiplier : 1.0;

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
    // Freeze the world while paused, finished, or waiting on an encounter
    if (this.paused || this.gameOver || this.currentEncounter) return;

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

      // Track facing direction for rendering
      this.snake.facing = this.computeFacing(nextPos);

      // Check for collision with encounter entities (goal is NOT an encounter)
      const entities = this.world.getEntitiesAt(nextPos.x, nextPos.y);
      const collidedEntity = entities.find(e => e.type !== 'snake' && e.type !== 'goal');

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
        this.snake.addScore(Math.round(100 * this.scoreMultiplier));
        this.addLog('🏁 Goal reached! Victory!');
        return;
      }
    } else if (this.pathIndex >= this.currentPath.length) {
      // Recalculate path (regenerate every N turns or when stuck)
      this.currentPath = [];
    }
  }

  /**
   * Compute facing direction toward a target position
   */
  computeFacing(nextPos) {
    if (nextPos.x > this.snake.x) return 'right';
    if (nextPos.x < this.snake.x) return 'left';
    if (nextPos.y > this.snake.y) return 'down';
    if (nextPos.y < this.snake.y) return 'up';
    return this.snake.facing || 'right';
  }

  /**
   * Resolve current encounter using AI decision logic
   */
  resolveEncounter() {
    if (!this.currentEncounter) return;

    const entityType = this.currentEncounter.entity.type;

    // Use EncounterResolver to get AI decision
    const chosenOption = EncounterResolver.decideAction(entityType, this.snake);
    if (!chosenOption) {
      this.addLog(`❓ No viable options for ${entityType}`);
      this.currentEncounter = null;
      return;
    }

    return this.resolveEncounterWithChoice(chosenOption);
  }

  /**
   * Resolve current encounter with a specific option
   * (player choice or AI suggestion). Applies stats,
   * removes the encounter entity, moves the snake forward,
   * and checks for death. Returns the outcome.
   */
  resolveEncounterWithChoice(optionId) {
    if (!this.currentEncounter) return null;

    const encounter = this.currentEncounter;
    const entity = encounter.entity;

    // Resolve the outcome (stat checks happen here)
    const outcome = EncounterResolver.resolveOutcome(entity.type, this.snake, optionId);
    this.snake.recordEncounter(`${entity.type}-encounter`, outcome.success);

    // Apply stat changes (score scaled by difficulty)
    if (outcome.health > 0) {
      this.snake.gainHealth(outcome.health);
    } else if (outcome.health < 0) {
      this.snake.takeDamage(-outcome.health);
    }
    if (outcome.score !== 0) {
      this.snake.addScore(Math.round(outcome.score * this.scoreMultiplier));
    }

    this.addLog(`${outcome.text} [${optionId}]`);

    // Track gathered resources
    if (['food', 'medicine', 'treasure'].includes(entity.type)) {
      this.snake.resourcesGathered++;
    }

    // The encounter is spent: remove the entity so the snake
    // can't loop on the same tile (fled predators wander off,
    // sprung traps are done, eaten food is gone)
    this.world.removeEntity(encounter.position.x, encounter.position.y, entity.id);

    // Move the snake onto the now-clear tile if it survived
    if (this.snake.isAlive()) {
      this.world.moveEntity(this.snake.x, this.snake.y, encounter.position.x, encounter.position.y, this.snake.id);
      this.snake.x = encounter.position.x;
      this.snake.y = encounter.position.y;
    } else {
      this.gameOver = true;
      this.addLog('☠️ You died.');
    }

    this.currentEncounter = null;
    return outcome;
  }

  /**
   * Get run result for progression recording
   */
  getRunResult() {
    return {
      score: this.snake.score,
      turns: this.turn,
      victory: this.victory,
      healthRemaining: this.snake.health,
      resourcesGathered: this.snake.resourcesGathered,
    };
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
        facing: this.snake.facing || 'right',
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
