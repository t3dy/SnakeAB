/**
 * SnakeAB — Main Application Entry Point
 * Phase 1-3: Core game + UI orchestration
 */

import { Simulator } from './sim/Simulator.js';
import { Renderer } from './ui/Renderer.js';
import { DraftUI } from './ui/DraftUI.js';
import { EncounterUI } from './ui/EncounterUI.js';
import { EncounterResolver } from './encounters/EncounterResolver.js';
import { getEncounterDef } from './encounters/EncounterTypes.js';

// Application state
const appState = {
  simulator: null,
  renderer: null,
  draftUI: null,
  encounterUI: null,
  gameRunning: false,
  animationFrameId: null,
  lastTickTime: 0,
  encounterPending: false,
  seedInput: 'default-seed',
};

/**
 * Initialize application
 */
function init() {
  console.log('🐍 SnakeAB initializing...');

  // Create UI handlers
  appState.draftUI = new DraftUI(handleDraftSubmit);
  appState.encounterUI = new EncounterUI();

  // Render draft UI initially
  appState.draftUI.render();

  // Wire up control buttons (for in-game use)
  document.getElementById('pause-btn').addEventListener('click', togglePause);
  document.getElementById('step-btn').addEventListener('click', stepGame);
  document.getElementById('speed-slider').addEventListener('input', updateSpeed);

  console.log('✓ UI initialized');
}

/**
 * Handle draft submission
 */
function handleDraftSubmit(config) {
  console.log('Draft submitted:', config);
  appState.seedInput = document.getElementById('seed-input')?.value || 'default-seed';

  // Hide draft UI
  const draftContainer = document.getElementById('draft-container');
  draftContainer.style.display = 'none';

  // Show game UI
  document.getElementById('world-container').style.display = 'flex';
  document.getElementById('ui-container').style.display = 'flex';

  startGame(config);
}

/**
 * Start a new game with draft config
 */
function startGame(draftConfig) {
  const difficulty = draftConfig.difficulty || 'medium';
  const seed = appState.seedInput;

  console.log(`Starting game: difficulty=${difficulty}, seed=${seed}`);

  // Create simulator with draft config
  appState.simulator = new Simulator(draftConfig, seed, difficulty);

  // Create renderer
  appState.renderer = new Renderer('game-canvas');

  // Wire up encounter UI callback
  appState.encounterUI.onOptionSelected = handleEncounterChoice;

  // Update UI
  document.getElementById('pause-btn').disabled = false;
  document.getElementById('step-btn').disabled = false;

  appState.gameRunning = true;
  appState.lastTickTime = performance.now();

  // Start main loop
  mainLoop();
}

/**
 * Main game loop
 */
function mainLoop() {
  if (!appState.gameRunning) return;

  const now = performance.now();
  const elapsed = now - appState.lastTickTime;
  const tickInterval = 500 / (appState.simulator?.speedMultiplier || 1);

  if (elapsed >= tickInterval) {
    // Execute one tick
    appState.simulator.tick();
    appState.lastTickTime = now;

    // Render
    const state = appState.simulator.getState();
    appState.renderer.render(state);
    updateUI(state);

    // Check for encounter
    if (state.encounter && !appState.encounterPending) {
      appState.encounterPending = true;
      displayEncounter(state.encounter);
    }

    // Check for game over
    if (state.gameOver) {
      endGame(state);
      return;
    }
  }

  appState.animationFrameId = requestAnimationFrame(mainLoop);
}

/**
 * Display encounter to player
 */
function displayEncounter(encounter) {
  const { entity } = encounter;
  const snake = appState.simulator.snake;

  // Get available options
  const availableOptions = EncounterResolver.getAvailableOptions(entity.type, snake);

  // Get AI suggestion
  const suggestedOption = EncounterResolver.decideAction(entity.type, snake);

  // Get encounter definition
  const encounterDef = getEncounterDef(entity.type);

  // Display to player
  if (encounterDef && availableOptions.length > 0) {
    appState.encounterUI.display(
      encounterDef,
      availableOptions,
      suggestedOption,
      handleEncounterChoice
    );
  }
}

/**
 * Handle player encounter choice
 */
function handleEncounterChoice(optionId) {
  if (optionId === 'continue') {
    appState.encounterPending = false;
    return;
  }

  if (!appState.simulator || !appState.simulator.currentEncounter) {
    appState.encounterPending = false;
    return;
  }

  // Resolve encounter with player choice (Phase 3: use player choice instead of AI)
  // For now, AI already decided, so just show outcome
  const state = appState.simulator.getState();
  const encounter = appState.simulator.currentEncounter;

  // Resolve using the chosen option
  const outcome = EncounterResolver.resolveOutcome(encounter.entity.type, appState.simulator.snake, optionId);

  // Apply outcome
  appState.simulator.snake.takeDamage(-outcome.health);
  appState.simulator.snake.addScore(outcome.score);

  // Display outcome
  appState.encounterUI.displayOutcome(outcome);

  // Clear encounter
  appState.simulator.currentEncounter = null;
  appState.encounterPending = false;
}

/**
 * End game
 */
function endGame(state) {
  console.log('Game over!');
  appState.gameRunning = false;
  document.getElementById('pause-btn').disabled = true;
  document.getElementById('step-btn').disabled = true;

  // Show results
  const resultsText = state.victory
    ? `🏁 Victory! Score: ${state.snake.score}`
    : `☠️ Defeat. Score: ${state.snake.score}`;

  const log = document.getElementById('debug-log');
  const resultDiv = document.createElement('div');
  resultDiv.style.cssText = 'color: #4a9eff; font-weight: bold; margin-top: 1rem;';
  resultDiv.textContent = resultsText;
  log.appendChild(resultDiv);
}

/**
 * Toggle pause
 */
function togglePause() {
  if (!appState.simulator) return;

  const isPaused = appState.simulator.paused;
  appState.simulator.setPaused(!isPaused);

  const btn = document.getElementById('pause-btn');
  btn.textContent = isPaused ? 'Pause' : 'Resume';

  if (!isPaused) {
    appState.lastTickTime = performance.now();
    mainLoop();
  }
}

/**
 * Step one turn
 */
function stepGame() {
  if (!appState.simulator) return;

  appState.simulator.tick();
  const state = appState.simulator.getState();
  appState.renderer.render(state);
  updateUI(state);
}

/**
 * Update UI with current state
 */
function updateUI(state) {
  document.getElementById('turn-count').textContent = state.turn;
  document.getElementById('health-count').textContent = `${state.snake.health} / ${state.snake.maxHealth}`;
  document.getElementById('score-count').textContent = state.snake.score;

  const log = document.getElementById('debug-log');
  log.innerHTML = state.log
    .map(entry => `<div class="log-entry">${escapeHtml(entry)}</div>`)
    .join('');
  log.scrollTop = log.scrollHeight;
}

/**
 * Update speed
 */
function updateSpeed(event) {
  const speed = parseFloat(event.target.value);
  if (appState.simulator) {
    appState.simulator.setSpeed(speed);
  }
  document.getElementById('speed-label').textContent = `${speed.toFixed(1)}x`;
}

/**
 * Escape HTML for safe logging
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Start the app
window.addEventListener('DOMContentLoaded', init);
