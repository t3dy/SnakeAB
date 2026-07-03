/**
 * Narrator — Composes detailed encounter narration
 * Phase 5: The snake's world, told from the grass.
 *
 * Every encounter produces three beats:
 *   1. Predicament — the situation the snake finds itself in
 *   2. Deliberation — the choice it made, and the choices it didn't
 *   3. Resolution — how it worked out, and what it cost or won
 */

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ------------------------------------------------------------------ */
/* Entity kinds — the cast of a snake's world                          */
/* ------------------------------------------------------------------ */

export const KINDS = {
  predator: ['hawk', 'fox', 'heron', 'badger'],
  food: ['mouse', 'frog', 'eggs', 'cricket'],
  trap: ['snare', 'sap', 'rockfall'],
  npc: ['rat-snake', 'garter', 'elder'],
  hazard: ['fire', 'marsh', 'scree'],
  medicine: ['basking-rock'],
  treasure: ['hoard'],
};

export const KIND_NAMES = {
  hawk: 'a red-tailed hawk',
  fox: 'a lean fox',
  heron: 'a grey heron',
  badger: 'a scarred badger',
  mouse: 'a field mouse',
  frog: 'a fat marsh frog',
  eggs: 'an unguarded clutch of eggs',
  cricket: 'a chorus of crickets',
  snare: 'a wire snare',
  sap: 'a spill of sticky pine sap',
  rockfall: 'a shelf of loose stones',
  'rat-snake': 'an old rat snake',
  garter: 'a quick little garter snake',
  elder: 'an ancient serpent, pale with many sheddings',
  fire: 'a creeping brushfire',
  marsh: 'a stretch of sucking marsh gas',
  scree: 'a slope of sun-scorched scree',
  'basking-rock': 'a flat stone still warm with the day\'s sun',
  hoard: 'a magpie\'s abandoned hoard',
};

/* ------------------------------------------------------------------ */
/* Predicaments — the situation, told before anything is decided       */
/* ------------------------------------------------------------------ */

