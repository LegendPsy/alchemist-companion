import test from 'node:test';
import assert from 'node:assert/strict';
import {iconArt,glyphName,sigilColor} from '../icons.js';
import {combatOptions} from '../combat.js';
import {defaultState} from '../rules.js';
import {SPELLS,INFUSIONS} from '../data.js';

const configuredHero=()=>{
  const s=defaultState();
  s.configured=true;s.character.name='Алхимик';
  s.character.abilities={str:10,dex:14,con:14,int:18,wis:16,cha:8};
  s.character.cantrips=['fire-bolt','guidance'];
  s.character.prepared=['web','absorb-elements','cure-wounds'];
  s.character.known=['homunculus','mind-sharpener','enhanced-defense','enhanced-focus'];
  s.character.active=['homunculus','mind-sharpener'];
  return s;
};
test('every class-approved hotbar ability renders an offline original SVG icon',()=>{
 const s=configuredHero();
 for(const kind of ['action','bonus','reaction'])
  for(const option of combatOptions(s,SPELLS,INFUSIONS,kind)){
   const svg=iconArt(option.key);
   assert.match(svg, /^<svg /,option.key);
   assert.match(svg, /<path /,option.key);
   assert.match(svg, /<\/svg>$/,option.key);
   assert.match(sigilColor(option.key),/^#[a-f0-9]{6}$/i);
  }
});
test('alchemist reference icons use recognizable independent sigils',()=>{
 assert.equal(glyphName('spell:fire-bolt'),'fire');
 assert.equal(glyphName('spell:healing-word'),'heal');
 assert.equal(glyphName('spell:web'),'web');
 assert.equal(glyphName('spell:absorb-elements'),'shield');
 assert.equal(glyphName('infusion:homunculus'),'homunculus');
 assert.equal(glyphName('feature:brew'),'flask');
 assert.notEqual(iconArt('spell:fire-bolt'),iconArt('spell:web'));
});
test('hotbar only contains the hero’s selected abilities, without invented placeholder spells',()=>{
 const s=configuredHero();
 const list=['action','bonus','reaction'].flatMap(kind=>combatOptions(s,SPELLS,INFUSIONS,kind));
 const keys=new Set(list.map(x=>x.key));
 assert.ok(keys.has('spell:fire-bolt'));
 assert.ok(keys.has('spell:web'));
 assert.ok(keys.has('spell:healing-word')); // always prepared for Alchemist
 assert.ok(keys.has('infusion:homunculus'));
 assert.ok(!keys.has('spell:thunderwave'));
 assert.ok(!keys.has('spell:fireball'));
 assert.ok(!keys.has('infusion:repulsion-shield'));
});
