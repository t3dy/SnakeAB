/**
 * Tests for Progression System
 */

import { strict as assert } from 'assert';
import { DIFFICULTIES, RunHistory, ProgressionManager, progression } from '../src/game/Progression.js';

describe('Progression System', () => {
  test('should define difficulty tiers', () => {
    assert.ok(DIFFICULTIES.EASY);
    assert.ok(DIFFICULTIES.MEDIUM);
    assert.ok(DIFFICULTIES.HARD);
    assert.ok(DIFFICULTIES.NIGHTMARE);
  });

  test('easy and medium should be unlocked by default', () => {
    assert.ok(DIFFICULTIES.EASY.unlocked);
    assert.ok(DIFFICULTIES.MEDIUM.unlocked);
  });

  test('hard should require medium 500+ score', () => {
    assert.ok(!DIFFICULTIES.HARD.unlocked || DIFFICULTIES.HARD.unlockRequirement?.minScore === 500);
    assert.equal(DIFFICULTIES.HARD.unlockRequirement?.difficulty, 'medium');
  });

  test('nightmare should require hard 1000+ score', () => {
    assert.ok(!DIFFICULTIES.NIGHTMARE.unlocked || DIFFICULTIES.NIGHTMARE.unlockRequirement?.minScore === 1000);
    assert.equal(DIFFICULTIES.NIGHTMARE.unlockRequirement?.difficulty, 'hard');
  });

  test('difficulty score multipliers should increase with difficulty', () => {
    assert.ok(DIFFICULTIES.MEDIUM.scoreMultiplier > DIFFICULTIES.EASY.scoreMultiplier);
    assert.ok(DIFFICULTIES.HARD.scoreMultiplier > DIFFICULTIES.MEDIUM.scoreMultiplier);
    assert.ok(DIFFICULTIES.NIGHTMARE.scoreMultiplier > DIFFICULTIES.HARD.scoreMultiplier);
  });

  test('should create run history entry', () => {
    const run = new RunHistory('run1', 'easy', { attribute: 'strength' }, {
      score: 100,
      turns: 50,
      victory: true,
      healthRemaining: 5,
      resourcesGathered: 3,
    });

    assert.equal(run.id, 'run1');
    assert.equal(run.difficulty, 'easy');
    assert.equal(run.score, 100);
    assert.ok(run.victory);
  });

  test('run history should have summary', () => {
    const run = new RunHistory('run1', 'medium', {}, {
      score: 250,
      turns: 75,
      victory: false,
      healthRemaining: 0,
      resourcesGathered: 5,
    });

    const summary = run.getSummary();
    assert.ok(summary.id);
    assert.ok(summary.timestamp);
    assert.equal(summary.difficulty, 'medium');
    assert.equal(summary.score, 250);
  });

  test('progression manager should record runs', () => {
    const pm = new ProgressionManager();
    pm.reset(); // Start fresh

    pm.recordRun('easy', { attribute: 'strength' }, {
      score: 100,
      turns: 50,
      victory: true,
      healthRemaining: 5,
      resourcesGathered: 3,
    });

    assert.equal(pm.totalRuns, 1);
    assert.equal(pm.getRunHistory().length, 1);
  });

  test('progression manager should track best scores', () => {
    const pm = new ProgressionManager();
    pm.reset();

    pm.recordRun('easy', {}, { score: 100, turns: 50, victory: true, healthRemaining: 5, resourcesGathered: 3 });
    pm.recordRun('easy', {}, { score: 150, turns: 60, victory: true, healthRemaining: 3, resourcesGathered: 4 });

    assert.equal(pm.bestScores.easy, 150);
  });

  test('progression manager should track victories', () => {
    const pm = new ProgressionManager();
    pm.reset();

    pm.recordRun('medium', {}, { score: 200, turns: 100, victory: true, healthRemaining: 2, resourcesGathered: 5 });
    pm.recordRun('medium', {}, { score: 150, turns: 80, victory: false, healthRemaining: 0, resourcesGathered: 3 });

    assert.equal(pm.victoriesPerDifficulty.medium, 1);
  });

  test('should unlock hard difficulty after 500+ on medium', () => {
    const pm = new ProgressionManager();
    pm.reset();

    // Before unlock
    let available = pm.getAvailableDifficulties();
    assert.ok(!available.some(d => d.id === 'hard'));

    // Record high-scoring medium run
    pm.recordRun('medium', {}, { score: 600, turns: 100, victory: true, healthRemaining: 5, resourcesGathered: 10 });

    // Check unlock
    pm.checkUnlocks();
    available = pm.getAvailableDifficulties();
    assert.ok(available.some(d => d.id === 'hard'));
  });

  test('should unlock nightmare after 1000+ on hard', () => {
    const pm = new ProgressionManager();
    pm.reset();

    // Unlock hard first
    pm.recordRun('medium', {}, { score: 600, turns: 100, victory: true, healthRemaining: 5, resourcesGathered: 10 });
    pm.checkUnlocks();

    // Record hard run
    pm.recordRun('hard', {}, { score: 1100, turns: 150, victory: true, healthRemaining: 3, resourcesGathered: 15 });

    pm.checkUnlocks();
    const available = pm.getAvailableDifficulties();
    assert.ok(available.some(d => d.id === 'nightmare'));
  });

  test('should limit run history to 50 entries', () => {
    const pm = new ProgressionManager();
    pm.reset();

    for (let i = 0; i < 60; i++) {
      pm.recordRun('easy', {}, { score: 100 + i, turns: 50, victory: true, healthRemaining: 5, resourcesGathered: 3 });
    }

    assert.equal(pm.runHistory.length, 50);
  });

  test('should get leaderboard', () => {
    const pm = new ProgressionManager();
    pm.reset();

    pm.recordRun('easy', {}, { score: 150, turns: 50, victory: true, healthRemaining: 5, resourcesGathered: 3 });
    pm.recordRun('medium', {}, { score: 300, turns: 100, victory: true, healthRemaining: 3, resourcesGathered: 5 });

    const board = pm.getLeaderboard();
    assert.equal(board.easy, 150);
    assert.equal(board.medium, 300);
  });

  test('should get stats', () => {
    const pm = new ProgressionManager();
    pm.reset();

    pm.recordRun('easy', {}, { score: 100, turns: 50, victory: true, healthRemaining: 5, resourcesGathered: 3 });
    pm.recordRun('easy', {}, { score: 200, turns: 60, victory: false, healthRemaining: 0, resourcesGathered: 3 });

    const stats = pm.getStats();
    assert.equal(stats.totalRuns, 2);
    assert.equal(stats.bestScores.easy, 200);
    assert.equal(stats.victories.easy, 1);
  });

  test('should maintain data across instances (in-memory)', () => {
    const pm = new ProgressionManager();
    pm.reset();

    pm.recordRun('easy', {}, { score: 150, turns: 50, victory: true, healthRemaining: 5, resourcesGathered: 3 });
    assert.equal(pm.totalRuns, 1);
    assert.equal(pm.bestScores.easy, 150);

    // In Node.js, localStorage is not available, so this tests in-memory storage
    // In browser, it would also persist across reloads
  });

  test('should get specific difficulty stats', () => {
    const pm = new ProgressionManager();
    pm.reset();

    pm.recordRun('easy', {}, { score: 100, turns: 50, victory: true, healthRemaining: 5, resourcesGathered: 3 });
    pm.recordRun('easy', {}, { score: 150, turns: 60, victory: true, healthRemaining: 3, resourcesGathered: 4 });
    pm.recordRun('medium', {}, { score: 300, turns: 100, victory: true, healthRemaining: 5, resourcesGathered: 5 });

    const easyHistory = pm.getRunHistory('easy');
    assert.equal(easyHistory.length, 2);

    const easyBoard = pm.getLeaderboard('easy');
    assert.equal(easyBoard.easy, 150);
  });

  test('should reset progression', () => {
    const pm = new ProgressionManager();
    pm.reset();

    pm.recordRun('easy', {}, { score: 150, turns: 50, victory: true, healthRemaining: 5, resourcesGathered: 3 });
    assert.ok(pm.totalRuns > 0);

    pm.reset();
    assert.equal(pm.totalRuns, 0);
    assert.equal(pm.runHistory.length, 0);
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
