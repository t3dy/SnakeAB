/**
 * Tests for Encounter System
 */

import { strict as assert } from 'assert';
import { SnakeAgent } from '../src/agents/SnakeAgent.js';
import {
  ENCOUNTERS,
  FOOD_ENCOUNTER,
  MEDICINE_ENCOUNTER,
  TREASURE_ENCOUNTER,
  PREDATOR_ENCOUNTER,
  isOptionAvailable,
  getEncounterDef,
} from '../src/encounters/EncounterTypes.js';
import { EncounterResolver } from '../src/encounters/EncounterResolver.js';

describe('Encounter Types', () => {
  test('should define all encounter types', () => {
    assert.ok(ENCOUNTERS.FOOD);
    assert.ok(ENCOUNTERS.PREDATOR);
    assert.ok(ENCOUNTERS.TRAP);
    assert.ok(ENCOUNTERS.NPC);
    assert.ok(ENCOUNTERS.HAZARD);
  });

  test('should get encounter definition by type', () => {
    const foodDef = getEncounterDef(ENCOUNTERS.FOOD);
    assert.equal(foodDef.type, ENCOUNTERS.FOOD);
    assert.ok(foodDef.options.length > 0);

    const predatorDef = getEncounterDef(ENCOUNTERS.PREDATOR);
    assert.equal(predatorDef.type, ENCOUNTERS.PREDATOR);
    assert.ok(predatorDef.options.length > 0);
  });

  test('food encounter should have eat, save, and skip options', () => {
    assert.equal(FOOD_ENCOUNTER.options.length, 3);
    assert.ok(FOOD_ENCOUNTER.options.some(o => o.id === 'eat'));
    assert.ok(FOOD_ENCOUNTER.options.some(o => o.id === 'save'));
    assert.ok(FOOD_ENCOUNTER.options.some(o => o.id === 'skip'));
  });

  test('predator encounter should have multiple options', () => {
    assert.ok(PREDATOR_ENCOUNTER.options.length >= 3);
    assert.ok(PREDATOR_ENCOUNTER.options.some(o => o.id === 'attack'));
    assert.ok(PREDATOR_ENCOUNTER.options.some(o => o.id === 'flee'));
    assert.ok(PREDATOR_ENCOUNTER.options.some(o => o.id === 'hide'));
  });
});

describe('Option Availability', () => {
  test('food options should always be available', () => {
    const snake = new SnakeAgent({ attribute: 'strength', equipment: [], personality: [] });

    const eatOption = FOOD_ENCOUNTER.options[0];
    assert.equal(isOptionAvailable(eatOption, snake), true);
  });

  test('hide option should require equipment or intelligence', () => {
    const snakeNoEquip = new SnakeAgent({
      attribute: 'strength',
      equipment: [],
      personality: [],
    });

    const hideOption = PREDATOR_ENCOUNTER.options.find(o => o.id === 'hide');
    assert.equal(isOptionAvailable(hideOption, snakeNoEquip), false);

    const snakeWithCamo = new SnakeAgent({
      attribute: 'strength',
      equipment: ['camouflage'],
      personality: [],
    });
    assert.equal(isOptionAvailable(hideOption, snakeWithCamo), true);
  });

  test('should filter available options based on equipment', () => {
    const snakeNoCamo = new SnakeAgent({
      attribute: 'strength',
      equipment: [],
      personality: [],
    });

    const available = PREDATOR_ENCOUNTER.options.filter(o => isOptionAvailable(o, snakeNoCamo));
    // Should have attack, flee, stand-ground (not hide without equipment)
    assert.ok(available.length >= 3);
    assert.ok(!available.some(o => o.id === 'hide'));
  });
});

