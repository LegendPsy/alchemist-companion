import test from 'node:test';
import assert from 'node:assert/strict';
import { mod, limits, defaultState, available, spend, longRest, validate, cast, restoreState } from '../rules.js';
import { SPELLS, INFUSIONS } from '../data.js';

const spell = id => SPELLS.find(s => s.id === id);
function ready(level = 5, intelligence = 16) {
  const s = defaultState();
  s.configured = true;
  Object.assign(s.character, {
    level, skills: ['arcana', 'investigation'],
    cantrips: ['fire-bolt', 'guidance'],
    prepared: ['cure-wounds', 'detect-magic', 'web'],
    known: ['enhanced-focus', 'enhanced-defense', 'mind-sharpener', 'homunculus',
      ...(level >= 6 ? ['spell-refueling-ring', 'radiant-weapon'] : [])],
    active: ['mind-sharpener'],
  });
  s.character.abilities = { str: 10, dex: 14, con: 14, int: intelligence, wis: 12, cha: 8 };
  return s;
}

test('first launch and full reset state are completely blank, with no saved character choices or history', () => {
  const fresh = defaultState();
  assert.equal(fresh.configured, false);
  assert.equal(fresh.character.name, '');
  assert.equal(fresh.character.level, 5);
  assert.deepEqual(fresh.character.abilities, {str:null,dex:null,con:null,int:null,wis:null,cha:null});
  for(const key of ['skills','cantrips','prepared','known','active']) assert.deepEqual(fresh.character[key], []);
  assert.equal(fresh.character.notes, '');
  assert.deepEqual(fresh.spent, {slots:[0,0],elixirs:0,genius:0,infusions:{}});
  assert.equal(fresh.concentration, null);
  assert.deepEqual(fresh.log, []);
  assert.equal(fresh.updatedAt, null);
  assert.deepEqual(restoreState(JSON.parse(JSON.stringify(fresh)), SPELLS, INFUSIONS), fresh);
});

test('partially entered attributes can be resumed but are rejected when a character is finalized', () => {
  const draft = defaultState();
  draft.character.name = 'Боба алхимик';
  draft.character.abilities.int = 18;
  const restored = restoreState(JSON.parse(JSON.stringify(draft)), SPELLS, INFUSIONS);
  assert.equal(restored.character.abilities.int, 18);
  assert.equal(restored.character.abilities.str, null);
  assert.ok(validate(restored.character, SPELLS, INFUSIONS).length > 0);
  draft.configured = true;
  assert.throws(() => restoreState(draft, SPELLS, INFUSIONS));
});

test('finishing character setup does not require class skills after removing their UI', () => {
  for (const level of [5, 6, 7]) {
    const s = ready(level);
    s.character.skills = [];
    assert.deepEqual(validate(s.character, SPELLS, INFUSIONS), []);
    const restored = restoreState(JSON.parse(JSON.stringify(s)), SPELLS, INFUSIONS);
    assert.equal(restored.configured, true);
    assert.deepEqual(restored.character.skills, []);
  }
});

test('2014 artificer level boundaries: slots, preparation, infusions and subclass features', () => {
  const expected = {
    5: { slots: [4, 2], prepared: 5, known: 4, active: 2, elixirs: 1, genius: 0 },
    6: { slots: [4, 2], prepared: 6, known: 6, active: 3, elixirs: 2, genius: 0 },
    7: { slots: [4, 3], prepared: 6, known: 6, active: 3, elixirs: 2, genius: 3 },
  };
  for (const level of [5, 6, 7]) {
    const s = ready(level), l = limits(s.character);
    for (const [key, value] of Object.entries(expected[level])) assert.deepEqual(l[key], value, `level ${level}: ${key}`);
    assert.equal(l.cantrips, 2);
    assert.equal(l.attack, 6);
    assert.equal(l.dc, 14);
    assert.equal(l.savant, 3);
    assert.deepEqual(validate(s.character, SPELLS, INFUSIONS), []);
  }
});

test('negative modifiers round down; preparation and ability uses have minimum one', () => {
  assert.equal(mod(9), -1);
  assert.equal(mod(7), -2);
  const c = ready(7, 3).character;
  const l = limits(c);
  assert.equal(l.prepared, 1);
  assert.equal(l.genius, 1);
  assert.equal(l.savant, 1);
  assert.equal(l.attack, -1);
  assert.equal(l.dc, 7);
  // Minimum applies to Flash uses, not its actual INT bonus (-4).
  assert.equal(mod(c.abilities.int), -4);
});