const PREDICAMENTS = {
  predator: {
    hawk: [
      'A shadow sweeps across the grass — wings spread wide against the sun. A red-tailed hawk has marked you from above, and there is precious little cover here.',
      'The crickets go silent. That is always the first warning. Then the hawk\'s cry splits the sky, and you know you have been seen.',
    ],
    fox: [
      'A lean fox freezes mid-step on the trail ahead, one paw raised, black eyes fixed on the taper of your tail. It has dug snakes out of softer ground than this.',
      'You taste fox on the air a heartbeat too late. It is already circling, patient, cutting off the line back to the tall grass.',
    ],
    heron: [
      'The water ahead is glass-still — too still. A grey heron stands motionless in the shallows, spear-beak cocked. Herons swallow snakes whole.',
      'One yellow eye swivels toward you. The heron does not move. It does not need to. It is faster than it looks, and it knows it.',
    ],
    badger: [
      'The ground trembles with digging. A scarred badger backs out of a burrow mouth, snout dusted with earth, and catches your scent. Badgers do not fear venom.',
      'A badger blocks the path, low and wide and utterly unafraid. Its kind eat rattlesnakes for sport.',
    ],
    default: [
      'Something hungry has found you. The grass whispers with its approach, and every scale on your body knows what comes next.',
    ],
  },
  food: {
    mouse: [
      'A field mouse works a seed head at the edge of the runway, whiskers trembling, upwind and oblivious. Your tongue reads its warmth on the air.',
      'Fresh mouse-scent threads the grass — close, careless, fat with summer grain.',
    ],
    frog: [
      'A marsh frog sits half-sunk at the water\'s edge, throat pulsing. One strike and it would be yours — if you are quicker than its leap.',
      'You feel the frog before you see it: a plump heartbeat in the mud, dreaming of flies.',
    ],
    eggs: [
      'A ground-nest, unguarded — the parent bird flushed at your approach. The eggs lie warm and speckled in their cup of grass.',
      'The scent of yolk seeps from a hidden clutch. Eggs cannot run. But their owner may come back angry.',
    ],
    cricket: [
      'Crickets sing in the thatch, small and quick and barely a mouthful — but a mouthful is a mouthful.',
      'The thatch crawls with crickets. Not a feast. But no snake starved on caution alone.',
    ],
    default: [
      'Prey. Close. Your tongue flickers, tasting the shape of it on the air.',
    ],
  },
  trap: {
    snare: [
      'A glint of wire in the leaf litter — a snare, set for rabbits, just as happy to close on a snake. It lies square across your path.',
      'You freeze. A loop of wire hangs a scale\'s breadth from your snout, anchored to a bent sapling. Someone hunts this trail.',
    ],
    sap: [
      'The pine above has bled a wide slick of sap across the stones. It smells of resin and old bones — things have stuck here before.',
      'A river of hardened amber crosses the trail — pine sap, still tacky at the center. It would hold you like a fly.',
    ],
    rockfall: [
      'The slope ahead is a shelf of loose stones, balanced on nothing. One wrong ripple of your body could bring the whole face down.',
      'Scree, stacked and treacherous. You can feel the stones\' unrest through your belly scales.',
    ],
    default: [
      'The path ahead is wrong — a danger set into the ground itself, waiting for a careless body.',
    ],
  },
  npc: {
    'rat-snake': [
      'An old rat snake lies looped over a deadfall, tongue idling. He has grown fat and calm in this territory, and he watches you with something like amusement.',
      'The rat snake tastes your approach long before you arrive. "Traveler," his posture says. He does not move from the warm wood.',
    ],
    garter: [
      'A little garter snake ribbons out of the weeds, quick and bright. Too small to fear, too fast to catch — and full of gossip about the trail ahead.',
      'A garter snake pauses, mid-slither. Small, striped, and quivering with news, the way the little ones always are.',
    ],
    elder: [
      'In the hollow of a dead oak coils something pale — an ancient serpent, its scales clouded with the ghosts of a hundred sheddings. It knew this land before the rivers turned.',
      'The elder serpent does not open its milky eyes. "I heard you coming three fields away," its stillness says. "Sit, if you like."',
    ],
    default: [
      'Another of your kind shares the trail — neither prey nor predator, which makes it the rarest thing in the grass.',
    ],
  },
  hazard: {
    fire: [
      'Smoke crawls low through the grass stems. Somewhere upwind, a brushfire is eating the field, and the wind is deciding whose side it is on.',
      'Heat shimmers over the trail ahead. Fire — the one hunter that cannot be bitten, dodged, or charmed.',
    ],
    marsh: [
      'The ground ahead goes soft and sour. Marsh gas beads up through black mud that would swallow a snake and keep it.',
      'Bubbles rise and burst on the black water. The marsh is patient. It has eaten faster things than you.',
    ],
    scree: [
      'The trail crosses a slope of scorched scree — stone hot enough to sear belly scales, with no shade for a body-length in any direction.',
      'Sun-blasted rock stretches ahead, shimmering. Crossing it will cost you; the sun does not haggle.',
    ],
    default: [
      'The land itself turns hostile here — no teeth, no talons, just a patient danger that outlasts everything.',
    ],
  },
  medicine: {
    'basking-rock': [
      'A flat stone catches the last of the sun, radiating stored warmth. A basking spot like this can knit a battered body back together.',
      'Warmth rises off a sun-soaked stone — the deep, healing warmth that reaches all the way to the spine.',
    ],
    default: [
      'A place of rest presents itself — warmth and stillness, rare currencies in the grass.',
    ],
  },
  treasure: {
    hoard: [
      'A magpie\'s hoard spills from a fallen nest: bottle glass, a ring, foil that blazes like a second sun. Worthless to a snake — and yet the shine calls to something older than sense.',
      'Glitter in the roots — a dead magpie\'s trove. No snake needs treasure. But the shine, oh, the shine.',
    ],
    default: [
      'Something glitters where nothing should. The shine of it pulls at you.',
    ],
  },
};