describe('EncounterResolver', () => {
  test('should get available options', () => {
    const snake = new SnakeAgent({
      attribute: 'strength',
      equipment: [],
      personality: [],
    });

    const options = EncounterResolver.getAvailableOptions(ENCOUNTERS.FOOD, snake);
    assert.equal(options.length, 3); // eat, save, and skip

    const predatorOptions = EncounterResolver.getAvailableOptions(ENCOUNTERS.PREDATOR, snake);
    assert.ok(predatorOptions.length >= 3);
  });

  test('should decide action based on personality', () => {
    const aggSnake = new SnakeAgent({
      attribute: 'strength',
      equipment: [],
      personality: ['aggressive'],
    });

    // Run multiple times to get a sense of personality bias
    const decisions = [];
    for (let i = 0; i < 20; i++) {
      const decision = EncounterResolver.decideAction(ENCOUNTERS.PREDATOR, aggSnake);
      decisions.push(decision);
    }

    // Aggressive snake should favor attack
    const attackCount = decisions.filter(d => d === 'attack').length;
    assert.ok(attackCount > 5); // Should attack more than 25% of the time
  });

  test('cautious snake should prefer fleeing', () => {
    const cautSnake = new SnakeAgent({
      attribute: 'strength',
      equipment: [],
      personality: ['cautious'],
    });

    const decisions = [];
    for (let i = 0; i < 20; i++) {
      const decision = EncounterResolver.decideAction(ENCOUNTERS.PREDATOR, cautSnake);
      decisions.push(decision);
    }

    // Cautious snake should favor flee/hide
    const fleeCount = decisions.filter(d => d === 'flee').length;
    assert.ok(fleeCount > 5);
  });

  test('should resolve food encounter', () => {
    const snake = new SnakeAgent({
      attribute: 'strength',
      equipment: [],
      personality: [],
    });

    const outcome = EncounterResolver.resolveOutcome(ENCOUNTERS.FOOD, snake, 'eat');
    assert.ok(outcome.success);
    assert.equal(outcome.health, 5);
    assert.equal(outcome.score, 10);
  });

  test('should resolve predator encounter with checks', () => {
    const snake = new SnakeAgent({
      attribute: 'strength',
      equipment: [],
      personality: [],
    });

    // Attack option
    const outcome = EncounterResolver.resolveOutcome(ENCOUNTERS.PREDATOR, snake, 'attack');
    assert.ok(outcome.health !== undefined);
    assert.ok(outcome.score !== undefined);
    assert.ok(outcome.text);
  });

  test('full resolution should update snake history', () => {
    const snake = new SnakeAgent({
      attribute: 'strength',
      equipment: [],
      personality: [],
    });

    assert.equal(Object.keys(snake.encounterHistory).length, 0);

    EncounterResolver.resolveEncounter(ENCOUNTERS.FOOD, snake);

    assert.ok(snake.encounterHistory['food-encounter']);
  });

  test('should apply personality-weighted decisions', () => {
    const greedySnake = new SnakeAgent({
      attribute: 'strength',
      equipment: [],
      personality: ['greedy'],
    });

    const decisions = [];
    for (let i = 0; i < 10; i++) {
      const decision = EncounterResolver.decideAction(ENCOUNTERS.FOOD, greedySnake);
      decisions.push(decision);
    }

    // Greedy snake should favor eating/gathering (eat or save)
    const resourceCount = decisions.filter(d => d === 'eat' || d === 'save').length;
    assert.ok(resourceCount >= 7); // Should gather resources most of the time
  });
});

describe('Encounter Integration', () => {
  test('should handle full encounter resolution flow', () => {
    const snake = new SnakeAgent({
      attribute: 'strength',
      equipment: ['camouflage'],
      personality: ['cautious'],
    });

    const initialHealth = snake.health;
    const resolution = EncounterResolver.resolveEncounter(ENCOUNTERS.PREDATOR, snake);

    assert.ok(resolution.chosenOption);
    assert.ok(resolution.outcome);
    assert.ok(resolution.statDelta);

    // Snake history should be updated
    assert.ok(snake.encounterHistory['predator-encounter']);
  });

  test('should handle food encounter without checks', () => {
    const snake = new SnakeAgent({
      attribute: 'strength',
      equipment: [],
      personality: [],
    });

    const resolution = EncounterResolver.resolveEncounter(ENCOUNTERS.FOOD, snake);

    assert.ok(resolution.chosenOption);
    assert.ok(resolution.statDelta);
    // Food encounter returns health and score on success
    if (resolution.chosenOption === 'eat') {
      assert.equal(resolution.statDelta.health, 5);
      assert.equal(resolution.statDelta.score, 10);
    } else if (resolution.chosenOption === 'skip') {
      assert.equal(resolution.statDelta.health, 0);
      assert.equal(resolution.statDelta.score, 0);
    }
  });

  test('should handle hazard encounter', () => {
    const snake = new SnakeAgent({
      attribute: 'strength',
      equipment: [],
      personality: [],
    });

    const resolution = EncounterResolver.resolveEncounter(ENCOUNTERS.HAZARD, snake);

    assert.ok(resolution.chosenOption);
    assert.ok(resolution.outcome);
  });
});

