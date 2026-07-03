/**
 * SnakeAB — Main Application Entry Point
 * Phase 1-4: Core game + UI orchestration + progression
 */

import { Simulator } from './sim/Simulator.js';
import { Renderer } from './ui/Renderer.js';
import { IsoRenderer } from './ui/IsoRenderer.js';
import { DraftUI } from './ui/DraftUI.js';
import { EncounterUI } from './ui/EncounterUI.js';
import { EncounterResolver } from './encounters/EncounterResolver.js';
import { getEncounterDef } from './encounters/EncounterTypes.js';
import { progression, DIFFICULTIES } from './game/Progression.js';

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
  draftConfig: null,
  runRecorded: false,
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
  document.getElementById('show-results-btn').addEventListener('click', () => {
    document.getElementById('show-results-btn').classList.remove('active');
    document.getElementById('gameover-display').classList.add('active');
  });

  console.log('✓ UI initialized');
}

/**
 * Handle draft submission
 */
function handleDraftSubmit(config) {
  console.log('Draft submitted:', config);

  // Hide draft UI
  const draftContainer = document.getElementById('draft-container');
  draftContainer.innerHTML = '';
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
  // Custom seed if provided, otherwise a fresh random world each run
  const seed = (draftConfig.seed && draftConfig.seed.trim()) || `run-${Date.now().toString(36)}`;

  console.log(`Starting game: difficulty=${difficulty}, seed=${seed}`);

  appState.draftConfig = draftConfig;
  appState.runRecorded = false;
  appState.encounterPending = false;
  resetStory();

  // Create simulator with draft config
  appState.simulator = new Simulator(draftConfig, seed, difficulty);

  // Create renderer once and reuse it across runs — isometric 3D,
  // with the 2D canvas renderer as a fallback if WebGL is unavailable
  if (!appState.renderer) {
    try {
      appState.renderer = new IsoRenderer('game-canvas');
    } catch (e) {
      console.warn('WebGL unavailable, falling back to 2D renderer:', e);
      appState.renderer = new Renderer('game-canvas');
    }
  }

  // Wire up encounter UI callback
  appState.encounterUI.onOptionSelected = handleEncounterChoice;

  // Update UI
  document.getElementById('pause-btn').disabled = false;
  document.getElementById('step-btn').disabled = false;
  document.getElementById('pause-btn').textContent = 'Pause';

  // First render immediately so the world is visible before the first tick
  const state = appState.simulator.getState();
  appState.renderer.render(state);
  updateUI(state);

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

    const ended = processTickResult();
    if (ended) return;
  }

  appState.animationFrameId = requestAnimationFrame(mainLoop);
}

/**
 * Render state and handle encounters/game-over after a tick.
 * Shared by the main loop and the Step button.
 * Returns true if the game ended.
 */
function processTickResult() {
  const state = appState.simulator.getState();
  appState.renderer.render(state);
  updateUI(state);

  // Check for encounter
  if (state.encounter && !appState.encounterPending) {
    appState.encounterPending = true;
    displayEncounter(state.encounter);
  }

  // Check for game over (deferred while an encounter popup is
  // open so the player sees the fatal outcome first)
  if (state.gameOver && !appState.encounterPending) {
    endGame(state);
    return true;
  }

  return false;
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

  const autopilot = document.getElementById('autopilot-toggle')?.checked;

  if (!encounterDef || availableOptions.length === 0) {
    // No definition for this entity — auto-resolve via AI so
    // the game never softlocks on an unknown encounter
    appState.simulator.resolveEncounter();
    appState.encounterPending = false;
    return;
  }

  if (autopilot) {
    // Autobattler mode: the snake's personality decides, the
    // story unfolds in the story panel — no popup, no interruption
    const outcome = appState.simulator.resolveEncounterWithChoice(suggestedOption);
    const state = appState.simulator.getState();
    appState.renderer.render(state);
    updateUI(state);
    if (outcome && outcome.narration) {
      appendStory(outcome.narration, state.turn);
    }
    appState.encounterPending = false;

    if (state.gameOver) {
      endGame(state);
    }
    return;
  }

  // Manual mode: show the popup (with the narrated predicament),
  // player decides
  const narratedDef = {
    ...encounterDef,
    description: encounter.predicament || encounterDef.description,
  };
  appState.encounterUI.display(
    narratedDef,
    availableOptions,
    suggestedOption,
    handleEncounterChoice
  );
}