/* ------------------------------------------------------------------ */
/* Kind-specific resolutions — the same choice lands differently       */
/* depending on who or what was in the grass                           */
/* ------------------------------------------------------------------ */

const RESOLUTION_FLAVOR = {
  'mouse:eat': [
    '🐭 The mouse never finished its seed. One strike, a slow swallow, and the field is quieter by one heartbeat.',
    '🐭 Warm, quick, and gone. The mouse goes down the way mice always have.',
  ],
  'frog:eat': [
    '🐸 The frog leapt — a half-beat too late. It goes down still kicking, cool and slick.',
    '🐸 Mud, then muscle, then stillness. The marsh frog is yours.',
  ],
  'eggs:eat': [
    '🥚 One by one the eggs go down whole, warm with the ghost of the mother\'s breast. Somewhere above, a bird screams at an empty nest.',
    '🥚 You crush the shells against your spine as they slide down. Rich yolk. Easy living. The parent will grieve loudly and briefly, as birds do.',
  ],
  'cricket:eat': [
    '🦗 A snap, a crunch, a mouthful of song. Barely worth the pause — but the road is long.',
    '🦗 The chorus scatters. You catch one mid-leap. The rest sing on as if nothing happened; for them, nothing did.',
  ],
  'rat-snake:talk': [
    '🐍 The old rat snake shares what he knows: which burrows are empty, which shadows have wings. Solid, unhurried wisdom from a life spent not dying.',
    '🐍 "Stay off the open ground at dusk," the rat snake advises. "The hawk hunts late this season." Good counsel, freely given.',
  ],
  'garter:talk': [
    '🐍 The garter snake talks fast and mostly nonsense — but buried in the babble: a fox has been digging along the north trail. Worth knowing.',
    '🐍 Gossip pours out of the little garter like water: who got eaten, who shed badly, where the frogs are fat. You slither on, better informed.',
  ],
  'elder:talk': [
    '🐍 The elder speaks slowly, as if each word costs a scale. "The goal you seek is real. I saw it once, when my eyes still saw." You believe it.',
    '🐍 "Length is not wisdom," the pale one murmurs, "but it is reach." You leave the hollow feeling older and slightly wiser.',
  ],
  'rat-snake:trade': [
    '🐍 You trade the rat snake your news for his: a fair exchange between honest serpents. He points you toward easier ground.',
  ],
  'garter:trade': [
    '🐍 The garter trades you a shortcut for a story. The little ones always want stories.',
  ],
  'elder:trade': [
    '🐍 The elder takes nothing and gives you a blessing older than the field. Whatever it is worth, it weighs nothing to carry.',
  ],
  'basking-rock:use': [
    '☀️ You pour yourself across the warm stone and let the heat reach down to the spine. Old aches loosen. The body remembers how to be whole.',
    '☀️ An hour of stored sunlight, belly-down on good granite. This is the oldest medicine there is.',
  ],
  'basking-rock:ration': [
    '☀️ A short bask — enough to take the edge off the cold and the pain, not enough to grow careless. The sun will rise again tomorrow.',
  ],
  'hoard:take-all': [
    '✨ You thread yourself through the glitter and claim all of it, dragging what you can. Senseless. Magnificent. The magpie would have understood.',
  ],
  'hoard:choose': [
    '✨ You coil past the foil and glass and take only the true shine — the ring, smooth and cold and old. A discerning serpent. A dragon in miniature.',
  ],
};

/* ------------------------------------------------------------------ */
/* Option phrases — how each choice reads in prose                     */
/* ------------------------------------------------------------------ */

const OPTION_PHRASES = {
  attack: 'strike first',
  flee: 'flee for the tall grass',
  hide: 'hold still and trust its scales',
  'stand-ground': 'coil and stand its ground',
  eat: 'take the meal',
  save: 'cache the kill for leaner days',
  skip: 'pass the meal by',
  use: 'stretch out and bask',
  ration: 'bask only briefly',
  ignore: 'keep moving',
  disarm: 'work the danger loose with patient care',
  escape: 'dart through the gap',
  'take-damage': 'push straight through and pay the price',
  talk: 'flick its tongue in greeting',
  trade: 'bargain',
  'take-all': 'seize all of it',
  choose: 'pick over the shine with a careful eye',
  leave: 'leave the glitter to the dead',
  'push-through': 'push straight through',
  detour: 'circle wide around',
  wait: 'wait it out',
};

