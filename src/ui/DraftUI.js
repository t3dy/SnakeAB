/**
 * DraftUI — Player draft interface for snake configuration
 * Phase 3.1: Character creation via card selection
 * Phase 4B: Synergy hints
 */

import { getSynergyText } from '../agents/EquipmentSynergies.js';
import { DIFFICULTIES, progression } from '../game/Progression.js';

export class DraftUI {
  constructor(onSubmit) {
    this.onSubmit = onSubmit;
    this.selection = {
      attribute: null,
      equipment: [],
      personality: [],
      difficulty: 'medium',
      seed: '',
    };
  }

  /**
   * Render draft interface
   */
  render() {
    const container = document.getElementById('draft-container');
    container.innerHTML = '';

    // Title
    const title = document.createElement('div');
    title.style.cssText = `
      text-align: center;
      margin-bottom: 2rem;
      color: #4a9eff;
      font-size: 1.2rem;
    `;
    title.textContent = '🐍 Draft Your Snake';
    container.appendChild(title);

    // Career stats strip (only after first run)
    const stats = progression.getStats();
    if (stats.totalRuns > 0) {
      const strip = document.createElement('div');
      strip.style.cssText = `
        display: flex;
        justify-content: center;
        gap: 2rem;
        margin-bottom: 1.5rem;
        padding: 0.75rem;
        background: #10202e;
        border: 1px solid #333;
        border-radius: 4px;
        font-size: 0.85rem;
        color: #888;
        flex-wrap: wrap;
      `;
      const victories = Object.values(stats.victories).reduce((a, b) => a + b, 0);
      strip.innerHTML = `
        <span>Runs: <strong style="color:#4a9eff">${stats.totalRuns}</strong></span>
        <span>Victories: <strong style="color:#3ddc84">${victories}</strong></span>
        <span>Avg Score: <strong style="color:#4a9eff">${stats.avgScore}</strong></span>
      `;
      container.appendChild(strip);
    }

    // Attribute Selection
    this.renderAttributeSelector(container);

    // Equipment Selection
    this.renderEquipmentSelector(container);

    // Personality Selection
    this.renderPersonalitySelector(container);

    // Difficulty Selection (moved here from main form)
    this.renderDifficultySelector(container);

    // Start Button
    const startBtn = document.createElement('button');
    startBtn.id = 'draft-start-btn';
    startBtn.textContent = '▶️ Start Simulation';
    startBtn.style.cssText = `
      width: 100%;
      padding: 1rem;
      font-size: 1rem;
      margin-top: 2rem;
    `;
    startBtn.addEventListener('click', () => this.submit());
    container.appendChild(startBtn);

    // Validation hint
    const hint = document.createElement('div');
    hint.style.cssText = `
      margin-top: 1rem;
      font-size: 0.8rem;
      color: #888;
      text-align: center;
    `;
    hint.textContent = 'Select 1 attribute, up to 3 equipment, 1-2 personality';
    container.appendChild(hint);
  }

  /**
   * Render attribute selector
   */
  renderAttributeSelector(container) {
    const section = document.createElement('div');
    section.className = 'panel';
    section.style.cssText = 'margin-bottom: 1.5rem;';

    const title = document.createElement('h2');
    title.textContent = 'Attribute';
    section.appendChild(title);

    const attributes = [
      { id: 'strength', name: '💪 Strength', desc: 'Power and combat ability' },
      { id: 'dexterity', name: '🏃 Dexterity', desc: 'Speed and evasion' },
      { id: 'intelligence', name: '🧠 Intelligence', desc: 'Cleverness and insight' },
    ];

    const cards = document.createElement('div');
    cards.style.cssText = 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;';

    for (const attr of attributes) {
      const card = this.createCard(attr.name, attr.desc, () => {
        this.selection.attribute = attr.id;
        this.render();
      }, this.selection.attribute === attr.id);

      cards.appendChild(card);
    }

    section.appendChild(cards);
    container.appendChild(section);
  }

  /**
   * Render equipment selector
   */
  renderEquipmentSelector(container) {
    const section = document.createElement('div');
    section.className = 'panel';
    section.style.cssText = 'margin-bottom: 1.5rem;';

    const title = document.createElement('h2');
    title.textContent = 'Equipment (pick up to 3)';
    section.appendChild(title);

    const equipment = [
      { id: 'armor', name: '🛡️ Armor', desc: 'Reduce damage' },
      { id: 'camouflage', name: '🫥 Camouflage', desc: 'Hide from predators' },
      { id: 'venom', name: '☠️ Venom', desc: 'Combat bonus' },
      { id: 'climbing-gear', name: '🧗 Climbing Gear', desc: 'Traverse rocky terrain' },
      { id: 'swim-fins', name: '🏊 Swim Fins', desc: 'Cross water' },
      { id: 'torch', name: '🔦 Torch', desc: 'Reveal hazards' },
    ];

    const cards = document.createElement('div');
    cards.style.cssText = 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;';

    for (const item of equipment) {
      const isSelected = this.selection.equipment.includes(item.id);
      const card = this.createCard(item.name, item.desc, () => {
        if (isSelected) {
          this.selection.equipment = this.selection.equipment.filter(e => e !== item.id);
        } else if (this.selection.equipment.length < 3) {
          this.selection.equipment.push(item.id);
        }
        this.render();
      }, isSelected);

      cards.appendChild(card);
    }

    section.appendChild(cards);

    // Synergy hints
    const synergyText = getSynergyText(this.selection.equipment);
    const synergyDiv = document.createElement('div');
    synergyDiv.style.cssText = `
      margin-top: 1rem;
      padding: 0.75rem;
      background-color: #1a2a3a;
      border-left: 3px solid #4a9eff;
      font-size: 0.9rem;
      color: #4a9eff;
      white-space: pre-wrap;
      line-height: 1.5;
    `;
    synergyDiv.textContent = synergyText;
    section.appendChild(synergyDiv);

    container.appendChild(section);
  }

