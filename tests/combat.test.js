import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultState,freshTurn,toggleTurnAction,spend,restoreState,cast} from '../rules.js';
import {SPELLS,INFUSIONS} from '../data.js';
import {spellActionKind,combatOptions,bonusSpellRuleConflict} from '../combat.js';

function hero(level=5){
 const s=defaultState();s.configured=true;s.character.level=level;
 s.character.abilities={str:10,dex:14,con:14,int:18,wis:16,cha:8};
 s.character.cantrips=['fire-bolt','magic-stone'];
 s.character.prepared=['web','absorb-elements','cure-wounds'];
 s.character.known=['homunculus','mind-sharpener','enhanced-defense','enhanced-focus',...(level>=6?['spell-refueling-ring','radiant-weapon']:[])];
 s.character.active=['homunculus','mind-sharpener'];
 return s;
}
const options=(s,k)=>combatOptions(s,SPELLS,INFUSIONS,k);
test('combat menu sorts prepared cantrips, spell actions and reactions correctly',()=>{
 const s=hero();const keys=k=>options(s,k).map(x=>x.key);
 assert.ok(keys('action').includes('spell:fire-bolt'));
 assert.ok(keys('bonus').includes('spell:magic-stone'));
 assert.ok(keys('reaction').includes('spell:absorb-elements'));
 assert.ok(keys('action').includes('spell:healing-word')===false);
 assert.ok(keys('bonus').includes('spell:healing-word'));
 assert.ok(keys('bonus').includes('infusion:homunculus'));
 assert.ok(keys('reaction').includes('infusion:mind-sharpener'));
 assert.ok(!keys('action').includes('spell:mending'));
 assert.ok(!keys('action').includes('spell:catapult'));
 assert.ok(!keys('reaction').includes('feature:genius'));
});
test('reaction is available at level seven, requires Flash uses, and uses no spell slot',()=>{
 const s=hero(7);
 assert.ok(options(s,'reaction').some(x=>x.key==='feature:genius'&&!x.disabled));
 s.spent.genius=4;
 assert.ok(options(s,'reaction').some(x=>x.key==='feature:genius'&&x.disabled));
});
test('only active infusions appear and exhausted charges disable an option',()=>{
 const s=hero();
 s.character.active=['mind-sharpener'];
 assert.ok(!options(s,'bonus').some(x=>x.key==='infusion:homunculus'));
 s.spent.infusions['mind-sharpener']=4;
 assert.ok(options(s,'reaction').some(x=>x.key==='infusion:mind-sharpener'&&x.disabled));
});
test('each turn has exactly three independent slots, all reset on the next turn',()=>{
 const s=hero(7);
 s.turn.action=true;s.turn.chosen.action='Огненный снаряд';
 toggleTurnAction(s,'bonus');
 toggleTurnAction(s,'reaction');
 assert.deepEqual([s.turn.action,s.turn.bonus,s.turn.reaction],[true,true,true]);
 const restored=restoreState(JSON.parse(JSON.stringify(s)),SPELLS,INFUSIONS);
 assert.equal(restored.turn.chosen.action,'Огненный снаряд');
 freshTurn(restored);
 assert.deepEqual([restored.turn.action,restored.turn.bonus,restored.turn.reaction],[false,false,false]);
 assert.deepEqual(restored.turn.chosen,{});
});
test('an older character save gets a fresh reaction and empty action labels',()=>{
 const s=hero();
 s.turn={number:9,action:true,bonus:true};
 const restored=restoreState(s,SPELLS,INFUSIONS);
 assert.equal(restored.turn.reaction,false);
 assert.deepEqual(restored.turn.chosen,{});
});
test('spell classification uses true casting time, not spell level or description',()=>{
 assert.equal(spellActionKind(SPELLS.find(s=>s.id==='fire-bolt')),'action');
 assert.equal(spellActionKind(SPELLS.find(s=>s.id==='healing-word')),'bonus');
 assert.equal(spellActionKind(SPELLS.find(s=>s.id==='feather-fall')),'reaction');
 assert.equal(spellActionKind(SPELLS.find(s=>s.id==='mending')),null);
});

test('2014 bonus-action spell rule blocks the second leveled spell in the same turn',()=>{
 const s=hero();
 s.turn.bonus=true;s.turn.chosen.bonus='Лечащее слово';
 assert.ok(options(s,'action').find(x=>x.key==='spell:web').disabled);
 assert.equal(options(s,'action').find(x=>x.key==='spell:fire-bolt').disabled,false);
 assert.ok(bonusSpellRuleConflict(s,SPELLS,SPELLS.find(x=>x.id==='web')));
 s.turn.bonus=false;delete s.turn.chosen.bonus;
 s.turn.action=true;s.turn.chosen.action='Паутина';
 assert.ok(bonusSpellRuleConflict(s,SPELLS,SPELLS.find(x=>x.id==='healing-word')));
 assert.ok(options(s,'bonus').find(x=>x.key==='spell:healing-word').disabled);
});
