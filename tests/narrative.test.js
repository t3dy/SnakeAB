/**
 * Tests for Growth Mechanic & Narration System
 */

import { strict as assert } from 'assert';
import { SnakeAgent } from '../src/agents/SnakeAgent.js';
import {
  KINDS,
  KIND_NAMES,
  composePredicament,
  composeDeliberation,
  composeResolution,
  composeNarration,
  composeEpitaph,
  composeVictoryCoda,
} from '../src/narrative/Narrator.js';
import { getEncounterDef, ENCOUNTERS } from '../src/encounters/EncounterTypes.js';
import { Simulator } from '../src/sim/Simulator.js';

describe('Snake Growth', () => {
  test('snake starts at length 3', () => {
    const snake = new SnakeAgent({ attribute: 'strength', equipment: [], personality: [] });
    assert.equal(snake.length, 3);
  });

  test('grow() adds a segment', () => {
    const snake = new SnakeAgent({});
    snake.grow();
    snake.grow();
    assert.equal(snake.length, 5);
  });

  test('short snake has no escape penalty', () => {
    const snake = new SnakeAgent({});
    assert.equal(snake.getLengthPenalty(), 0);
    assert.equal(snake.getLengthBonus(), 0);
  });

  test('long snake is penalized fleeing and bonused attacking', () => {
    const snake = new SnakeAgent({});
    for (let i = 0; i < 6; i++) snake.grow(); // length 9
    assert.equal(snake.getLengthPenalty(), 3); // (9-3)/2
    assert.equal(snake.getLengthBonus(), 2);   // (9-3)/3
  });

  test('recordPosition keeps trail as long as the body', () => {
    const snake = new SnakeAgent({});
    snake.recordPosition(1, 1);
    snake.recordPosition(2, 1);
    snake.recordPosition(3, 1);
    snake.recordPosition(4, 1);
    snake.recordPosition(5, 1);
    assert.equal(snake.segments.length, 3); // Capped at length
    assert.deepEqual(snake.segments[0], { x: 5, y: 1 }); // Head first
  });

  test('trail lengthens after growth', () => {
    const snake = new SnakeAgent({});
    snake.grow(); // length 4
    for (let i = 1; i <= 6; i++) snake.recordPosition(i, 1);
    assert.equal(snake.segments.length, 4);
  });

  test('eating in the simulator grows the snake', () => {
    const sim = new Simulator({ attribute: 'strength', equipment: [], personality: ['greedy'] }, 'growth-test', 'easy');
    const startLength = sim.snake.length;
    // Fabricate a food encounter
    sim.currentEncounter = {
      type: 'food',
      entity: { id: 'food-test', type: 'food', kind: 'mouse' },
      position: { x: sim.snake.x, y: sim.snake.y },
      predicament: 'test predicament',
    };
    const outcome = sim.resolveEncounterWithChoice('eat');
    assert.equal(sim.snake.length, startLength + 1);
    assert.ok(outcome.narration, 'outcome should carry narration');
    assert.ok(outcome.narration.resolution.includes('lengthens'), 'resolution should mention growth');
  });
});

