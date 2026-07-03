/**
 * EncounterTypes — Encounter definitions with options and outcomes
 * Phase 2.1: Core encounter system
 */

/**
 * Encounter type definitions
 * Each type has options that are gated by stats/equipment
 */
export const ENCOUNTERS = {
  FOOD: 'food',
  MEDICINE: 'medicine',
  TREASURE: 'treasure',
  PREDATOR: 'predator',
  TRAP: 'trap',
  NPC: 'npc',
  HAZARD: 'hazard',
};

/**
 * Food encounter
 * Snake finds food source
 */
export const FOOD_ENCOUNTER = {
  type: ENCOUNTERS.FOOD,
  name: 'Food Source',
  description: 'You discover food! Your stomach rumbles.',
  baseHealth: 5,
  baseScore: 10,
  options: [
    {
      id: 'eat',
      name: 'Eat',
      description: 'Consume the food for health',
      requirements: {}, // Always available
    },
    {
      id: 'save',
      name: 'Save for Later',
      description: 'Store it safely',
      requirements: {},
    },
    {
      id: 'skip',
      name: 'Skip',
      description: 'Leave it for others',
      requirements: {}, // Always available
    },
  ],
  outcomes: {
    eat: {
      health: 5,
      score: 10,
      text: [
        '🍎 Nom nom! Health restored.',
        '🍎 A feast fit for a serpent. +5 health.',
        '🍎 You swallow it whole, the way of your kind. Delicious.',
      ],
    },
    save: {
      health: 2,
      score: 15,
      text: [
        '📦 Stored the food safely. Will need it later.',
        '📦 A wise snake plans ahead. Cached for leaner days.',
      ],
    },
    skip: {
      health: 0,
      score: 0,
      text: [
        '⏭️ Continued on your journey.',
        '⏭️ Not hungry. The road calls.',
      ],
    },
  },
};

/**
 * Medicine encounter
 * Snake finds healing supplies
 */
export const MEDICINE_ENCOUNTER = {
  type: ENCOUNTERS.MEDICINE,
  name: 'Medical Supplies',
  description: 'You found medical supplies!',
  options: [
    {
      id: 'use',
      name: 'Use Immediately',
      description: 'Apply medicine to heal',
      requirements: {},
    },
    {
      id: 'ration',
      name: 'Ration It',
      description: 'Use it sparingly',
      requirements: {},
    },
    {
      id: 'ignore',
      name: 'Leave It',
      description: 'You don\'t need it',
      requirements: {},
    },
  ],
  outcomes: {
    use: {
      health: 15,
      score: 5,
      text: '💊 Full recovery! Feel much better.',
    },
    ration: {
      health: 8,
      score: 20,
      text: '💊 Careful dosage. Saved some for later.',
    },
    ignore: {
      health: 0,
      score: 0,
      text: '⏭️ Left the medicine untouched.',
    },
  },
};

/**
 * Treasure encounter
 * Snake finds valuable items
 */
export const TREASURE_ENCOUNTER = {
  type: ENCOUNTERS.TREASURE,
  name: 'Treasure!',
  description: 'You found treasure! What do you take?',
  options: [
    {
      id: 'take-all',
      name: 'Take Everything',
      description: 'Grab as much as possible',
      requirements: {},
    },
    {
      id: 'choose',
      name: 'Choose Carefully',
      description: 'Take only the best items',
      requirements: {
        statCheck: 'intelligence',
        minValue: 4,
      },
    },
    {
      id: 'leave',
      name: 'Leave It',
      description: 'Too risky',
      requirements: {},
    },
  ],
  outcomes: {
    'take-all': {
      health: 0,
      score: 50,
      text: '💰 Jackpot! Loaded with treasure!',
    },
    choose: {
      health: 0,
      score: 75,
      text: '💎 Selected the finest treasures. Excellent haul!',
    },
    leave: {
      health: 0,
      score: 0,
      text: '⏭️ Moved on without the treasure.',
    },
  },
};

/**
 * Predator encounter
 * Snake meets a dangerous creature
 */
