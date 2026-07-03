/**
 * EquipmentSynergies — Combo effects when multiple equipment items are equipped
 * Phase 4B: Equipment synergy system
 */

/**
 * Synergy definitions
 * Each synergy requires 2+ items and provides bonuses
 */
export const SYNERGIES = {
  SHADOW_GUARD: {
    id: 'shadow-guard',
    name: 'Shadow Guard',
    description: 'Armor + Camouflage = harder to detect, better evasion',
    requires: ['armor', 'camouflage'],
    bonuses: {
      hideWeight: 2,      // +2 bias when deciding to hide
      evasion: 1,         // +1 to evasion checks
      detectionResist: 2, // Predators get -2 to finding you
    },
  },

  VENOMOUS_FANGS: {
    id: 'venomous-fangs',
    name: 'Venomous Fangs',
    description: 'Venom + Strength = increased combat damage',
    requires: ['venom', 'strength'],
    bonuses: {
      attackWeight: 2,    // +2 bias when deciding to attack
      combatDamage: 2,    // +2 additional damage in combat
      attackBonus: 1,     // +1 to attack checks
    },
  },

  BRIGHT_MIND: {
    id: 'bright-mind',
    name: 'Bright Mind',
    description: 'Torch + Intelligence = reveals hidden options in encounters',
    requires: ['torch', 'intelligence'],
    bonuses: {
      optionDiscovery: 1,  // Unlock +1 hidden option per encounter type
      intelligenceCheck: 2, // +2 to intelligence-based decisions
      trapDetection: 2,    // Reveal traps before triggering
    },
  },

  UNIVERSAL_EXPLORER: {
    id: 'universal-explorer',
    name: 'Universal Explorer',
    description: 'Swim Fins + Climbing Gear = traverse any terrain',
    requires: ['swim-fins', 'climbing-gear'],
    bonuses: {
      allTerrainMovement: true, // Can move through any terrain
      terrainCost: -1,          // All terrain costs 1 less to traverse
      pathfindingBonus: 3,      // +3 to pathfinding efficiency
    },
  },

  ARMORED_TANK: {
    id: 'armored-tank',
    name: 'Armored Tank',
    description: 'Armor + Climbing Gear = defensive positioning',
    requires: ['armor', 'climbing-gear'],
    bonuses: {
      defenseWeight: 2,   // +2 bias when deciding to stand ground
      defenseBonus: 2,    // +2 to defense checks
      damageReduction: 1, // Reduce all damage by 1 (minimum 0)
    },
  },

  APEX_PREDATOR: {
    id: 'apex-predator',
    name: 'Apex Predator',
    description: 'Venom + Camouflage = stealth damage',
    requires: ['venom', 'camouflage'],
    bonuses: {
      ambushBonus: 3,     // +3 damage when striking from hiding
      huntingWeight: 2,   // +2 bias towards hunting options
      preyDetection: 2,   // +2 to finding and tracking prey
    },
  },

  SWIFT_ESCAPE: {
    id: 'swift-escape',
    name: 'Swift Escape',
    description: 'Swim Fins + Climbing Gear + Dexterity = mobility master',
    requires: ['swim-fins', 'dexterity'],
    bonuses: {
      fleeWeight: 3,      // +3 bias when deciding to flee
      fleeBonus: 2,       // +2 to flee checks
      movementSpeed: 1,   // Move +1 faster per turn
    },
  },

  ILLUMINATED_PATH: {
    id: 'illuminated-path',
    name: 'Illuminated Path',
    description: 'Torch + Climbing Gear = see and climb better',
    requires: ['torch', 'climbing-gear'],
    bonuses: {
      climbBonus: 2,      // +2 to climbing checks
      visibilityBonus: 3, // Can see +3 tiles further
      hazardDetection: 2, // Detect hazards from +2 tiles away
    },
  },

  RESOURCEFUL_SURVIVOR: {
    id: 'resourceful-survivor',
    name: 'Resourceful Survivor',
    description: 'Armor + Torch = better resource gathering and protection',
    requires: ['armor', 'torch'],
    bonuses: {
      resourceGathering: 2,    // Gather +2 resources from encounters
      gatherWeight: 1,         // +1 bias towards gathering
      fireResistance: 2,       // -2 damage from fire hazards
    },
  },

  VAULTING_DUELIST: {
    id: 'vaulting-duelist',
    name: 'Vaulting Duelist',
    description: 'Coiled Spring + Plumed Cap = escape with panache',
    requires: ['coiled-spring', 'plumed-cap'],
    bonuses: {
      fleeWeight: 2,      // +2 bias toward dramatic exits
      fleeBonus: 1,       // +1 to flee checks
      parleyBonus: 1,     // +1 to talking your way out
    },
  },

  VERDANT_ACROBAT: {
    id: 'verdant-acrobat',
    name: 'Verdant Acrobat',
    description: 'Grappling Vine + Coiled Spring = the canopy is yours',
    requires: ['grappling-vine', 'coiled-spring'],
    bonuses: {
      terrainCost: -1,    // Move easier over rough ground
      fleeBonus: 2,       // +2 to flee checks
      trapEscape: 2,      // +2 to escaping traps
    },
  },

  MASKED_LEGEND: {
    id: 'masked-legend',
    name: 'Masked Legend',
    description: 'Plumed Cap + Camouflage = nobody knows the serpent\'s face',
    requires: ['plumed-cap', 'camouflage'],
    bonuses: {
      hideWeight: 2,      // +2 bias toward vanishing acts
      evasion: 1,         // +1 to evasion
      parleyBonus: 2,     // +2 to parley — mystery sells
    },
  },

  NATURE_WALKER: {
    id: 'nature-walker',
    name: 'Nature Walker',
    description: 'Swim Fins + Torch = navigate any environment',
    requires: ['swim-fins', 'torch'],
    bonuses: {
      waterNavigation: true,   // Can navigate rivers optimally
      swampNavigation: true,   // Can move through swamp terrain
      pathOptimization: 2,     // +2 pathfinding optimization
    },
  },
};

/**
 * Get active synergies for a snake
 * Returns array of synergy bonuses that apply
 */
export function getActiveSynergies(equipment) {
  const active = [];

  for (const synergy of Object.values(SYNERGIES)) {
    // Check if all required items are equipped
    const hasAll = synergy.requires.every(item => equipment.includes(item));
    if (hasAll) {
      active.push(synergy);
    }
  }

  return active;
}

/**
 * Get combined bonuses from all active synergies
 */
export function getSynergyBonuses(equipment) {
  const synergies = getActiveSynergies(equipment);
  const combined = {};

  for (const synergy of synergies) {
    for (const [bonus, value] of Object.entries(synergy.bonuses)) {
      combined[bonus] = (combined[bonus] || 0) + value;
    }
  }

  return combined;
}

/**
 * Get synergy description for UI
 */
export function getSynergyText(equipment) {
  const synergies = getActiveSynergies(equipment);
  if (synergies.length === 0) {
    return 'No synergies active. Combine items for bonuses!';
  }

  return synergies.map(s => `✨ ${s.name}: ${s.description}`).join('\n');
}

/**
 * Check if a specific synergy bonus is active
 */
export function hasSynergyBonus(equipment, bonusName) {
  const bonuses = getSynergyBonuses(equipment);
  return bonuses[bonusName] !== undefined && bonuses[bonusName] > 0;
}

/**
 * Get bonus value for a synergy effect
 */
export function getSynergyBonusValue(equipment, bonusName) {
  const bonuses = getSynergyBonuses(equipment);
  return bonuses[bonusName] || 0;
}
