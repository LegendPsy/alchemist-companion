// Original vector sigils for the alchemist's combat hotbar.
// Icons are local SVG markup: no third-party assets or runtime network requests.
const symbols={
 fire:'<path d="M34 8c1 12-9 13-5 25-10-4-9-12-8-15C9 28 12 46 19 53c7 8 22 9 30-1 9-13 0-25-6-30 1 12-6 14-9 18 4-13 5-20 0-32Z"/><path d="M30 40c-8 9-4 17 3 17 8 0 11-9 4-17-1 7-6 5-7 0Z"/>',
 heal:'<path d="M18 51V30c0-6 8-7 8 0v-9c0-6 8-7 8 0v9-12c0-6 8-6 8 0v14-6c0-6 8-5 8 0v14c0 11-8 16-18 16H27Z"/><path d="M11 16h14M18 9v14"/>',
 web:'<path d="M32 4v56M4 32h56M12 12l40 40M52 12 12 52"/><path d="M32 12c-6 12-12 15-20 20 8 5 14 11 20 20 7-10 13-15 20-20-8-7-14-11-20-20Z"/><path d="M20 20c4 10 4 15 0 24m24-24c-4 10-4 15 0 24"/>',
 shield:'<path d="M32 5c8 7 17 8 23 9v19c0 13-10 20-23 27C19 53 9 46 9 33V14c8-2 16-4 23-9Z"/><path d="m18 34 10 9 17-21M29 12l-8 17m23-6-11 25"/>',
 bolt:'<path d="M37 3 13 34h18l-5 27 25-34H33Z"/><path d="M45 10l8-4M9 45l-6 7"/>',
 flask:'<path d="M24 7h16m-13 0v17L13 46c-4 8 1 13 8 13h22c9 0 12-7 8-14L37 24V7"/><path d="M18 42h28M23 51h18"/><circle cx="26" cy="35" r="2"/><circle cx="39" cy="29" r="2"/>',
 homunculus:'<path d="M16 17 31 9 48 18l4 16-8 16-14 7-17-14V27Z"/><path d="M20 30 29 25l4 8-9 3m18-7-8-4-2 8 8 3"/><circle cx="25" cy="32" r="2"/><circle cx="39" cy="32" r="2"/><path d="m27 45 5 3 6-3M32 10V4"/>',
 sword:'<path d="m46 8 10 2-2 10-25 25-9-9Z"/><path d="m18 32 14 14m-21-8 18 18M11 48l6 6m-4 6 7-7"/>',
 twin:'<path d="M17 7 12 20l23 23 7-8L17 7Zm30 0 5 13-23 23-8-8L47 7ZM9 48l9 9m37-9-9 9"/>',
 gear:'<circle cx="32" cy="32" r="10"/><path d="M27 5h10l2 8 6 3 7-4 6 9-6 6v9l6 7-6 9-8-4-6 3-2 8H27l-2-8-6-3-8 4-6-9 6-7v-9l-6-6 6-9 8 4 6-3Z"/>',
 bow:'<path d="M14 9c33 4 33 42 0 46 15-13 15-33 0-46Z"/><path d="M13 9v46m0-23h40m-11-9 11 9-11 9"/>',
 boots:'<path d="M16 9h19l-2 19 12 11c7 2 10 6 10 13H7c0-6 4-8 9-12Z"/><path d="m11 44 39 2M19 15h12M20 22h12"/>',
 eye:'<path d="M5 32c8-12 18-18 27-18S51 20 59 32C51 44 41 50 32 50S13 44 5 32Z"/><circle cx="32" cy="32" r="10"/><circle cx="34" cy="29" r="4"/>',
 hide:'<path d="M11 54 16 24l16-15 16 15 5 30H11Z"/><path d="m25 35 7 7 7-7M21 28l8 4m14-4-8 4"/>',
 hand:'<path d="M12 51V37c0-5 7-6 7 0V17c0-6 8-6 8 0v11-18c0-6 8-6 8 0v18-14c0-6 8-6 8 0v17-9c0-6 8-6 8 0v19c0 10-7 16-20 16H22Z"/>',
 hourglass:'<path d="M17 6h30m-30 52h30M19 8c0 15 13 15 13 24S19 41 19 56m26-48c0 15-13 15-13 24s13 9 13 24"/><path d="m22 48 10-7 10 7"/>',
 star:'<path d="m32 5 6 20 20 7-20 6-6 21-6-21-20-6 20-7Z"/><circle cx="32" cy="32" r="6"/>',
 swirl:'<path d="M31 11c-17-3-27 13-21 26 7 18 34 16 37 2 3-13-14-20-21-11-8 11 8 18 13 8"/><path d="m41 9 12 3-3 12"/>',
 diamond:'<path d="m32 4 25 28-25 28L7 32Z"/><path d="M10 32h44M32 6v52m-16-34 16-14 16 14m-32 16 16 14 16-14"/>',
 scroll:'<path d="M20 7h29v40c0 8-7 12-14 9H16C7 56 7 44 15 44h29"/><path d="M20 7c-8 0-8 13 0 13m8 5h13m-13 8h12"/>',
 potion:'<path d="M24 4h16v10l-3 3v7l14 23c4 7 0 12-8 12H21c-8 0-12-5-8-12l14-23v-7l-3-3Z"/><path d="M16 42h32m-29 7h27"/><circle cx="32" cy="35" r="3"/>',
 flare:'<path d="m32 4 4 20 18-10-10 18 18 4-20 4 10 18-18-10-4 16-4-20L8 54l10-18L2 32l20-4L12 10l18 10Z"/>',
 search:'<circle cx="27" cy="26" r="17"/><path d="m40 40 16 16M20 28c0-7 3-11 10-13"/>',
 book:'<path d="M31 13c-8-6-17-6-25-4v42c10-3 19-1 25 4 7-5 16-7 26-4V9c-9-2-18-2-26 4Z"/><path d="M31 13v42M12 18c6-1 10 0 14 3m12 0c4-3 9-4 14-3"/>',
 smoke:'<path d="M24 16V8h16v8l-3 4 12 27c4 8 0 12-7 12H22c-7 0-12-4-7-12l12-27Z"/><path d="M21 44c8-7 15 10 25 0M13 34c-5-5 3-11 8-7m29 0c8-5 13 4 7 10"/>',
 target:'<circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="12"/><circle cx="32" cy="32" r="3"/><path d="M32 1v12m0 38v12M1 32h12m38 0h12"/>'
};
const exact={
 'spell:fire-bolt':'fire','spell:healing-word':'heal','spell:web':'web',
 'spell:absorb-elements':'shield','spell:magic-stone':'diamond','spell:guidance':'star',
 'spell:ray-of-sickness':'smoke','spell:flaming-sphere':'fire','spell:melfs-acid-arrow':'potion',
 'spell:shocking-grasp':'bolt','spell:acid-splash':'potion','spell:thorn-whip':'swirl',
 'spell:frostbite':'shield','spell:cure-wounds':'heal','spell:feather-fall':'boots',
 'spell:faerie-fire':'flare','spell:heat-metal':'fire','spell:poison-spray':'smoke',
 'infusion:homunculus':'homunculus','infusion:mind-sharpener':'shield',
 'infusion:repulsion-shield':'shield','infusion:radiant-weapon':'flare',
 'infusion:spell-refueling-ring':'diamond','infusion:winding-path':'boots',
 'infusion:replicate-wand-detection':'eye','infusion:armor-magical-strength':'shield',
 'feature:brew':'flask','feature:genius':'star','ongoing:sphere':'fire',
 'general:attack':'sword','general:dash':'boots','general:disengage':'swirl',
 'general:dodge':'shield','general:help':'hand','general:hide':'hide',
 'general:ready':'hourglass','general:search':'search','general:use-object':'gear',
 'general:elixir-drink':'potion','general:tinker':'gear',
 'general:two-weapons':'twin','general:opportunity':'sword',
 'general:prepared-reaction':'hourglass','general:other-reaction':'swirl',
 'general:other-bonus':'star'
};
const palettes={
 fire:['#f2822e','#ffc17a'],heal:['#39b978','#adffd2'],web:['#9e58dd','#e7baff'],
 shield:['#367cdd','#b7f0ff'],bolt:['#388bff','#b2ddff'],flask:['#22ab8a','#acffee'],
 homunculus:['#b88a53','#ffdd9d'],sword:['#cf6a41','#ffcc8f'],twin:['#d88755','#ffe0b1'],
 gear:['#aa8f65','#f7ddab'],bow:['#b99360','#f4dfab'],boots:['#bc8a6e','#f4d7aa'],
 eye:['#9c69d5','#d8b5ff'],hide:['#696f9f','#c8c7ff'],hand:['#49b78e','#c1ffe7'],
 hourglass:['#ba8b46','#ffe6ac'],star:['#caa452','#fff4a5'],swirl:['#816aca','#d8bfff'],
 diamond:['#328cd2','#a4efff'],scroll:['#b78b50','#ffdaac'],potion:['#3bba82','#b8ffcb'],
 flare:['#d4a648','#fff7bc'],search:['#9aaba2','#d5fff1'],book:['#9e7d62','#ffe1aa'],
 smoke:['#8b9a72','#e6e8af'],target:['#c37a58','#ffc996']
};
export function glyphName(key){if(exact[key])return exact[key];const k=String(key||'');if(/fire|flame|burn|heat|searing|pyro/.test(k))return 'fire';if(/acid|poison|caustic|sick|toxic/.test(k))return 'potion';if(/lightning|shocking|thunder|storm/.test(k))return 'bolt';if(/heal|cure|restoration|sanctuary|aid/.test(k))return 'heal';if(/shield|resist|protect|defen|armor/.test(k))return 'shield';if(/enchant|magic|arcane|detect|identify/.test(k))return 'diamond';if(/invisi|dark|hide|disguise/.test(k))return 'hide';if(/web|snare|vine/.test(k))return 'web';if(/homunculus|servant/.test(k))return 'homunculus';if(/brew|elixir|alchem|flask/.test(k))return 'flask';if(/weapon|blade|attack/.test(k))return 'sword';if(/rope|jump|speed|dash|walk|levitate/.test(k))return 'boots';if(/spell|ritual|book|message/.test(k))return 'scroll';return 'star';}
export function iconArt(key,cls=''){const id=glyphName(key),colors=palettes[id]||palettes.star;return '<svg class="sigil '+cls+'" viewBox="0 0 64 64" role="img" aria-hidden="true" style="--sigil:'+colors[0]+';--sigil-bright:'+colors[1]+'"><g fill="none" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round">'+(symbols[id]||symbols.star)+'</g></svg>';}
export function sigilColor(key){return (palettes[glyphName(key)]||palettes.star)[0];}