describe('Medicine & Treasure Encounters', () => {
  test('should define medicine encounter', () => {
    assert.equal(MEDICINE_ENCOUNTER.type, ENCOUNTERS.MEDICINE);
    assert.ok(MEDICINE_ENCOUNTER.options.length > 0);
    assert.ok(MEDICINE_ENCOUNTER.outcomes);
  });

  test('should define treasure encounter', () => {
    assert.equal(TREASURE_ENCOUNTER.type, ENCOUNTERS.TREASURE);
    assert.ok(TREASURE_ENCOUNTER.options.length > 0);
    assert.ok(TREASURE_ENCOUNTER.outcomes);
  });

  test('medicine encounter should have use, ration, and ignore options', () => {
    assert.equal(MEDICINE_ENCOUNTER.options.length, 3);
    assert.ok(MEDICINE_ENCOUNTER.options.some(o => o.id === 'use'));
    assert.ok(MEDICINE_ENCOUNTER.options.some(o => o.id === 'ration'));
    assert.ok(MEDICINE_ENCOUNTER.options.some(o => o.id === 'ignore'));
  });

  test('treasure encounter should have take-all, choose, and leave options', () => {
    assert.equal(TREASURE_ENCOUNTER.options.length, 3);
    assert.ok(TREASURE_ENCOUNTER.options.some(o => o.id === 'take-all'));
    assert.ok(TREASURE_ENCOUNTER.options.some(o => o.id === 'choose'));
    assert.ok(TREASURE_ENCOUNTER.options.some(o => o.id === 'leave'));
  });

  test('medicine outcomes should restore health', () => {
    assert.ok(MEDICINE_ENCOUNTER.outcomes.use.health > 0);
    assert.ok(MEDICINE_ENCOUNTER.outcomes.ration.health > 0);
    assert.equal(MEDICINE_ENCOUNTER.outcomes.ignore.health, 0);
  });

  test('treasure outcomes should provide score', () => {
    assert.ok(MEDICINE_ENCOUNTER.outcomes.use.text);
    assert.ok(TREASURE_ENCOUNTER.outcomes['take-all'].score > 0);
    assert.ok(TREASURE_ENCOUNTER.outcomes.choose.score > TREASURE_ENCOUNTER.outcomes['take-all'].score);
  });

  test('get encounter def for medicine', () => {
    const medicineDef = getEncounterDef(ENCOUNTERS.MEDICINE);
    assert.equal(medicineDef.type, ENCOUNTERS.MEDICINE);
  });

  test('get encounter def for treasure', () => {
    const treasureDef = getEncounterDef(ENCOUNTERS.TREASURE);
    assert.equal(treasureDef.type, ENCOUNTERS.TREASURE);
  });

  test('treasure choose option requires intelligence', () => {
    const chooseDef = TREASURE_ENCOUNTER.options.find(o => o.id === 'choose');
    assert.ok(chooseDef.requirements);
    assert.ok(chooseDef.requirements.statCheck === 'intelligence');
  });

  test('medicine encounter resolver should resolve use outcome', () => {
    const snake = new SnakeAgent({ attribute: 'strength', equipment: [], personality: [] });
    const resolution = EncounterResolver.resolveEncounter(ENCOUNTERS.MEDICINE, snake);
    assert.ok(resolution.chosenOption);
    assert.ok(resolution.outcome);
    assert.ok(resolution.statDelta);
  });

  test('treasure encounter resolver should resolve take-all outcome', () => {
    const snake = new SnakeAgent({ attribute: 'strength', equipment: [], personality: [] });
    const resolution = EncounterResolver.resolveEncounter(ENCOUNTERS.TREASURE, snake);
    assert.ok(resolution.chosenOption);
    assert.ok(resolution.outcome);
    assert.ok(resolution.statDelta);
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