test('catalogue contains the complete Tasha 2014 level 0–2 selection without UA/later additions', () => {
  assert.deepEqual([0, 1, 2].map(level => SPELLS.filter(s => s.level === level && !s.always).length), [23, 18, 21]);
  assert.deepEqual(SPELLS.filter(s => s.always).map(s => s.id).sort(), ['flaming-sphere', 'healing-word', 'melfs-acid-arrow', 'ray-of-sickness'].sort());
  assert.equal(new Set(SPELLS.map(s => s.id)).size, SPELLS.length);
  for (const id of ['arcane-weapon', 'air-bubble', 'vortex-warp', 'kinetic-jaunt']) assert.equal(spell(id), undefined);
  assert.equal(spell('purify-food-and-drink').ritual, true);
  assert.equal(spell('grease').concentration, false);
  assert.equal(spell('web').concentration, true);
});

test('cantrips cost no slots and non-concentration magic leaves concentration intact', () => {
  const s = ready();
  cast(s, spell('guidance'), 0);
  cast(s, spell('fire-bolt'), 0);
  assert.deepEqual(s.spent.slots, [0, 0]);
  assert.equal(s.concentration, spell('guidance').name);
});

test('normal and upcast spells consume the selected slot; always-prepared spells are available', () => {
  const s = ready();
  cast(s, spell('cure-wounds'), 1);
  cast(s, spell('cure-wounds'), 2);
  cast(s, spell('healing-word'), 1);
  assert.deepEqual(s.spent.slots, [2, 1]);
  assert.equal(s.character.prepared.includes('healing-word'), false);
});

test('invalid slot levels and unprepared spells are rejected without resource loss', () => {
  for (const slot of [0, 1, 3, -1, NaN]) {
    const s = ready(), before = structuredClone(s);
    assert.throws(() => cast(s, spell('web'), slot));
    assert.deepEqual(s, before);
  }
  const s = ready();
  assert.throws(() => cast(s, spell('catapult'), 1));
  assert.deepEqual(s.spent.slots, [0, 0]);
});

test('prepared ritual consumes no slot, including when all slots are expended', () => {
  const s = ready();
  s.spent.slots = [4, 2];
  cast(s, spell('detect-magic'), 0, { ritual: true });
  assert.deepEqual(s.spent.slots, [4, 2]);
  assert.equal(s.concentration, spell('detect-magic').name);
});

test('ritual casting does not bypass preparation or permit nonritual spells', () => {
  const s = ready(), before = structuredClone(s);
  assert.throws(() => cast(s, spell('alarm'), 0, { ritual: true }));
  assert.throws(() => cast(s, spell('cure-wounds'), 0, { ritual: true }));
  assert.deepEqual(s, before);
});

test('replacing concentration requires confirmation and spends exactly one slot', () => {
  const s = ready();
  cast(s, spell('guidance'), 0);
  assert.throws(() => cast(s, spell('web'), 2));
  assert.equal(s.concentration, spell('guidance').name);
  assert.deepEqual(s.spent.slots, [0, 0]);
  cast(s, spell('web'), 2, { replace: true });
  assert.equal(s.concentration, spell('web').name);
  assert.deepEqual(s.spent.slots, [0, 1]);
});

test('a failed cast with exhausted slots does not remove existing concentration', () => {
  const s = ready();
  s.spent.slots[1] = 2;
  s.concentration = spell('guidance').name;
  const before = structuredClone(s);
  assert.throws(() => cast(s, spell('web'), 2, { replace: true }));
  assert.deepEqual(s, before);
});

test('finite resources never become negative or grant more than their maximum uses', () => {
  const s = ready(7);
  for (const [key, index, count] of [['slots', 0, 4], ['slots', 1, 3], ['elixirs', undefined, 2], ['genius', undefined, 3]]) {
    for (let i = 0; i < count; i++) spend(s, key, index);
    assert.equal(available(s, key, index), 0);
    const before = structuredClone(s);
    assert.throws(() => spend(s, key, index));
    assert.deepEqual(s, before);
  }
  assert.equal(available(ready(6), 'genius'), 0);
  assert.throws(() => spend(ready(6), 'genius'));
});

test('long rest resets daily class resources and concentration but preserves infusion charges and choices', () => {
  const s = ready(7), c = structuredClone(s.character);
  s.spent = { slots: [4, 3], elixirs: 2, genius: 3, infusions: { 'mind-sharpener': 4, 'spell-refueling-ring': 1 } };
  s.concentration = 'Паутина';
  longRest(s);
  assert.deepEqual(s.spent, { slots: [0, 0], elixirs: 0, genius: 0, infusions: { 'mind-sharpener': 4, 'spell-refueling-ring': 1 } });
  assert.equal(s.concentration, null);
  assert.deepEqual(s.character, c);
});