  /**
   * Render personality selector
   */
  renderPersonalitySelector(container) {
    const section = document.createElement('div');
    section.className = 'panel';
    section.style.cssText = 'margin-bottom: 1.5rem;';

    const title = document.createElement('h2');
    title.textContent = 'Personality (pick 1-2)';
    section.appendChild(title);

    const personalities = [
      { id: 'aggressive', name: '⚔️ Aggressive', desc: 'Attack threats boldly' },
      { id: 'cautious', name: '🛡️ Cautious', desc: 'Avoid danger carefully' },
      { id: 'greedy', name: '💰 Greedy', desc: 'Seek resources eagerly' },
      { id: 'fearful', name: '😨 Fearful', desc: 'Flee from threats' },
      { id: 'curious', name: '🔍 Curious', desc: 'Explore boldly' },
      { id: 'calculating', name: '🧮 Calculating', desc: 'Think strategically' },
    ];

    const cards = document.createElement('div');
    cards.style.cssText = 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;';

    for (const pers of personalities) {
      const isSelected = this.selection.personality.includes(pers.id);
      const card = this.createCard(pers.name, pers.desc, () => {
        if (isSelected) {
          this.selection.personality = this.selection.personality.filter(p => p !== pers.id);
        } else if (this.selection.personality.length < 2) {
          this.selection.personality.push(pers.id);
        }
        this.render();
      }, isSelected);

      cards.appendChild(card);
    }

    section.appendChild(cards);
    container.appendChild(section);
  }

  /**
   * Render difficulty selector (progression-aware: locked tiers
   * show their unlock requirement; best scores shown per tier)
   */
  renderDifficultySelector(container) {
    const section = document.createElement('div');
    section.className = 'panel';
    section.style.cssText = 'margin-bottom: 1.5rem;';

    const title = document.createElement('h2');
    title.textContent = 'Difficulty';
    section.appendChild(title);

    // Refresh unlock state before rendering
    progression.checkUnlocks();
    const bestScores = progression.getLeaderboard();

    const cards = document.createElement('div');
    cards.style.cssText = 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem;';

    for (const diff of Object.values(DIFFICULTIES)) {
      const isSelected = this.selection.difficulty === diff.id;
      const best = bestScores[diff.id] || 0;

      let desc = `${diff.description} (×${diff.scoreMultiplier} score)`;
      if (best > 0) desc += ` — Best: ${best}`;

      if (!diff.unlocked) {
        const req = diff.unlockRequirement;
        const card = this.createCard(
          `🔒 ${diff.name}`,
          `Unlock: score ${req.minScore}+ on ${req.difficulty}`,
          () => {}, // Locked — no selection
          false
        );
        card.style.opacity = '0.45';
        card.style.cursor = 'not-allowed';
        cards.appendChild(card);
        continue;
      }

      const card = this.createCard(`${diff.icon} ${diff.name}`, desc, () => {
        this.selection.difficulty = diff.id;
        this.render();
      }, isSelected);

      cards.appendChild(card);
    }

    section.appendChild(cards);
    container.appendChild(section);

    // Seed input
    this.renderSeedInput(container);
  }

  /**
   * Render optional world seed input
   */
  renderSeedInput(container) {
    const section = document.createElement('div');
    section.className = 'panel';
    section.style.cssText = 'margin-bottom: 1.5rem;';

    const title = document.createElement('h2');
    title.textContent = 'World Seed (optional)';
    section.appendChild(title);

    const row = document.createElement('div');
    row.style.cssText = 'display: flex; gap: 0.5rem; align-items: center;';

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'seed-input';
    input.placeholder = 'Leave blank for random world';
    input.value = this.selection.seed || '';
    input.style.cssText = 'flex: 1;';
    input.addEventListener('input', () => {
      this.selection.seed = input.value;
    });
    row.appendChild(input);

    section.appendChild(row);
    container.appendChild(section);
  }

  /**
   * Create a selectable card
   */
  createCard(name, desc, onClick, isSelected) {
    const card = document.createElement('div');
    card.style.cssText = `
      background: ${isSelected ? '#1a3a4a' : '#0a0a0a'};
      border: 2px solid ${isSelected ? '#4a9eff' : '#333'};
      padding: 1rem;
      border-radius: 4px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s;
    `;

    const nameEl = document.createElement('div');
    nameEl.style.cssText = `
      font-weight: bold;
      margin-bottom: 0.5rem;
      color: ${isSelected ? '#4a9eff' : '#e0e0e0'};
    `;
    nameEl.textContent = name;
    card.appendChild(nameEl);

    const descEl = document.createElement('div');
    descEl.style.cssText = `
      font-size: 0.75rem;
      color: #888;
    `;
    descEl.textContent = desc;
    card.appendChild(descEl);

    card.addEventListener('click', onClick);
    card.addEventListener('mouseenter', () => {
      card.style.borderColor = '#4a9eff';
    });
    card.addEventListener('mouseleave', () => {
      card.style.borderColor = isSelected ? '#4a9eff' : '#333';
    });

    return card;
  }

  /**
   * Validate and submit draft
   */
  submit() {
    if (!this.selection.attribute) {
      alert('Please select an attribute');
      return;
    }
    if (this.selection.personality.length === 0) {
      alert('Please select at least one personality trait');
      return;
    }

    this.onSubmit(this.selection);
  }
}
