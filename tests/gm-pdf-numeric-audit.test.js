import test from 'node:test';
import assert from 'node:assert/strict';
import { limits, mod, defaultState } from '../rules.js';
import { SPELLS, INFUSIONS } from '../data.js';

// Numeric regression checks against GM-provided "Изобретатель" (Tasha, pp. 10–15, 21–23)
// and "Путеводитель по Побережью Меча" (SCAG, pp. 142–143).
const getSpell = id => {
  const found = SPELLS.find(s => s.id === id);
  assert.ok(found, 'Missing spell ' + id);
  return found;
};
const getInfusion = id => {
  const found = INFUSIONS.find(s => s.id === id);
  assert.ok(found, 'Missing infusion ' + id);
  return found;
};

test('GM artificer table: spell slots, infusions, elixirs and flash of genius by level', () => {
  const rows = [
    { level: 5, slots: [4, 2], known: 4, active: 2, elixirs: 1, genius: 0, prepared: 6 },
    { level: 6, slots: [4, 2], known: 6, active: 3, elixirs: 2, genius: 0, prepared: 7 },
    { level: 7, slots: [4, 3], known: 6, active: 3, elixirs: 2, genius: 4, prepared: 7 },
  ];
  for (const expected of rows) {
    const c = defaultState().character;
    c.level = expected.level;
    c.abilities.int = 18;
    const actual = limits(c);
    for (const key of ['slots','known','active','elixirs','genius','prepared'])
      assert.deepEqual(actual[key],expected[key], 'level '+c.level+' '+key);
    assert.equal(actual.dc, 15);
    assert.equal(actual.attack, 7);
    assert.equal(actual.savant, 4);
    assert.equal(mod(c.abilities.int), 4);
  }
});

test('GM artificer spell catalogue matches level 0–2 count and always-prepared alchemist spells', () => {
  assert.deepEqual([0,1,2].map(level => SPELLS.filter(s=>s.level===level&&!s.always).length), [23,18,21]);
  assert.deepEqual(SPELLS.filter(s=>s.always).map(s=>s.id).sort(),
    ['healing-word','ray-of-sickness','flaming-sphere','melfs-acid-arrow'].sort());
});

test('SCAG fifth-level cantrips retain their 2014 damage dice', () => {
  assert.match(getSpell('booming-blade').description, /1d8/);
  assert.match(getSpell('booming-blade').description, /2d8/);
  assert.match(getSpell('green-flame-blade').description, /1d8/);
  assert.match(getSpell('lightning-lure').description, /2d8/);
  assert.match(getSpell('sword-burst').description, /2d6/);
});

test('alchemist damage/healing spell dice and casting time match 2014 values', () => {
  assert.match(getSpell('healing-word').description, /1d4/);
  assert.equal(getSpell('healing-word').action, 'Бонусное действие');
  assert.match(getSpell('ray-of-sickness').description, /2d8/);
  assert.match(getSpell('flaming-sphere').description, /2d6/);
  assert.match(getSpell('melfs-acid-arrow').description, /4d4/);
  assert.match(getSpell('melfs-acid-arrow').description, /2d4/);
  assert.match(getSpell('fire-bolt').description, /2d10/);
  assert.match(getSpell('acid-splash').description, /2d6/);
  assert.match(getSpell('cure-wounds').description, /1d8/);
  assert.equal(getSpell('grease').concentration, false);
  assert.equal(getSpell('web').concentration, true);
});

test('GM homunculus stat block: all movement and skill numbers are represented', () => {
  const entry=getInfusion('homunculus').description;
  for(const part of ['КД 13','20 фт.','30 фт.','60 фт.','1d4','2d6','120 фт.'])
    assert.ok(entry.includes(part),'Homunculus missing: '+part);
  assert.match(entry,/Внимательность/);
  assert.match(entry,/Скрытность/);
});

test('GM infusion prerequisites, charges and dawn dice', () => {
  const checks = [
    ['armor-magical-strength',2,6,'1d6'],
    ['mind-sharpener',2,4,'1d4'],
    ['radiant-weapon',6,4,'1d4'],
    ['repulsion-shield',6,4,'1d4'],
    ['spell-refueling-ring',6,1,'all'],
    ['replicate-wand-detection',2,3,'1d3'],
    ['replicate-wand-secrets',2,3,'1d3'],
  ];
  for(const [id,minLevel,charges,recharge] of checks){
    const i=getInfusion(id);
    assert.equal(i.minLevel,minLevel,id);
    assert.equal(i.charges,charges,id);
    assert.equal(i.recharge,recharge,id);
  }
});
