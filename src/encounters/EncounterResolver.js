/**
 * EncounterResolver — Resolves encounters with outcomes
 * Phase 2.2-2.3: Decision logic and outcome resolution
 */

import {
  getEncounterDef,
  isOptionAvailable,
  ENCOUNTERS,
} from './EncounterTypes.js';

export class EncounterResolver {
  /**
   * Get available options for an encounter
   */
  static getAvailableOptions(entityType, snake) {
    const encounterDef = getEncounterDef(entityType);
    if (!encounterDef) return [];

    return encounterDef.options.filter(opt => isOptionAvailable(opt, snake));
  }

  /**
   * Decide action based on personality and available options
   * Returns the chosen option ID
   */
  static decideAction(entityType, snake) {
    const encounterDef = getEncounterDef(entityType);
    if (!encounterDef) return null;

    // Get available options
    const availableOptions = this.getAvailableOptions(entityType, snake);
    if (availableOptions.length === 0) {
      console.warn(`No available options for ${entityType}`);
      return null;
    }

    // Weight options by personality
    const weights = availableOptions.map(opt => {
      let weight = 1.0; // Base weight

      // Apply personality biases
      if (entityType === ENCOUNTERS.PREDATOR) {
        if (opt.id === 'attack' && snake.hasPersonality('aggressive')) {
          weight += 3;
        } else if (opt.id === 'flee' && snake.hasPersonality('cautious')) {
          weight += 3;
        } else if (opt.id === 'hide' && snake.hasPersonality('cautious')) {
          weight += 2;
        }

        if (snake.hasPersonality('aggressive') && opt.id === 'flee') {
          weight -= 2;
        }
        if (snake.hasPersonality('fearful') && opt.id === 'attack') {
          weight -= 1;
        }
      }

      if (entityType === ENCOUNTERS.FOOD || entityType === ENCOUNTERS.MEDICINE || entityType === ENCOUNTERS.TREASURE) {
        if (opt.id === 'eat' && snake.hasPersonality('greedy')) {
          weight += 5;
        } else if (opt.id === 'save' && snake.hasPersonality('greedy')) {
          weight += 3;
        } else if (opt.id === 'take-all' && snake.hasPersonality('greedy')) {
          weight += 5;
        } else if (opt.id === 'choose' && snake.hasPersonality('greedy')) {
          weight += 3;
        } else if (opt.id === 'use' && snake.hasPersonality('greedy')) {
          weight += 2;
        }
      }

      // History bonus (experienced encounters)
      const historyBonus = snake.getHistoryBonus(`${entityType}-encounter`);
      weight += historyBonus * 0.5;

      return { option: opt, weight: Math.max(0.1, weight) };
    });

    // Weighted random selection
    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    let roll = Math.random() * totalWeight;

    for (const { option, weight } of weights) {
      roll -= weight;
      if (roll <= 0) {
        return option.id;
      }
    }

    // Fallback to first available
    return availableOptions[0].id;
  }

  /**
   * Resolve an encounter outcome
   * Returns { success, health, score, text }
   */
  static resolveOutcome(entityType, snake, optionId) {
    const encounterDef = getEncounterDef(entityType);
    if (!encounterDef) {
      return { success: false, health: 0, score: 0, text: '❓ Unknown encounter.' };
    }

    const outcome = encounterDef.outcomes[optionId];
    if (!outcome) {
      return { success: false, health: 0, score: 0, text: '❓ Unknown option.' };
    }

    // For simple outcomes (no check required)
    if (outcome.health !== undefined && outcome.score !== undefined) {
      return {
        success: true,
        health: outcome.health,
        score: outcome.score,
        text: outcome.text,
      };
    }

    // For outcomes with checks (combat, stealth, etc.)
    if (outcome.check && outcome.success && outcome.failure) {
      const entity = { baseThreat: 5 }; // Phase 3: pass actual entity
      const checkResult = outcome.check(snake, entity);

      if (checkResult) {
        return {
          success: true,
          health: outcome.success.health,
          score: outcome.success.score,
          text: outcome.success.text,
        };
      } else {
        return {
          success: false,
          health: outcome.failure.health,
          score: outcome.failure.score,
          text: outcome.failure.text,
        };
      }
    }

    return { success: false, health: 0, score: 0, text: '❓ Invalid outcome.' };
  }

  /**
   * Full encounter resolution flow
   * 1. Get available options
   * 2. Decide action based on personality
   * 3. Resolve outcome
   * Returns { chosenOption, outcome, statDelta }
   */
  static resolveEncounter(entityType, snake) {
    // Get available options
    const availableOptions = this.getAvailableOptions(entityType, snake);
    if (availableOptions.length === 0) {
      return {
        chosenOption: null,
        outcome: null,
        error: 'No viable options',
      };
    }

    // Decide action
    const chosenOptionId = this.decideAction(entityType, snake);
    if (!chosenOptionId) {
      return {
        chosenOption: null,
        outcome: null,
        error: 'Could not decide action',
      };
    }

    // Resolve outcome
    const outcome = this.resolveOutcome(entityType, snake, chosenOptionId);

    // Record in history
    snake.recordEncounter(`${entityType}-encounter`, outcome.success);

    return {
      chosenOption: chosenOptionId,
      outcome: outcome,
      statDelta: {
        health: outcome.health,
        score: outcome.score,
      },
    };
  }
}
