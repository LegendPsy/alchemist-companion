// D&D 5e (2014) action economy: only selected, prepared, currently available features.
export const KIND_LABELS={action:'Основное действие',bonus:'Бонусное действие',reaction:'Реакция'};
export function spellActionKind(spell){
  if(spell.action==='Действие')return 'action';
  if(spell.action==='Бонусное действие')return 'bonus';
  if(spell.action==='Реакция')return 'reaction';
  return null; // e.g. one-minute casting times are not one-turn combat actions
}

export function bonusSpellRuleConflict(state,spells,next){const turn=state.turn||{},chosen=turn.chosen||{};const previousAction=spells.find(s=>s.name===chosen.action&&spellActionKind(s)==='action');const previousBonus=spells.find(s=>s.name===chosen.bonus&&spellActionKind(s)==='bonus');const kind=spellActionKind(next);if(kind==='action'&&next.level>0&&previousBonus)return 'После заклинания бонусным действием можно сотворить только заговор с временем сотворения «действие».';if(kind==='bonus'&&previousAction?.level>0)return 'После заклинания основным действием нельзя сотворить заклинание бонусным действием в тот же ход.';return null;}

const GENERIC={
 action:[
  ['attack','Атака оружием','Одна атака оружием на уровнях 5–7; Дополнительной атаки у алхимика нет.'],
  ['dash','Рывок','Получите дополнительное перемещение в этот ход.'],
  ['disengage','Отход','Ваше перемещение не вызывает атак по возможности до конца хода.'],
  ['dodge','Уклонение','Атаки по вам с помехой до начала следующего хода, если видите атакующего; преимущество на спасброски ЛОВ.'],
  ['help','Помощь','Помогите союзнику с подходящей проверкой или атакой.'],
  ['hide','Засада','Попытка спрятаться: проверка Скрытности, когда условия позволяют.'],
  ['ready','Подготовить действие','Укажите действие и условие; при срабатывании потратите реакцию. Для подготовленного заклинания есть особые правила.'],
  ['search','Поиск','Внимательность или Анализ по ситуации.'],
  ['use-object','Использовать предмет','Обычное взаимодействие с предметом, которому требуется действие.'],
  ['elixir-drink','Выпить эликсир','Примените эффект имеющегося эликсира (сам запас эликсиров в приложении не учитывается).'],
  ['tinker','Магическое изобретательство','Придать подходящему крошечному немагическому предмету магический эффект.']
 ],
 bonus:[
  ['two-weapons','Атака второй рукой','Только когда условия боя двумя лёгкими рукопашными оружиями соблюдены.'],
  ['other-bonus','Другое бонусное действие','Если мастер разрешает бонусное действие от расы, предмета или ситуации.']
 ],
 reaction:[
  ['opportunity','Атака по возможности','Когда видимый противник покидает вашу досягаемость без Отхода.'],
  ['prepared-reaction','Подготовленное действие','Когда срабатывает условие заранее подготовленного действия.'],
  ['other-reaction','Другая реакция','Если мастер разрешает реакцию от обстоятельств или предмета.']
 ]
};
const INFUSION_ACTIONS={
 action:{
  'spell-refueling-ring':['Кольцо восполнения заклинаний','Восстановить потраченную ячейку I или II круга.'],
  'replicate-wand-detection':['Палочка обнаружения магии','Потратить заряд; заклинание требует концентрации.'],
  'replicate-wand-secrets':['Палочка секретов','Потратить заряд и обнаружить ближайшую ловушку или секретную дверь.'],
  'replicate-pipes-haunting':['Свирель ужаса','Потратить заряд, испугать слышащих существ (спасбросок МДР Сл 15).'],
  'replicate-eyes-charming':['Глаза очарования','Потратить заряд (спасбросок МДР Сл 13).']
 },
 bonus:{
  homunculus:['Командовать гомункулом','Отдайте команду атаковать (1d4 + БМ силовым полем).'],
  'winding-path':['Сапоги извилистого пути','Телепортация до 15 футов на место, где вы уже находились в этом ходу.'],
  'radiant-weapon':['Сияющее оружие: свет','Включить или выключить свет оружия; заряды не тратятся.']
 },
 reaction:{
  'armor-magical-strength':['Доспех магической силы','Потратить заряд, чтобы реакцией предотвратить падение ничком.'],
  'mind-sharpener':['Обостритель разума','Потратить заряд после провала спасброска концентрации.'],
  'radiant-weapon':['Сияющее оружие: ослепление','Потратить заряд после попадания по вам; спасбросок ТЕЛ.'],
  'repulsion-shield':['Отталкивающий щит','Потратить заряд после попадания рукопашной атакой; оттолкнуть до 15 футов.']
 }
};
export function combatOptions(state,spells,infusions,kind){
  if(!KIND_LABELS[kind])return [];
  const c=state.character,available=(lv)=>Math.max(0,(lv===1?4:(c.level===7?3:2))-(state.spent?.slots?.[lv-1]||0));
  const known=new Set([...c.cantrips,...c.prepared]);
  const preparedSpells=spells.filter(s=>(s.always||known.has(s.id))&&spellActionKind(s)===kind)
    .map(s=>({key:'spell:'+s.id,title:s.name,subtitle:(s.level?'Круг '+s.level:'Заговор')+' · '+s.range,detail:s.description,group:'Магия',disabled:(s.level>0&&![1,2].some(lv=>lv>=s.level&&available(lv)>0))||!!bonusSpellRuleConflict(state,spells,s),spell:s}));
  const infusionsActive=new Set(c.active);
  const gear=infusions.filter(i=>infusionsActive.has(i.id)&&INFUSION_ACTIONS[kind]?.[i.id])
    .map(i=>{const [title,detail]=INFUSION_ACTIONS[kind][i.id];const left=i.charges?Math.max(0,i.charges-(state.spent.infusions[i.id]||0)):null;
      return {key:'infusion:'+i.id,title,subtitle:left===null?'Активная инфузия':'Заряды: '+left+'/'+i.charges,detail,group:'Устройства',disabled:left===0,infusion:i};});
  if(kind==='bonus'&&state.concentration===spells.find(s=>s.id==='flaming-sphere')?.name)
    gear.unshift({key:'ongoing:sphere',title:'Передвинуть пылающий шар',subtitle:'Концентрация · до 30 фт.',detail:'Переместить уже созданный шар и при необходимости протаранить цель. Ячейка повторно не тратится.',group:'Устройства',disabled:false});
  if(kind==='reaction'&&c.level>=7)
    gear.unshift({key:'feature:genius',title:'Вспышка гениальности',subtitle:'Применений: '+Math.max(0,Math.max(1,Math.floor((c.abilities.int-10)/2))-(state.spent.genius||0)),detail:'Добавить модификатор ИНТ к проверке или спасброску своего или видимого существа в 30 фт.',group:'Особенности',disabled:(state.spent.genius||0)>=Math.max(1,Math.floor((c.abilities.int-10)/2))});
  if(kind==='action')
    gear.unshift({key:'feature:brew',title:'Создать дополнительный эликсир',subtitle:'Действие · расход ячейки',detail:'Потратить ячейку I или II круга и выбрать эффект эликсира.',group:'Алхимия',disabled:available(1)===0&&available(2)===0});
  const generic=GENERIC[kind].map(([id,title,detail])=>({key:'general:'+id,title,subtitle:'Обычное действие',detail,group:'Общие действия',disabled:false}));
  return [...preparedSpells,...gear,...generic];
}
