/**
 * Progression — Difficulty tiers, unlocks, and run history
 * Phase 4D: Progression system and leaderboard
 */

/**
 * Difficulty tier definitions
 */
export const DIFFICULTIES = {
  EASY: {
    id: 'easy',
    name: 'Easy',
    icon: '🌱',
    description: 'Few threats, abundant resources',
    terrain: { river: 0.15, rocky: 0.05, hazard: 0.02 },
    scoreMultiplier: 1.0,
    unlocked: true,
    unlockRequirement: null,
  },
  MEDIUM: {
    id: 'medium',
    name: 'Medium',
    icon: '🌳',
    description: 'Balanced difficulty, stat checks required',
    terrain: { river: 0.25, rocky: 0.15, hazard: 0.05 },
    scoreMultiplier: 1.5,
    unlocked: true,
    unlockRequirement: null,
  },
  HARD: {
    id: 'hard',
    name: 'Hard',
    icon: '⛰️',
    description: 'Sparse resources, dangerous predators',
    terrain: { river: 0.35, rocky: 0.25, hazard: 0.10 },
    scoreMultiplier: 2.0,
    unlocked: false,
    unlockRequirement: { difficulty: 'medium', minScore: 500 },
  },
  NIGHTMARE: {
    id: 'nightmare',
    name: 'Nightmare',
    icon: '💀',
    description: 'Lethal world, high-stakes encounters',
    terrain: { river: 0.45, rocky: 0.35, hazard: 0.15 },
    scoreMultiplier: 3.0,
    unlocked: false,
    unlockRequirement: { difficulty: 'hard', minScore: 1000 },
  },
};

/**
 * Run history entry
 */
export class RunHistory {
  constructor(runId, difficulty, snakeConfig, result) {
    this.id = runId;
    this.timestamp = Date.now();
    this.difficulty = difficulty;
    this.snakeConfig = snakeConfig;
    this.score = result.score;
    this.turns = result.turns;
    this.victory = result.victory;
    this.healthRemaining = result.healthRemaining;
    this.resourcesGathered = result.resourcesGathered;
  }

  /**
   * Get run summary
   */
  getSummary() {
    return {
      id: this.id,
      difficulty: this.difficulty,
      score: this.score,
      turns: this.turns,
      victory: this.victory,
      timestamp: this.timestamp,
      duration: new Date(this.timestamp).toLocaleDateString(),
    };
  }
}

/**
 * Progression manager
 */
export class ProgressionManager {
  constructor() {
    this.runHistory = [];
    this.bestScores = {}; // { difficulty: score }
    this.totalRuns = 0;
    this.victoriesPerDifficulty = {};
    this.loadFromStorage();
  }

  /**
   * Record a run
   */
  recordRun(difficulty, snakeConfig, result) {
    const runId = `run_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const entry = new RunHistory(runId, difficulty, snakeConfig, result);

    // Add to history (keep last 50 runs)
    this.runHistory.unshift(entry);
    if (this.runHistory.length > 50) {
      this.runHistory = this.runHistory.slice(0, 50);
    }

    // Track best score
    if (!this.bestScores[difficulty] || result.score > this.bestScores[difficulty]) {
      this.bestScores[difficulty] = result.score;
    }

    // Track victories
    if (result.victory) {
      this.victoriesPerDifficulty[difficulty] = (this.victoriesPerDifficulty[difficulty] || 0) + 1;
    }

    this.totalRuns++;
    this.saveToStorage();

    // Check for unlocks
    this.checkUnlocks();

    return entry;
  }

  /**
   * Check if any new difficulties should be unlocked
   */
  checkUnlocks() {
    for (const difficulty of Object.values(DIFFICULTIES)) {
      if (difficulty.unlocked || !difficulty.unlockRequirement) continue;

      const req = difficulty.unlockRequirement;
      const requiredScore = this.bestScores[req.difficulty] || 0;

      if (requiredScore >= req.minScore) {
        DIFFICULTIES[difficulty.id.toUpperCase()].unlocked = true;
      }
    }
    this.saveToStorage();
  }

  /**
   * Get available difficulties
   */
  getAvailableDifficulties() {
    return Object.values(DIFFICULTIES).filter(d => d.unlocked);
  }

  /**
   * Get difficulty by ID
   */
  getDifficulty(id) {
    return Object.values(DIFFICULTIES).find(d => d.id === id);
  }

  /**
   * Get run history
   */
  getRunHistory(difficulty = null, limit = 10) {
    let history = this.runHistory;
    if (difficulty) {
      history = history.filter(r => r.difficulty === difficulty);
    }
    return history.slice(0, limit);
  }

  /**
   * Get leaderboard (top scores per difficulty)
   */
  getLeaderboard(difficulty = null) {
    const board = {};

    if (difficulty) {
      board[difficulty] = this.bestScores[difficulty] || 0;
    } else {
      for (const d of Object.values(DIFFICULTIES)) {
        board[d.id] = this.bestScores[d.id] || 0;
      }
    }

    return board;
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalRuns: this.totalRuns,
      bestScores: { ...this.bestScores },
      victories: { ...this.victoriesPerDifficulty },
      avgScore: this.totalRuns > 0 ? Math.round(
        this.runHistory.reduce((sum, r) => sum + r.score, 0) / this.totalRuns
      ) : 0,
    };
  }

  /**
   * Save to localStorage (if available)
   */
  saveToStorage() {
    if (typeof localStorage === 'undefined') return; // Skip in Node.js tests

    const data = {
      runHistory: this.runHistory,
      bestScores: this.bestScores,
      totalRuns: this.totalRuns,
      victoriesPerDifficulty: this.victoriesPerDifficulty,
      unlockedDifficulties: Object.keys(DIFFICULTIES)
        .filter(key => DIFFICULTIES[key].unlocked)
        .map(key => DIFFICULTIES[key].id),
    };
    localStorage.setItem('snakeab_progression', JSON.stringify(data));
  }

  /**
   * Load from localStorage (if available)
   */
  loadFromStorage() {
    if (typeof localStorage === 'undefined') return; // Skip in Node.js tests

    const saved = localStorage.getItem('snakeab_progression');
    if (!saved) return;

    try {
      const data = JSON.parse(saved);
      this.runHistory = data.runHistory || [];
      this.bestScores = data.bestScores || {};
      this.totalRuns = data.totalRuns || 0;
      this.victoriesPerDifficulty = data.victoriesPerDifficulty || {};

      // Restore unlocked difficulties
      if (data.unlockedDifficulties) {
        for (const id of data.unlockedDifficulties) {
          const diff = Object.values(DIFFICULTIES).find(d => d.id === id);
          if (diff) {
            diff.unlocked = true;
          }
        }
      }
    } catch (e) {
      console.error('Failed to load progression:', e);
    }
  }

  /**
   * Clear all progression data
   */
  reset() {
    this.runHistory = [];
    this.bestScores = {};
    this.totalRuns = 0;
    this.victoriesPerDifficulty = {};

    // Reset unlocks
    for (const difficulty of Object.values(DIFFICULTIES)) {
      difficulty.unlocked = !difficulty.unlockRequirement;
    }

    this.saveToStorage();
  }
}

/**
 * Global progression instance
 */
export const progression = new ProgressionManager();