describe('Narration Coverage — every contingency has writing', () => {
  const NARRATED_TYPES = ['predator', 'food', 'trap', 'npc', 'hazard', 'medicine', 'treasure'];

  test('every entity type has kinds and every kind has a display name', () => {
    for (const type of NARRATED_TYPES) {
      assert.ok(KINDS[type] && KINDS[type].length > 0, `KINDS missing for ${type}`);
      for (const kind of KINDS[type]) {
        assert.ok(KIND_NAMES[kind], `KIND_NAMES missing for ${kind}`);
      }
    }
  });

  test('every type × kind produces a non-empty predicament', () => {
    const snake = new SnakeAgent({});
    for (const type of NARRATED_TYPES) {
      for (const kind of KINDS[type]) {
        const text = composePredicament(type, kind, snake);
        assert.ok(typeof text === 'string' && text.length > 20, `weak predicament for ${type}/${kind}`);
      }
      // Unknown kind falls back gracefully
      const fallback = composePredicament(type, 'unknown-kind', snake);
      assert.ok(fallback.length > 10, `no fallback predicament for ${type}`);
    }
  });

  test('every encounter option has a deliberation phrase', () => {
    const snake = new SnakeAgent({ personality: ['cautious'] });
    for (const type of NARRATED_TYPES) {
      const def = getEncounterDef(type);
      assert.ok(def, `no encounter def for ${type}`);
      const allIds = def.options.map(o => o.id);
      for (const chosen of allIds) {
        const rejected = allIds.filter(id => id !== chosen);
        const text = composeDeliberation(chosen, rejected, snake);
        assert.ok(text.includes('chose to'), `deliberation for ${type}/${chosen} missing choice`);
        assert.ok(!text.includes('undefined'), `deliberation for ${type}/${chosen} has undefined`);
      }
    }
  });

  test('deliberation names the roads not taken', () => {
    const snake = new SnakeAgent({ personality: ['aggressive'] });
    const text = composeDeliberation('attack', ['flee', 'hide'], snake);
    assert.ok(text.includes('flee for the tall grass'), 'should name the rejected flee option');
    assert.ok(text.includes('strike first'), 'should name the chosen option');
    assert.ok(text.includes('hot blood'), 'should voice the aggressive personality');
  });

  test('deliberation handles a single available option', () => {
    const snake = new SnakeAgent({});
    const text = composeDeliberation('eat', [], snake);
    assert.ok(text.includes('only one road'));
  });

  test('resolution narrates length betrayal on failed escape', () => {
    const snake = new SnakeAgent({});
    for (let i = 0; i < 4; i++) snake.grow(); // Long snake
    const failed = composeResolution(
      { success: false, health: -2, score: 0, text: 'Caught!' },
      'predator', 'flee', snake
    );
    assert.ok(failed.includes('length betrayed you'), 'failed flee should blame length');

    const escaped = composeResolution(
      { success: true, health: 0, score: 5, text: 'Escaped!' },
      'predator', 'flee', snake
    );
    assert.ok(escaped.includes('long body slid clear'), 'successful flee should mention the close call');
  });

  test('short snake resolution has no length commentary', () => {
    const snake = new SnakeAgent({});
    const text = composeResolution(
      { success: false, health: -2, score: 0, text: 'Caught!' },
      'predator', 'flee', snake
    );
    assert.ok(!text.includes('betrayed'));
  });

  test('full narration has all three beats', () => {
    const snake = new SnakeAgent({ personality: ['greedy'] });
    const narration = composeNarration({
      entityType: 'food',
      kind: 'mouse',
      chosenOption: 'eat',
      rejectedOptions: ['save', 'skip'],
      outcome: { success: true, health: 5, score: 10, text: 'Nom!' },
      snake,
    });
    assert.ok(narration.predicament.length > 20);
    assert.ok(narration.deliberation.length > 20);
    assert.ok(narration.resolution.length > 5);
  });

  test('long snake predicament warns about size near predators', () => {
    const snake = new SnakeAgent({});
    for (let i = 0; i < 4; i++) snake.grow();
    const text = composePredicament('predator', 'hawk', snake);
    assert.ok(text.includes('longer now'), 'long snake should sense its vulnerability');
  });

  test('kind-specific resolution overrides generic text on success', () => {
    const snake = new SnakeAgent({});
    const outcome = { success: true, health: 5, score: 10, text: 'generic line' };
    const text = composeResolution(outcome, 'food', 'eat', snake, 'frog');
    assert.ok(!text.startsWith('generic line'), 'frog meal should get frog writing');
    assert.ok(text.includes('🐸'), 'frog resolution should be about the frog');
  });

  test('kind resolution falls back to generic when no pool exists', () => {
    const snake = new SnakeAgent({});
    const outcome = { success: true, health: 0, score: 0, text: 'generic line' };
    const text = composeResolution(outcome, 'food', 'skip', snake, 'frog');
    assert.ok(text.includes('generic line'));
  });
});

describe('Endings — every death named, every victory sung', () => {
  test('every predator, trap, and hazard kind has an epitaph', () => {
    const snake = new SnakeAgent({});
    const killers = [...KINDS.predator, ...KINDS.trap, ...KINDS.hazard, 'burning-ground'];
    for (const kind of killers) {
      const text = composeEpitaph({ type: 'any', kind }, snake, 20);
      assert.ok(text.length > 40, `weak epitaph for ${kind}`);
      assert.ok(text.includes('20 turns'), `epitaph for ${kind} should count the turns`);
      assert.ok(text.includes('3 scales'), `epitaph for ${kind} should measure the body`);
    }
  });

  test('unknown killer falls back to the default epitaph', () => {
    const snake = new SnakeAgent({});
    const text = composeEpitaph(null, snake, 5);
    assert.ok(text.includes('story ends') || text.includes('ended here'));
  });

  test('victory coda mentions length and turns', () => {
    const snake = new SnakeAgent({});
    snake.grow();
    const text = composeVictoryCoda(snake, 42);
    assert.ok(text.includes('4 scales long'));
    assert.ok(text.includes('42 turns'));
  });

  test('simulator composes an epitaph on encounter death', () => {
    const sim = new Simulator({ attribute: 'strength', equipment: [], personality: [] }, 'epitaph-test', 'easy');
    sim.snake.health = 1; // One hit from death
    sim.currentEncounter = {
      type: 'trap',
      entity: { id: 'trap-test', type: 'trap', kind: 'snare' },
      position: { x: sim.snake.x, y: sim.snake.y },
      predicament: 'test',
    };
    sim.resolveEncounterWithChoice('take-damage'); // -4 health, guaranteed death
    assert.ok(sim.gameOver);
    assert.ok(sim.epitaph, 'death should compose an epitaph');
    assert.ok(sim.epitaph.includes('wire'), 'snare death should mention the wire');
    assert.ok(sim.getRunResult().epitaph === sim.epitaph);
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
