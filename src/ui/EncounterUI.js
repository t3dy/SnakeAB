/**
 * EncounterUI — Display encounters and player choice UI
 * Phase 3.2: Encounter popup with decision options
 * Phase 4C: Animations
 */

import { AnimationSystem, fadeIn, slideIn, colorChange } from './Animations.js';

export class EncounterUI {
  constructor() {
    this.currentEncounter = null;
    this.onOptionSelected = null;
    this.animationSystem = new AnimationSystem();
  }

  /**
   * Display an encounter with available options
   */
  display(encounter, availableOptions, suggestedOption, onOptionSelected) {
    this.currentEncounter = encounter;
    this.onOptionSelected = onOptionSelected;

    const display = document.getElementById('encounter-display');
    const buttonsContainer = display.querySelector('.encounter-buttons');

    // Clear previous
    display.innerHTML = '';

    // Title
    const title = document.createElement('h2');
    title.style.cssText = `
      color: #4a9eff;
      margin-bottom: 1rem;
      font-size: 1.2rem;
    `;
    title.textContent = `⚡ ${encounter.name}`;
    display.appendChild(title);

    // Description
    const desc = document.createElement('div');
    desc.id = 'encounter-text';
    desc.style.cssText = `
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 1.5rem;
      color: #ddd;
    `;
    desc.textContent = encounter.description;
    display.appendChild(desc);

    // Options
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'encounter-buttons';
    optionsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    `;

    for (const option of availableOptions) {
      const btn = document.createElement('button');
      btn.style.cssText = `
        text-align: left;
        padding: 0.75rem 1rem;
        background: ${option.id === suggestedOption ? '#2a5a6a' : '#1a3a4a'};
        color: #4a9eff;
        border: 2px solid ${option.id === suggestedOption ? '#4a9eff' : '#333'};
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.2s;
      `;

      const label = document.createElement('div');
      label.style.cssText = 'font-weight: bold;';
      label.textContent = option.name;

      const desc = document.createElement('div');
      desc.style.cssText = 'font-size: 0.85rem; color: #aaa; margin-top: 0.25rem;';
      desc.textContent = option.description;

      if (option.id === suggestedOption) {
        const badge = document.createElement('div');
        badge.style.cssText = `
          font-size: 0.7rem;
          color: #4a9eff;
          margin-top: 0.5rem;
        `;
        badge.textContent = '🤖 AI suggests this';
        desc.appendChild(badge);
      }

      btn.appendChild(label);
      btn.appendChild(desc);

      btn.addEventListener('click', () => {
        this.selectOption(option.id);
      });

      btn.addEventListener('mouseenter', () => {
        btn.style.borderColor = '#4a9eff';
        btn.style.background = '#2a5a6a';
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.borderColor = option.id === suggestedOption ? '#4a9eff' : '#333';
        btn.style.background = option.id === suggestedOption ? '#2a5a6a' : '#1a3a4a';
      });

      optionsContainer.appendChild(btn);
    }

    display.appendChild(optionsContainer);
    display.classList.add('active');

    // Add animations
    this.animationSystem.add(fadeIn(title, 300));
    this.animationSystem.add(fadeIn(desc, 400));
    this.animationSystem.add(fadeIn(optionsContainer, 500));
  }

  /**
   * Display encounter outcome
   */
  displayOutcome(outcome) {
    const display = document.getElementById('encounter-display');

    // Clear options
    const buttonsContainer = display.querySelector('.encounter-buttons');
    if (buttonsContainer) {
      buttonsContainer.remove();
    }

    // Show outcome — with full narration when available
    const outcomeEl = document.createElement('div');
    outcomeEl.style.cssText = `
      font-size: 1rem;
      margin-top: 1.5rem;
      padding: 1rem;
      background: #0a3a0a;
      border-left: 4px solid #4a9eff;
      border-radius: 4px;
      line-height: 1.55;
    `;

    if (outcome.narration) {
      const delib = document.createElement('div');
      delib.style.cssText = 'color: #8fb8dd; font-style: italic; margin-bottom: 0.6rem;';
      delib.textContent = outcome.narration.deliberation;
      outcomeEl.appendChild(delib);

      const resol = document.createElement('div');
      resol.style.cssText = 'color: #a8d5b0;';
      resol.textContent = outcome.narration.resolution;
      outcomeEl.appendChild(resol);
    } else {
      const plain = document.createElement('strong');
      plain.textContent = outcome.text;
      outcomeEl.appendChild(plain);
    }

    const resultSummary = document.createElement('div');
    resultSummary.style.cssText = `
      margin-top: 1rem;
      font-size: 0.9rem;
      color: #888;
    `;

    const changes = [];
    if (outcome.health > 0) changes.push(`+${outcome.health} Health`);
    if (outcome.health < 0) changes.push(`${outcome.health} Health`);
    if (outcome.score > 0) changes.push(`+${outcome.score} Score`);

    resultSummary.textContent = changes.length > 0 ? changes.join(' • ') : 'No stat changes';

    outcomeEl.appendChild(resultSummary);
    display.appendChild(outcomeEl);

    // Animate outcome color based on success/failure
    const isPositive = outcome.health > 0 || outcome.score > 0;
    const fromColor = '#1a3a4a';
    const toColor = isPositive ? '#0a3a0a' : '#3a1a1a';
    this.animationSystem.add(colorChange(outcomeEl, fromColor, toColor, 500));
    this.animationSystem.add(fadeIn(outcomeEl, 400));

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '▶️ Continue';
    closeBtn.style.cssText = `
      width: 100%;
      margin-top: 1rem;
      padding: 0.75rem;
    `;
    closeBtn.addEventListener('click', () => {
      display.classList.remove('active');
      if (this.onOptionSelected) {
        this.onOptionSelected('continue');
      }
    });
    display.appendChild(closeBtn);
    this.animationSystem.add(fadeIn(closeBtn, 500));
  }

  /**
   * Handle option selection
   */
  selectOption(optionId) {
    if (this.onOptionSelected) {
      this.onOptionSelected(optionId);
    }
  }

  /**
   * Hide encounter display
   */
  hide() {
    const display = document.getElementById('encounter-display');
    display.classList.remove('active');
  }
}
