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
      text: [
        '⏭️ The warmth calls, but the trail calls louder. You move on.',
        '⏭️ No time to bask. A restless snake is a hungry snake, but a resting snake is sometimes a dead one.',
      ],
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
      text: [
        '⏭️ No snake needs treasure. You leave the shine to the dead and the magpies.',
        '⏭️ The glitter watches you go. Wiser serpents than you have said no to less.',
      ],
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
        // Strength check vs predator threat — drafting Strength matters,
        // and a long body adds intimidation and reach
        const snakeStrength = getStatValue(snake, 'strength');
        const bonus = snake.getEquipmentBonus('combat');
        const lengthBonus = snake.getLengthBonus ? snake.getLengthBonus() : 0;
        const roll = Math.random() * 10;
        return snakeStrength + bonus + lengthBonus + roll > predator.baseThreat + 5;
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
        // Dexterity check — drafting Dexterity matters, but a long
        // body is slow to turn and slow to vanish
        const dex = getStatValue(snake, 'dexterity');
        const lengthPenalty = snake.getLengthPenalty ? snake.getLengthPenalty() : 0;
        const roll = Math.random() * 10;
        return dex - lengthPenalty + roll > predator.baseThreat + 4;
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
        // Stealth check (camouflage + intelligence) — a long body
        // is more of it to tuck out of sight
        const bonus = snake.getEquipmentBonus('evasion');
        const intel = getStatValue(snake, 'intelligence');
        const lengthPenalty = snake.getLengthPenalty ? snake.getLengthPenalty() : 0;
        const roll = Math.random() * 10;
        return intel + bonus - lengthPenalty + roll > predator.baseThreat + 4;
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
        text: [
          '🛡️ Held your ground. Lost only 1 health.',
          '🛡️ You coil, flatten, and hiss like a kettle from hell. It costs you a scratch — and buys your life.',
          '🛡️ The strike glances off. You do not yield the trail. -1 health, +1 legend.',
        ],
      },
      failure: {
        health: -3,
        score: 0,
        text: [
          '🐺 Took damage. Lost 3 health.',
          '🐺 Bravery without armor is just a slower retreat. -3 health.',
        ],
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
        text: [
          '🔧 Successfully disarmed the trap!',
          '🔧 Slow work, patient work — a nudge here, a careful coil there — and the danger is dead metal and slack line.',
          '🔧 A clever body finds the weak point. The trap sags, spent, and you glide over it like a rumor.',
        ],
      },
      failure: {
        health: -2,
        score: 0,
        text: [
          '💥 Failed to disarm! Lost 2 health.',
          '💥 Almost. Almost. The mechanism snaps and clips you on the way through. -2 health.',
        ],
      },
    },
    escape: {
      check: (snake) => Math.random() * 10 > 4,
      success: {
        health: 0,
        score: 10,
        text: [
          '💨 Escaped past the trap!',
          '💨 Quick through the gap — the danger closes on the space where your tail used to be.',
        ],
      },
      failure: {
        health: -3,
        score: 0,
        text: [
          '💥 Triggered it while escaping! Lost 3 health.',
          '💥 Speed was the wrong answer. The trap takes its toll as you tear loose. -3 health.',
        ],
      },
    },
    'take-damage': {
      check: () => false,
      success: null, // No success path
      failure: {
        health: -4,
        score: 0,
        text: [
          '💥 Got caught in the trap! Lost 4 health.',
          '💥 Straight through, and it costs what going straight through always costs. -4 health, and a lesson.',
        ],
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
      text: [
        '🗣️ A slow exchange of tongue-flicks and trail-news. Wisdom, freely given.',
        '🗣️ You share the language of scales for a while. The trail feels less lonely after.',
      ],
    },
    ignore: {
      health: 0,
      score: 0,
      text: [
        '👤 You pass without a flick. Not every snake on the trail is your business.',
        '👤 The other serpent watches you go. Some journeys are made alone.',
      ],
    },
    trade: {
      health: 0,
      score: 15,
      text: [
        '💱 News for news, a fair trade between serpents. You leave richer.',
        '💱 A favorable exchange — the other snake wanted what you knew more than you did.',
      ],
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
      text: [
        '🔥 Pushed through! Lost 2 health.',
        '🔥 Straight through the worst of it, scales smoking. It hurts. It works. -2 health.',
        '🔥 You pay the ground its toll in pain and keep moving. -2 health.',
      ],
    },
    detour: {
      health: 0,
      score: 0,
      text: [
        '🛤️ The long way around costs time and nothing else. An old snake\'s choice.',
        '🛤️ You circle wide. The danger seethes behind you, uncollected.',
      ],
    },
    wait: {
      health: 0,
      score: 0,
      text: [
        '⏳ Stillness is a snake\'s oldest trick. The danger passes; you remain.',
        '⏳ You coil and wait it out. Patience costs nothing but time.',
      ],
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
