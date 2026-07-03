/**
 * SnakeAgent — Snake state and decision-making
 * Phase 1: Core agent state management
 * Phase 4B: Equipment synergy system
 */

import { getActiveSynergies, getSynergyBonusValue } from './EquipmentSynergies.js';

export class SnakeAgent {
  constructor(draftConfig = {}) {
    // Position
    this.x = 0;
    this.y = 0;

    // Identity
    this.id = 'snake';

    // Draft configuration
    this.attribute = draftConfig.attribute || 'strength';
    this.equipment = draftConfig.equipment || [];
    this.personality = draftConfig.personality || [];

    // Stats
    this.health = 10;
    this.maxHealth = 10;
    this.energy = 10;
    this.maxEnergy = 10;
    this.score = 0;
    this.inventory = [];
    this.resourcesGathered = 0;

    // Body: grows as the snake eats. A long snake strikes harder
    // but is slower to flee and harder to hide.
    this.length = 3;
    this.segments = []; // Trail of recent positions, head first

    // History
    this.encounterHistory = {}; // { 'predator_id': { wins: 0, losses: 0 }, ... }
    this.turnCount = 0;
    this.alive = true;
  }

  /**
   * Take damage
   */
  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) {
      this.alive = false;
    }
  }

  /**
   * Gain health
   */
  gainHealth(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  /**
   * Add score
   */
  addScore(points) {
    this.score += points;
  }

  /**
   * Check if alive
   */
  isAlive() {
    return this.alive && this.health > 0;
  }

  /**
   * Grow one segment (from eating)
   */
  grow() {
    this.length++;
  }

  /**
   * Escape penalty from body length: every 2 segments past the
   * starting 3 make fleeing and hiding harder
   */
  getLengthPenalty() {
    return Math.floor(Math.max(0, this.length - 3) / 2);
  }

  /**
   * Intimidation bonus from body length: every 3 segments past
   * the starting 3 make attacks and standing ground stronger
   */
  getLengthBonus() {
    return Math.floor(Math.max(0, this.length - 3) / 3);
  }

  /**
   * Record the head position; keep a trail as long as the body
   */
  recordPosition(x, y) {
    if (this.segments.length === 0 || this.segments[0].x !== x || this.segments[0].y !== y) {
      this.segments.unshift({ x, y });
    }
    while (this.segments.length > this.length) {
      this.segments.pop();
    }
  }

  /**
   * Get attribute value (1-10 scale).
   * The drafted attribute is strong (7); the others are baseline (4).
   * Pass a stat name to query a specific attribute, or omit it
   * to get the drafted attribute's value.
   */
  getAttributeValue(statName = null) {
    const stat = statName || this.attribute;
    return stat === this.attribute ? 7 : 4;
  }

  /**
   * Get equipment bonus for a specific check
   */
  getEquipmentBonus(checkType) {
    const bonuses = {
      combat: this.equipment.includes('venom') ? 2 : 0,
      defense: this.equipment.includes('armor') ? 2 : 0,
      evasion: this.equipment.includes('camouflage') ? 2 : 0,
    };

    // Add synergy bonuses
    bonuses.combat += getSynergyBonusValue(this.equipment, 'combatDamage');
    bonuses.defense += getSynergyBonusValue(this.equipment, 'defenseBonus');
    bonuses.evasion += getSynergyBonusValue(this.equipment, 'evasion');

    return bonuses[checkType] || 0;
  }

  /**
   * Get active synergies
   */
  getSynergies() {
    return getActiveSynergies(this.equipment);
  }

  /**
   * Get synergy bonus value
   */
  getSynergyBonus(bonusName) {
    return getSynergyBonusValue(this.equipment, bonusName);
  }

  /**
   * Check if personality includes a trait
   */
  hasPersonality(trait) {
    return this.personality.includes(trait);
  }

  /**
   * Get personality weight for a decision
   */
  getPersonalityWeight(decision) {
    const weights = {
      attack: this.hasPersonality('aggressive') ? 3 : this.hasPersonality('fearful') ? -1 : 0,
      flee: this.hasPersonality('cautious') ? 3 : this.hasPersonality('aggressive') ? -2 : 0,
      hide: this.hasPersonality('cautious') ? 2 : 0,
      gather: this.hasPersonality('greedy') ? 2 : 0,
      explore: this.hasPersonality('curious') ? 2 : 0,
    };
    return weights[decision] || 0;
  }

  /**
   * Record encounter outcome for history
   */
  recordEncounter(encounterId, won) {
    if (!this.encounterHistory[encounterId]) {
      this.encounterHistory[encounterId] = { wins: 0, losses: 0 };
    }
    if (won) {
      this.encounterHistory[encounterId].wins++;
    } else {
      this.encounterHistory[encounterId].losses++;
    }
  }

  /**
   * Get history bonus for an encounter (learned behavior)
   */
  getHistoryBonus(encounterId) {
    const history = this.encounterHistory[encounterId];
    if (!history) return 0;
    // Bonus: +1 per previous win
    return Math.max(0, history.wins - history.losses);
  }

  /**
   * Increment turn counter
   */
  nextTurn() {
    this.turnCount++;
  }

  /**
   * Serialize state for debugging
   */
  toString() {
    return `Snake(${this.attribute})[${this.health}/${this.maxHealth}] @ (${this.x}, ${this.y})`;
  }
}