/* Personality voices — why the snake chose what it chose */
const PERSONALITY_REASONS = {
  aggressive: 'the hot blood in it sang for the fight',
  cautious: 'caution has kept this snake alive through every season so far',
  greedy: 'hunger rules this snake, and hunger does not negotiate',
  fearful: 'fear moves faster than thought, and fear said go',
  curious: 'curiosity pulled it forward like a scent on the wind',
  calculating: 'it weighed every path twice before its body moved',
};

/* ------------------------------------------------------------------ */
/* Composition                                                         */
/* ------------------------------------------------------------------ */

/**
 * The situation, before any choice is made
 */
export function composePredicament(entityType, kind, snake) {
  const pools = PREDICAMENTS[entityType];
  if (!pools) return 'Something stirs in the grass ahead.';

  const pool = pools[kind] || pools.default || Object.values(pools)[0];
  let text = pick(pool);

  // Length-aware tension for predators
  if (entityType === 'predator' && snake && snake.getLengthPenalty && snake.getLengthPenalty() > 0) {
    text += ' You are longer now than you once were — a bigger meal, and a slower one.';
  }

  // Low health desperation
  if (snake && snake.maxHealth && snake.health / snake.maxHealth <= 0.3) {
    text += ' Your wounds ache. There is not much fight left in this body.';
  }

  return text;
}

/**
 * The choice made, told against the choices refused
 */
export function composeDeliberation(chosenOption, rejectedOptions, snake) {
  const chosenPhrase = OPTION_PHRASES[chosenOption] || chosenOption;

  // Name up to two roads not taken
  const rejectedPhrases = (rejectedOptions || [])
    .filter(id => id !== chosenOption)
    .slice(0, 2)
    .map(id => OPTION_PHRASES[id] || id);

  // Why: first matching personality voice, else instinct
  let reason = 'instinct decided, the way it always does';
  if (snake && snake.personality) {
    for (const trait of snake.personality) {
      if (PERSONALITY_REASONS[trait]) {
        reason = PERSONALITY_REASONS[trait];
        break;
      }
    }
  }

  if (rejectedPhrases.length === 0) {
    return `There was only one road: the snake chose to ${chosenPhrase}.`;
  }

  const rejectedText = rejectedPhrases.length === 2
    ? `${rejectedPhrases[0]}, or ${rejectedPhrases[1]}`
    : rejectedPhrases[0];

  return `It could have chosen to ${rejectedText} — but ${reason}. The snake chose to ${chosenPhrase}.`;
}

/**
 * How it worked out — builds on the outcome's flavor line and adds
 * consequences: growth from eating, the cost of length in a chase.
 * Kind-specific writing takes over when it exists (a frog goes down
 * differently than a clutch of eggs).
 */
export function composeResolution(outcome, entityType, chosenOption, snake, kind = null) {
  let text = outcome.text || '';

  // Kind-specific resolution writing replaces the generic line
  if (kind && outcome.success !== false) {
    const pool = RESOLUTION_FLAVOR[`${kind}:${chosenOption}`];
    if (pool) {
      text = pick(pool);
    }
  }

  const parts = [];
  if (outcome.health > 0) parts.push(`+${outcome.health} health`);
  if (outcome.health < 0) parts.push(`${outcome.health} health`);
  if (outcome.score > 0) parts.push(`+${outcome.score} score`);
  if (parts.length > 0) {
    text += ` (${parts.join(', ')})`;
  }

  // Growth consequence
  if (entityType === 'food' && chosenOption === 'eat') {
    text += ` The meal settles in, and your body lengthens by a segment — you are ${snake ? snake.length : 'a segment'} scales long now. More reach. More to hide.`;
  }

  // Length consequence on escape attempts
  if ((chosenOption === 'flee' || chosenOption === 'hide') && snake && snake.getLengthPenalty && snake.getLengthPenalty() > 0) {
    if (outcome.success) {
      text += ' Your long body slid clear — barely. A younger, shorter snake would have laughed at this.';
    } else {
      text += ' Your own length betrayed you: too much tail to tuck away, too much body to turn at speed.';
    }
  }

  // Length advantage in a fight
  if ((chosenOption === 'attack' || chosenOption === 'stand-ground') && snake && snake.getLengthBonus && snake.getLengthBonus() > 0 && outcome.success) {
    text += ' Your size told: a snake of your length is no easy meal, and the grass knows it now.';
  }

  return text;
}