test('changing level recalculates capacities without restoring spent resources', () => {
  const s = ready(7);
  s.spent = { slots: [3, 3], elixirs: 2, genius: 3, infusions: { 'mind-sharpener': 2 } };
  const spent = structuredClone(s.spent);
  s.character.level = 5;
  assert.equal(available(s, 'slots', 1), 0);
  assert.equal(available(s, 'elixirs'), 0);
  assert.equal(available(s, 'genius'), 0);
  s.character.level = 7;
  assert.equal(available(s, 'slots', 1), 0);
  assert.equal(available(s, 'elixirs'), 0);
  assert.equal(available(s, 'genius'), 0);
  assert.deepEqual(s.spent, spent);
  s.character.abilities.int = 12;
  assert.equal(available(s, 'genius'), 0);
  s.character.abilities.int = 16;
  assert.equal(available(s, 'genius'), 0);
});

test('new level capacity is available without resetting the old expenditure', () => {
  const s = ready(5);
  s.spent.slots = [2, 2];
  s.spent.elixirs = 1;
  s.character.level = 6;
  assert.equal(available(s, 'elixirs'), 1);
  assert.equal(available(s, 'slots', 1), 0);
  s.character.level = 7;
  assert.equal(available(s, 'slots', 1), 1);
  assert.equal(available(s, 'slots', 0), 2);
});

test('validation enforces limits, level prerequisites, distinct selections and known-before-active', () => {
  const mutations = [
    c => { c.cantrips = ['fire-bolt']; },
    c => { c.cantrips = ['fire-bolt', 'fire-bolt']; },
    c => { c.prepared.push('healing-word'); },
    c => { c.prepared = ['fire-bolt']; },
    c => { c.known[0] = 'spell-refueling-ring'; },
    c => { c.active = ['returning-weapon']; },
    c => { c.active = c.known.slice(0, 3); },
    c => { c.known.push('returning-weapon'); },
    c => { c.prepared = SPELLS.filter(s => s.level === 1 && !s.always).slice(0, 6).map(s => s.id); },
    c => { c.level = 8; },
    c => { c.abilities.int = 21; },
    c => { c.abilities.int = 15.5; },
  ];
  for (const mutate of mutations) {
    const c = ready().character;
    mutate(c);
    assert.ok(validate(c, SPELLS, INFUSIONS).length > 0, mutate.toString());
  }
});

test('JSON save/load round-trip preserves actual progress, concentration, notes and history', () => {
  const s = ready(7);
  cast(s, spell('web'), 2);
  spend(s, 'genius');
  spend(s, 'elixirs');
  s.spent.infusions['mind-sharpener'] = 2;
  s.character.notes = 'Гном. Проверить противоядие.';
  s.log = [{ text: 'Паутина · ячейка 2', time: '2026-10-23T10:00:00.000Z' }];
  s.updatedAt = '2026-10-23T10:00:00.000Z';
  const restored = restoreState(JSON.parse(JSON.stringify(s)), SPELLS, INFUSIONS);
  assert.deepEqual(restored, s);
  assert.equal(available(restored, 'slots', 1), 2);
  assert.equal(available(restored, 'genius'), 2);
});

test('malformed imports cannot create extra slots or invalid configured choices', () => {
  for (const mutate of [
    s => { s.version = 99; },
    s => { s.spent.slots = [-1, 0]; },
    s => { s.spent.slots = [0.5, 0]; },
    s => { s.spent.slots = [0]; },
    s => { s.spent.genius = -1; },
    s => { s.spent.infusions['mind-sharpener'] = -1; },
    s => { s.character.abilities.int = '20'; },
    s => { delete s.character.abilities.con; },
    s => { s.character.cantrips = ['unknown-spell', 'fire-bolt']; },
    s => { s.character.known = []; },
  ]) {
    const raw = ready();
    mutate(raw);
    assert.throws(() => restoreState(raw, SPELLS, INFUSIONS), mutate.toString());
  }
});

test('unfinished onboarding can be saved and restored without silently completing it', () => {
  const s = defaultState();
  const restored = restoreState(JSON.parse(JSON.stringify(s)), SPELLS, INFUSIONS);
  assert.equal(restored.configured, false);
  assert.deepEqual(restored.character.cantrips, []);
});

test('charged infusions recover at dawn with correct dice, not on a short or long rest', () => {
  assert.equal(INFUSIONS.find(i => i.id === 'armor-magical-strength').recharge, '1d6');
  assert.equal(INFUSIONS.find(i => i.id === 'mind-sharpener').recharge, '1d4');
  for (const id of ['replicate-wand-detection', 'replicate-wand-secrets', 'replicate-pipes-haunting']) {
    const i = INFUSIONS.find(x => x.id === id);
    assert.equal(i.recharge, '1d3');
    assert.equal(i.rechargeAt, 'dawn');
  }
});
