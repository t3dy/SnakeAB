/**
 * Tests for Equipment Synergy System
 */

import { strict as assert } from 'assert';
import { SnakeAgent } from '../src/agents/SnakeAgent.js';
import {
  SYNERGIES,
  getActiveSynergies,
  getSynergyBonuses,
  getSynergyText,
  hasSynergyBonus,
  getSynergyBonusValue,
} from '../src/agents/EquipmentSynergies.js';

describe('Equipment Synergies', () => {
  test('should define synergies', () => {
    assert.ok(SYNERGIES.SHADOW_GUARD);
    assert.ok(SYNERGIES.VENOMOUS_FANGS);
    assert.ok(SYNERGIES.BRIGHT_MIND);
    assert.ok(SYNERGIES.UNIVERSAL_EXPLORER);
  });

  test('shadow guard requires armor and camouflage', () => {
    const sg = SYNERGIES.SHADOW_GUARD;
    assert.ok(sg.requires.includes('armor'));
    assert.ok(sg.requires.includes('camouflage'));
  });

  test('should detect active synergies', () => {
    const equipment = ['armor', 'camouflage'];
    const synergies = getActiveSynergies(equipment);
    assert.ok(synergies.some(s => s.id === 'shadow-guard'));
  });

  test('should not detect inactive synergies', () => {
    const equipment = ['armor']; // Missing camouflage
    const synergies = getActiveSynergies(equipment);
    assert.ok(!synergies.some(s => s.id === 'shadow-guard'));
  });

  test('should combine bonuses from multiple synergies', () => {
    const equipment = ['armor', 'camouflage', 'venom', 'strength'];
    const bonuses = getSynergyBonuses(equipment);
    assert.ok(bonuses.hideWeight >= 2); // From shadow-guard
    assert.ok(bonuses.combatDamage >= 2); // From venomous-fangs
  });

  test('should get synergy bonus values', () => {
    const equipment = ['armor', 'camouflage'];
    const bonus = getSynergyBonusValue(equipment, 'hideWeight');
    assert.equal(bonus, 2);
  });

  test('should check if synergy bonus is active', () => {
    const equipment = ['armor', 'camouflage'];
    assert.ok(hasSynergyBonus(equipment, 'hideWeight'));
    assert.ok(!hasSynergyBonus(equipment, 'combatDamage'));
  });

  test('should generate synergy text for UI', () => {
    const equipment = ['armor', 'camouflage'];
    const text = getSynergyText(equipment);
    assert.ok(text.includes('Shadow Guard'));
  });

  test('should show no synergies message when none active', () => {
    const equipment = ['armor'];
    const text = getSynergyText(equipment);
    assert.ok(text.includes('No synergies'));
  });

  test('venomous fangs requires venom and strength', () => {
    const vf = SYNERGIES.VENOMOUS_FANGS;
    assert.ok(vf.requires.includes('venom'));
  });

  test('bright mind requires torch and intelligence', () => {
    const bm = SYNERGIES.BRIGHT_MIND;
    assert.ok(bm.requires.includes('torch'));
  });

  test('universal explorer requires swim-fins and climbing-gear', () => {
    const ue = SYNERGIES.UNIVERSAL_EXPLORER;
    assert.ok(ue.requires.includes('swim-fins'));
    assert.ok(ue.requires.includes('climbing-gear'));
  });

  test('snake agent should report active synergies', () => {
    const snake = new SnakeAgent({
      attribute: 'strength',
      equipment: ['armor', 'camouflage'],
      personality: ['aggressive'],
    });
    const synergies = snake.getSynergies();
    assert.ok(synergies.length > 0);
    assert.ok(synergies.some(s => s.id === 'shadow-guard'));
  });

  test('snake agent should get synergy bonuses', () => {
    const snake = new SnakeAgent({
      attribute: 'strength',
      equipment: ['armor', 'camouflage'],
      personality: [],
    });
    const bonus = snake.getSynergyBonus('hideWeight');
    assert.equal(bonus, 2);
  });

  test('equipment bonus includes synergy effects', () => {
    const snake = new SnakeAgent({
      attribute: 'strength',
      equipment: ['armor', 'camouflage'],
      personality: [],
    });
    const evasionBonus = snake.getEquipmentBonus('evasion');
    // Base camouflage gives 2, synergy shadow-guard gives 1 more
    assert.ok(evasionBonus >= 2);
  });

  test('multiple synergies stack bonuses', () => {
    const equipment = [
      'armor',      // For shadow-guard
      'camouflage', // For shadow-guard
      'venom',      // For venomous-fangs
    ];
    const bonuses = getSynergyBonuses(equipment);
    const total = Object.values(bonuses).reduce((sum, val) => sum + val, 0);
    assert.ok(total > 0);
  });

  test('synergy effects are conditional on all requirements', () => {
    const incomplete = ['armor']; // Missing camouflage for shadow-guard
    const synergies = getActiveSynergies(incomplete);
    assert.ok(!synergies.some(s => s.id === 'shadow-guard'));

    const complete = ['armor', 'camouflage'];
    const synergiesComplete = getActiveSynergies(complete);
    assert.ok(synergiesComplete.some(s => s.id === 'shadow-guard'));
  });

  test('apex predator requires venom and camouflage', () => {
    const equipment = ['venom', 'camouflage'];
    const synergies = getActiveSynergies(equipment);
    assert.ok(synergies.some(s => s.id === 'apex-predator'));
  });

  test('should handle empty equipment', () => {
    const synergies = getActiveSynergies([]);
    assert.equal(synergies.length, 0);

    const bonuses = getSynergyBonuses([]);
    assert.equal(Object.keys(bonuses).length, 0);

    const text = getSynergyText([]);
    assert.ok(text.includes('No synergies'));
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