/**
 * Append a three-beat narration entry to the story panel
 */
function appendStory(narration, turn) {
  const panel = document.getElementById('story-panel');
  if (!panel) return;

  // Remove placeholder
  const empty = panel.querySelector('.story-empty');
  if (empty) empty.remove();

  const entry = document.createElement('div');
  entry.className = 'story-entry';
  entry.innerHTML = `
    <div class="story-turn">Turn ${turn}</div>
    <div class="story-predicament">${escapeHtml(narration.predicament)}</div>
    <div class="story-deliberation">${escapeHtml(narration.deliberation)}</div>
    <div class="story-resolution">${escapeHtml(narration.resolution)}</div>
  `;
  panel.appendChild(entry);

  // Keep the last 12 entries
  while (panel.children.length > 12) {
    panel.removeChild(panel.firstChild);
  }
  panel.scrollTop = panel.scrollHeight;
}

/**
 * Reset the story panel for a fresh run
 */
function resetStory() {
  const panel = document.getElementById('story-panel');
  if (panel) {
    panel.innerHTML = '<div class="story-empty">The story of this snake has not yet been written…</div>';
  }
}

/**
 * Handle player encounter choice
 */
function handleEncounterChoice(optionId) {
  if (optionId === 'continue') {
    // Player dismissed the outcome popup — resume simulation
    appState.encounterPending = false;
    appState.lastTickTime = performance.now();
    return;
  }

  if (!appState.simulator || !appState.simulator.currentEncounter) {
    appState.encounterUI.hide();
    appState.encounterPending = false;
    return;
  }

  // Resolve through the simulator: applies stats with difficulty
  // multiplier, removes the entity, moves the snake, checks death
  const outcome = appState.simulator.resolveEncounterWithChoice(optionId);

  // Re-render world + stats immediately
  const state = appState.simulator.getState();
  appState.renderer.render(state);
  updateUI(state);

  // The story panel gets the full narration too
  if (outcome && outcome.narration) {
    appendStory(outcome.narration, state.turn);
  }

  // Display outcome (Continue button fires 'continue' above)
  appState.encounterUI.displayOutcome(outcome);

  // If the encounter killed the snake, finish after the popup closes
  if (state.gameOver) {
    appState.encounterUI.onOptionSelected = () => {
      appState.encounterUI.hide();
      endGame(state);
    };
  }
}

/**
 * End game: record the run, show the game-over screen
 */
function endGame(state) {
  console.log('Game over!');
  appState.gameRunning = false;
  document.getElementById('pause-btn').disabled = true;
  document.getElementById('step-btn').disabled = true;

  // Record run in progression (once)
  let newlyUnlocked = [];
  if (!appState.runRecorded && appState.simulator) {
    appState.runRecorded = true;
    const lockedBefore = Object.values(DIFFICULTIES).filter(d => !d.unlocked).map(d => d.id);
    progression.recordRun(
      appState.simulator.difficulty,
      appState.draftConfig,
      appState.simulator.getRunResult()
    );
    newlyUnlocked = Object.values(DIFFICULTIES)
      .filter(d => d.unlocked && lockedBefore.includes(d.id));
  }

  showGameOverScreen(state, newlyUnlocked);
}

/**
 * Build and show the game-over modal
 */