export const PREDATOR_ENCOUNTER = {
  type: ENCOUNTERS.PREDATOR,
  name: 'Predator',
  description: 'A predator lunges at you! What do you do?',
  baseThreat: 5,
  options: [
    {
      id: 'attack',
      name: 'Attack',
      description: 'Fight the predator (uses Strength)',
      requirements: {
        statCheck: 'strength',
        minValue: 4,
      },
    },
    {
      id: 'flee',
      name: 'Flee',
      description: 'Run away (uses Dexterity)',
      requirements: {
        statCheck: 'dexterity',
        minValue: 3,
      },
    },
    {
      id: 'hide',
      name: 'Hide',
      description: 'Use camouflage or hide (needs camouflage equipment)',
      requirements: {
        equipment: 'camouflage',
      },
    },
    {
      id: 'stand-ground',
      name: 'Stand Ground',
      description: 'Defensive stance (uses armor if available)',
      requirements: {}, // Always available
    },
  ],
  outcomes: {
    attack: {
      check: (snake, predator) => {
        // Strength check vs predator threat — drafting Strength matters
        const snakeStrength = getStatValue(snake, 'strength');
        const bonus = snake.getEquipmentBonus('combat');
        const roll = Math.random() * 10;
        return snakeStrength + bonus + roll > predator.baseThreat + 5;
      },
      success: {
        health: 0,
        score: 50,
        text: [
          '⚔️ Victory! Defeated the predator!',
          '⚔️ A crushing strike — the predator flees, beaten!',
          '⚔️ Fangs flash. The predator falls. You are the hunter now.',
        ],
      },
      failure: {
        health: -3,
        score: 0,
        text: [
          '🐺 Predator won the fight! Lost 3 health.',
          '🐺 Claws rake your scales. You barely escape. -3 health.',
          '🐺 Outmatched! You retreat bleeding. -3 health.',
        ],
      },
    },
    flee: {
      check: (snake, predator) => {
        // Dexterity check — drafting Dexterity matters
        const dex = getStatValue(snake, 'dexterity');
        const roll = Math.random() * 10;
        return dex + roll > predator.baseThreat + 4;
      },
      success: {
        health: 0,
        score: 5,
        text: [
          '💨 Escaped safely!',
          '💨 A blur of scales — you vanish into the grass.',
          '💨 Too slow, predator. You slip away untouched.',
        ],
      },
      failure: {
        health: -2,
        score: 0,
        text: [
          '🐺 Caught while fleeing! Lost 2 health.',
          '🐺 Teeth graze your tail as you bolt. -2 health.',
        ],
      },
    },
    hide: {
      check: (snake, predator) => {
        // Stealth check (camouflage + intelligence)
        const bonus = snake.getEquipmentBonus('evasion');
        const intel = getStatValue(snake, 'intelligence');
        const roll = Math.random() * 10;
        return intel + bonus + roll > predator.baseThreat + 4;
      },
      success: {
        health: 0,
        score: 10,
        text: [
          '🫥 Stayed hidden. Predator passed by.',
          '🫥 Motionless among the leaves. The danger moves on.',
          '🫥 Your camouflage holds. The predator sniffs the air... and leaves.',
        ],
      },
      failure: {
        health: -2,
        score: 0,
        text: [
          '🐺 Found while hiding! Lost 2 health.',
          '🐺 A twig snaps. Spotted! -2 health.',
        ],
      },
    },
    'stand-ground': {
      check: (snake, predator) => {
        // Defense check (armor reduces damage)
        const defense = snake.getEquipmentBonus('defense');
        return defense >= 2; // With armor, survive better
      },
      success: {
        health: -1,
        score: 5,
        text: '🛡️ Held your ground. Lost only 1 health.',
      },
      failure: {
        health: -3,
        score: 0,
        text: '🐺 Took damage. Lost 3 health.',
      },
    },
  },
};

/**
 * Trap encounter
 * Snake encounters a hazard or trap
 */
export const TRAP_ENCOUNTER = {
  type: ENCOUNTERS.TRAP,
  name: 'Trap',
  description: 'You spotted a trap! How do you handle it?',
  options: [
    {
      id: 'disarm',
      name: 'Disarm',
      description: 'Carefully disarm the trap (needs Intelligence)',
      requirements: {
        statCheck: 'intelligence',
        minValue: 5,
      },
    },
    {
      id: 'escape',
      name: 'Escape',
      description: 'Rush past it (uses Dexterity)',
      requirements: {
        statCheck: 'dexterity',
        minValue: 4,
      },
    },
    {
      id: 'take-damage',
      name: 'Trigger It',
      description: 'Go through directly',
      requirements: {},
    },
  ],
  outcomes: {
    disarm: {
      check: (snake) => Math.random() * 10 > 3,
      success: {
        health: 0,
        score: 20,
        text: '🔧 Successfully disarmed the trap!',
      },
      failure: {
        health: -2,
        score: 0,
        text: '💥 Failed to disarm! Lost 2 health.',
      },
    },
    escape: {
      check: (snake) => Math.random() * 10 > 4,
      success: {
        health: 0,
        score: 10,
        text: '💨 Escaped past the trap!',
      },
      failure: {
        health: -3,
        score: 0,
        text: '💥 Triggered it while escaping! Lost 3 health.',
      },
    },
    'take-damage': {
      check: () => false,
      success: null, // No success path
      failure: {
        health: -4,
        score: 0,
        text: '💥 Got caught in the trap! Lost 4 health.',
      },
    },
  },
};