/**
 * Full three-beat narration for a resolved encounter
 */
export function composeNarration({ entityType, kind, chosenOption, rejectedOptions, outcome, snake, predicament }) {
  return {
    predicament: predicament || composePredicament(entityType, kind, snake),
    deliberation: composeDeliberation(chosenOption, rejectedOptions, snake),
    resolution: composeResolution(outcome, entityType, chosenOption, snake, kind),
  };
}

/* ------------------------------------------------------------------ */
/* Endings — every death named, every victory sung                     */
/* ------------------------------------------------------------------ */

const EPITAPHS = {
  hawk: [
    'The hawk rose with a heavier shadow than it came with. The field will not remember, but the crickets sang louder that evening.',
    'Taken skyward, as so many of your kind before you. Somewhere between the grass and the clouds, the story ends.',
  ],
  fox: [
    'The fox dug well and dined better. Every trail ends somewhere; yours ends at a burrow mouth, in patient black eyes.',
  ],
  heron: [
    'The heron barely moved. That was always the trick of it. The shallows are glass-still again, and fuller by one snake.',
  ],
  badger: [
    'The badger did not fear the venom, and in the end it did not need to. They eat rattlesnakes for sport, and you were no rattlesnake.',
  ],
  snare: [
    'The wire closed and held. The one who set it will find more than a rabbit — and understand nothing of the journey it ended.',
  ],
  sap: [
    'The sap held you the way it held the beetles and the seasons: completely, and without malice. Amber keeps what it takes.',
  ],
  rockfall: [
    'The stones came down as stones do — all at once, after ages of waiting. The slope is still now. It can afford to be.',
  ],
  fire: [
    'The fire was the one hunter you could not read, dodge, or charm. It took the field, and it took you with it.',
  ],
  marsh: [
    'The marsh was patient, as promised. It has eaten faster things than you, and now it has eaten you too.',
  ],
  scree: [
    'The scorched stones took their toll a scale at a time until there were no scales left to give.',
  ],
  'burning-ground': [
    'The burning ground asked a price for every length crossed, and in the end the price was everything.',
    'You crossed one hazard too many. The ground does not haggle, and today it collected in full.',
  ],
  default: [
    'The grass closes over the trail. Every snake\'s story ends mid-journey; yours ended here.',
  ],
};

const VICTORY_CODAS = [
  'The goal at last — warm stone, safe hollow, the end of the long trail. You coil once around your own length and rest. You have earned the sun.',
  'You arrive as every survivor arrives: scarred, longer, and quietly certain the journey was worth the skin it cost.',
  'The trail ends where the old serpent said it would. Behind you: the hawk\'s shadow, the fox\'s patience, the patient marsh. Ahead: rest. You made it.',
];

/**
 * Narrate the snake's death, named for what killed it
 */
export function composeEpitaph(threat, snake, turns) {
  const kind = threat && threat.kind;
  const pool = EPITAPHS[kind] || EPITAPHS.default;
  let text = pick(pool);

  const length = snake ? snake.length : 3;
  text += ` It had grown ${length} scales long and survived ${turns} turns.`;
  return text;
}

/**
 * Narrate the snake's victory
 */
export function composeVictoryCoda(snake, turns) {
  let text = pick(VICTORY_CODAS);
  const length = snake ? snake.length : 3;
  text += ` ${length} scales long, ${turns} turns on the trail.`;
  return text;
}