function showGameOverScreen(state, newlyUnlocked) {
  const display = document.getElementById('gameover-display');
  const result = appState.simulator.getRunResult();
  const difficulty = appState.simulator.difficulty;
  const best = progression.getLeaderboard(difficulty)[difficulty] || 0;
  const isNewBest = result.score >= best && result.score > 0;

  const unlockHtml = newlyUnlocked.length > 0
    ? `<div style="margin-top:1rem;padding:0.75rem;background:#2a1a3a;border:1px solid #b04aff;border-radius:4px;color:#d0a0ff;">
         🔓 New difficulty unlocked: <strong>${newlyUnlocked.map(d => d.name).join(', ')}</strong>!
       </div>`
    : '';

  // The narrated ending — epitaph or victory coda
  const epitaphHtml = result.epitaph
    ? `<div style="margin-bottom:1.25rem;padding:0.9rem;background:#151b10;border-left:3px solid ${state.victory ? '#3ddc84' : '#aa5544'};border-radius:4px;color:#d8c9a3;font-style:italic;line-height:1.6;">
         ${escapeHtml(result.epitaph)}
       </div>`
    : '';

  display.innerHTML = `
    <h2 style="color:${state.victory ? '#3ddc84' : '#ff6666'};font-size:1.4rem;margin-bottom:1rem;text-align:center;">
      ${state.victory ? '🏁 Victory!' : '☠️ Your snake has fallen.'}
    </h2>
    ${epitaphHtml}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem 1.5rem;font-size:0.95rem;margin-bottom:0.5rem;">
      <span style="color:#888;">Score</span><strong style="color:#4a9eff;text-align:right;">${result.score}${isNewBest ? ' ⭐ New Best!' : ''}</strong>
      <span style="color:#888;">Final length</span><strong style="text-align:right;">${result.finalLength} scales</strong>
      <span style="color:#888;">Turns survived</span><strong style="text-align:right;">${result.turns}</strong>
      <span style="color:#888;">Resources gathered</span><strong style="text-align:right;">${result.resourcesGathered}</strong>
      <span style="color:#888;">Difficulty</span><strong style="text-align:right;">${difficulty}</strong>
      <span style="color:#888;">Best on ${difficulty}</span><strong style="text-align:right;">${Math.max(best, result.score)}</strong>
    </div>
    ${unlockHtml}
  `;

  const againBtn = document.createElement('button');
  againBtn.textContent = '🐍 Draft a New Snake';
  againBtn.style.cssText = 'width:100%;margin-top:1.5rem;padding:0.9rem;font-size:1rem;';
  againBtn.addEventListener('click', resetToDraft);
  display.appendChild(againBtn);

  // Let the player read the full story with the modal out of the way
  const storyBtn = document.createElement('button');
  storyBtn.textContent = '📖 Read the Story';
  storyBtn.style.cssText = 'width:100%;margin-top:0.5rem;padding:0.7rem;font-size:0.9rem;background:#1a3a4a;color:#4a9eff;';
  storyBtn.addEventListener('click', () => {
    display.classList.remove('active');
    document.getElementById('show-results-btn').classList.add('active');
  });
  display.appendChild(storyBtn);

  display.classList.add('active');
}

/**
 * Return to the draft screen for another run
 */
function resetToDraft() {
  document.getElementById('gameover-display').classList.remove('active');
  document.getElementById('show-results-btn').classList.remove('active');
  appState.encounterUI.hide();
  appState.encounterUI.onOptionSelected = handleEncounterChoice;
  appState.simulator = null;
  appState.encounterPending = false;

  // Hide game UI, show draft
  document.getElementById('world-container').style.display = 'none';
  document.getElementById('ui-container').style.display = 'none';
  const draftContainer = document.getElementById('draft-container');
  draftContainer.style.display = 'block';
  appState.draftUI.render();
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
  if (!appState.simulator || !appState.gameRunning) return;

  appState.simulator.tick();
  processTickResult();
}

/**
 * Update UI with current state
 */
function updateUI(state) {
  document.getElementById('turn-count').textContent = state.turn;
  document.getElementById('health-count').textContent = `${state.snake.health} / ${state.snake.maxHealth}`;
  document.getElementById('length-count').textContent = state.snake.length;
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