/**
 * NPC encounter
 * Snake meets a non-hostile entity
 */
export const NPC_ENCOUNTER = {
  type: ENCOUNTERS.NPC,
  name: 'Stranger',
  description: 'A mysterious figure appears...',
  options: [
    {
      id: 'talk',
      name: 'Talk',
      description: 'Have a conversation',
      requirements: {},
    },
    {
      id: 'ignore',
      name: 'Ignore',
      description: 'Continue on your way',
      requirements: {},
    },
    {
      id: 'trade',
      name: 'Trade',
      description: 'Attempt a trade (if available)',
      requirements: {},
    },
  ],
  outcomes: {
    talk: {
      health: 0,
      score: 5,
      text: '🗣️ Had a chat. Gained some wisdom.',
    },
    ignore: {
      health: 0,
      score: 0,
      text: '👤 Avoided contact.',
    },
    trade: {
      health: 0,
      score: 15,
      text: '💱 Made a favorable trade!',
    },
  },
};

/**
 * Hazard encounter
 * Snake enters environmental danger (fire, swamp, radiation)
 */
export const HAZARD_ENCOUNTER = {
  type: ENCOUNTERS.HAZARD,
  name: 'Environmental Hazard',
  description: 'A dangerous zone blocks your path!',
  options: [
    {
      id: 'push-through',
      name: 'Push Through',
      description: 'Go directly through (takes damage)',
      requirements: {},
    },
    {
      id: 'detour',
      name: 'Find Detour',
      description: 'Take a longer route around',
      requirements: {},
    },
    {
      id: 'wait',
      name: 'Wait It Out',
      description: 'Hide until it passes',
      requirements: {},
    },
  ],
  outcomes: {
    'push-through': {
      health: -2,
      score: 5,
      text: '🔥 Pushed through! Lost 2 health.',
    },
    detour: {
      health: 0,
      score: 0,
      text: '🛤️ Took a longer route. No danger.',
    },
    wait: {
      health: 0,
      score: 0,
      text: '⏳ Waited. The hazard passed.',
    },
  },
};

/**
 * Get encounter definition by type
 */
export function getEncounterDef(entityType) {
  const defs = {
    [ENCOUNTERS.FOOD]: FOOD_ENCOUNTER,
    [ENCOUNTERS.MEDICINE]: MEDICINE_ENCOUNTER,
    [ENCOUNTERS.TREASURE]: TREASURE_ENCOUNTER,
    [ENCOUNTERS.PREDATOR]: PREDATOR_ENCOUNTER,
    [ENCOUNTERS.TRAP]: TRAP_ENCOUNTER,
    [ENCOUNTERS.NPC]: NPC_ENCOUNTER,
    [ENCOUNTERS.HAZARD]: HAZARD_ENCOUNTER,
  };
  return defs[entityType];
}

/**
 * Check if an option is available given snake stats/equipment
 */
export function isOptionAvailable(option, snake) {
  if (!option.requirements || Object.keys(option.requirements).length === 0) {
    return true; // No requirements
  }

  const req = option.requirements;

  // Single stat check
  if (req.statCheck && req.minValue) {
    const value = getStatValue(snake, req.statCheck);
    if (value < req.minValue) return false;
  }

  // Equipment requirement
  if (req.equipment) {
    if (!snake.equipment.includes(req.equipment)) return false;
  }

  // Either/or requirement
  if (req.either) {
    const metOneRequirement = req.either.some(subReq => {
      if (subReq.equipment) {
        return snake.equipment.includes(subReq.equipment);
      }
      if (subReq.statCheck && subReq.minValue) {
        const value = getStatValue(snake, subReq.statCheck);
        return value >= subReq.minValue;
      }
      return false;
    });
    if (!metOneRequirement) return false;
  }

  return true;
}

/**
 * Get stat value from snake (drafted attribute is stronger)
 */
function getStatValue(snake, statName) {
  if (snake && typeof snake.getAttributeValue === 'function') {
    return snake.getAttributeValue(statName);
  }
  return 5;
}
