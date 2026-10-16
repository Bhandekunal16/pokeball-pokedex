import { ResourceCategory } from '../types/pokemon';

export function formatPokemonId(id: number | string | undefined | null): string {
  if (id === undefined || id === null) return '#---';
  const num = typeof id === 'string' ? parseInt(id, 10) : id;
  if (isNaN(num)) return `#${id}`;
  if (num < 10) return `#00${num}`;
  if (num < 100) return `#0${num}`;
  return `#${num}`;
}

export function capitalize(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function formatHeight(heightInDecimeters: number | undefined | null): string {
  if (heightInDecimeters === undefined || heightInDecimeters === null) return '-- m';
  const meters = (heightInDecimeters / 10).toFixed(1);
  const feet = (heightInDecimeters * 0.328084).toFixed(1);
  return `${meters} m (${feet} ft)`;
}

export function formatWeight(weightInHectograms: number | undefined | null): string {
  if (weightInHectograms === undefined || weightInHectograms === null) return '-- kg';
  const kg = (weightInHectograms / 10).toFixed(1);
  const lbs = (weightInHectograms * 0.220462).toFixed(1);
  return `${kg} kg (${lbs} lbs)`;
}

export function extractIdFromUrl(url: string | undefined | null): number {
  if (!url) return 0;
  const match = url.match(/\/(\d+)\/?$/);
  return match ? parseInt(match[1], 10) : 0;
}

export function getOfficialArtwork(id: number | string): string {
  const numericId = typeof id === 'string' ? extractIdFromUrl(id) || parseInt(id, 10) : id;
  if (!numericId || isNaN(numericId)) return '';
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${numericId}.png`;
}

export function getFallbackArtwork(id: number | string): string {
  const numericId = typeof id === 'string' ? extractIdFromUrl(id) || parseInt(id, 10) : id;
  if (!numericId || isNaN(numericId)) return '';
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${numericId}.png`;
}

export interface TypeStyle {
  bg: string;
  text: string;
  border: string;
  badge: string;
  accent: string;
  glow: string;
}

export const POKEMON_TYPE_STYLES: Record<string, TypeStyle> = {
  normal: {
    bg: 'bg-stone-500/15',
    text: 'text-stone-300',
    border: 'border-stone-500/30',
    badge: 'bg-stone-600 text-stone-100',
    accent: '#A8A878',
    glow: 'rgba(168, 168, 120, 0.25)',
  },
  fire: {
    bg: 'bg-orange-500/15',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    badge: 'bg-orange-600 text-white',
    accent: '#F08030',
    glow: 'rgba(240, 128, 48, 0.35)',
  },
  water: {
    bg: 'bg-blue-500/15',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    badge: 'bg-blue-600 text-white',
    accent: '#6890F0',
    glow: 'rgba(104, 144, 240, 0.35)',
  },
  electric: {
    bg: 'bg-amber-400/15',
    text: 'text-amber-400',
    border: 'border-amber-400/30',
    badge: 'bg-amber-500 text-slate-950 font-semibold',
    accent: '#F8D030',
    glow: 'rgba(248, 208, 48, 0.35)',
  },
  grass: {
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    badge: 'bg-emerald-600 text-white',
    accent: '#78C850',
    glow: 'rgba(120, 200, 80, 0.35)',
  },
  ice: {
    bg: 'bg-cyan-400/15',
    text: 'text-cyan-300',
    border: 'border-cyan-400/30',
    badge: 'bg-cyan-500 text-slate-950 font-semibold',
    accent: '#98D8D8',
    glow: 'rgba(152, 216, 216, 0.35)',
  },
  fighting: {
    bg: 'bg-red-700/15',
    text: 'text-red-400',
    border: 'border-red-700/30',
    badge: 'bg-red-700 text-white',
    accent: '#C03028',
    glow: 'rgba(192, 48, 40, 0.35)',
  },
  poison: {
    bg: 'bg-purple-600/15',
    text: 'text-purple-400',
    border: 'border-purple-600/30',
    badge: 'bg-purple-600 text-white',
    accent: '#A040A0',
    glow: 'rgba(160, 64, 160, 0.35)',
  },
  ground: {
    bg: 'bg-yellow-700/15',
    text: 'text-yellow-500',
    border: 'border-yellow-700/30',
    badge: 'bg-yellow-700 text-white',
    accent: '#E0C068',
    glow: 'rgba(224, 192, 104, 0.35)',
  },
  flying: {
    bg: 'bg-indigo-400/15',
    text: 'text-indigo-300',
    border: 'border-indigo-400/30',
    badge: 'bg-indigo-500 text-white',
    accent: '#A890F0',
    glow: 'rgba(168, 144, 240, 0.35)',
  },
  psychic: {
    bg: 'bg-pink-500/15',
    text: 'text-pink-400',
    border: 'border-pink-500/30',
    badge: 'bg-pink-600 text-white',
    accent: '#F85888',
    glow: 'rgba(248, 88, 136, 0.35)',
  },
  bug: {
    bg: 'bg-lime-500/15',
    text: 'text-lime-400',
    border: 'border-lime-500/30',
    badge: 'bg-lime-600 text-white',
    accent: '#A8B820',
    glow: 'rgba(168, 184, 32, 0.35)',
  },
  rock: {
    bg: 'bg-stone-600/15',
    text: 'text-stone-400',
    border: 'border-stone-600/30',
    badge: 'bg-stone-700 text-white',
    accent: '#B8A038',
    glow: 'rgba(184, 160, 56, 0.35)',
  },
  ghost: {
    bg: 'bg-violet-600/15',
    text: 'text-violet-400',
    border: 'border-violet-600/30',
    badge: 'bg-violet-700 text-white',
    accent: '#705898',
    glow: 'rgba(112, 88, 152, 0.35)',
  },
  dragon: {
    bg: 'bg-indigo-700/15',
    text: 'text-indigo-400',
    border: 'border-indigo-700/30',
    badge: 'bg-indigo-700 text-white',
    accent: '#7038F8',
    glow: 'rgba(112, 56, 248, 0.35)',
  },
  dark: {
    bg: 'bg-zinc-800/30',
    text: 'text-zinc-400',
    border: 'border-zinc-700/40',
    badge: 'bg-zinc-800 text-zinc-200 border border-zinc-700',
    accent: '#705848',
    glow: 'rgba(112, 88, 72, 0.35)',
  },
  steel: {
    bg: 'bg-slate-400/15',
    text: 'text-slate-300',
    border: 'border-slate-400/30',
    badge: 'bg-slate-500 text-white',
    accent: '#B8B8D0',
    glow: 'rgba(184, 184, 208, 0.35)',
  },
  fairy: {
    bg: 'bg-rose-400/15',
    text: 'text-rose-300',
    border: 'border-rose-400/30',
    badge: 'bg-rose-500 text-white',
    accent: '#EE99AC',
    glow: 'rgba(238, 153, 172, 0.35)',
  },
  stellar: {
    bg: 'bg-teal-500/15',
    text: 'text-teal-300',
    border: 'border-teal-500/30',
    badge: 'bg-teal-600 text-white',
    accent: '#40B5A6',
    glow: 'rgba(64, 181, 166, 0.35)',
  },
};

export function getTypeStyle(type: string | undefined): TypeStyle {
  const normalized = (type || 'normal').toLowerCase();
  return (
    POKEMON_TYPE_STYLES[normalized] || {
      bg: 'bg-slate-500/15',
      text: 'text-slate-300',
      border: 'border-slate-500/30',
      badge: 'bg-slate-600 text-white',
      accent: '#64748b',
      glow: 'rgba(100, 116, 139, 0.25)',
    }
  );
}

export function getStatInfo(statName: string): { label: string; max: number; colorClass: string; barColor: string } {
  switch (statName.toLowerCase()) {
    case 'hp':
      return { label: 'HP', max: 255, colorClass: 'text-emerald-400', barColor: 'bg-emerald-500' };
    case 'attack':
      return { label: 'Attack', max: 190, colorClass: 'text-red-400', barColor: 'bg-red-500' };
    case 'defense':
      return { label: 'Defense', max: 230, colorClass: 'text-amber-400', barColor: 'bg-amber-500' };
    case 'special-attack':
      return { label: 'Sp. Atk', max: 194, colorClass: 'text-sky-400', barColor: 'bg-sky-500' };
    case 'special-defense':
      return { label: 'Sp. Def', max: 230, colorClass: 'text-indigo-400', barColor: 'bg-indigo-500' };
    case 'speed':
      return { label: 'Speed', max: 200, colorClass: 'text-pink-400', barColor: 'bg-pink-500' };
    default:
      return { label: capitalize(statName), max: 200, colorClass: 'text-slate-300', barColor: 'bg-slate-400' };
  }
}

export interface ResourceCategoryMeta {
  key: ResourceCategory;
  name: string;
  description: string;
  sampleValue: string;
}

export const ALL_RESOURCE_CATEGORIES: ResourceCategoryMeta[] = [
  { key: 'pokemon', name: 'Pokémon', description: 'Monsters, species, stats, and types', sampleValue: 'pikachu' },
  { key: 'type', name: 'Types', description: 'Elemental damage relations and immunities', sampleValue: 'fire' },
  { key: 'move', name: 'Moves', description: 'Battle attacks, power, accuracy, and PP', sampleValue: 'thunderbolt' },
  { key: 'ability', name: 'Abilities', description: 'Passive battle effects and mechanics', sampleValue: 'overgrow' },
  { key: 'item', name: 'Items', description: 'Hold items, Pokéballs, medicines, and berries', sampleValue: 'master-ball' },
  { key: 'location', name: 'Locations', description: 'World landmarks, routes, and cities', sampleValue: 'cerulean-cave' },
  { key: 'region', name: 'Regions', description: 'Geographic lands (Kanto, Johto, etc.)', sampleValue: 'kanto' },
  { key: 'generation', name: 'Generations', description: 'Game release eras and introduced Pokémon', sampleValue: 'generation-i' },
  { key: 'pokedex', name: 'Pokédexes', description: 'National and regional catalog listings', sampleValue: 'national' },
  { key: 'egg-group', name: 'Egg Groups', description: 'Breeding compatibility groups', sampleValue: 'monster' },
  { key: 'growth-rate', name: 'Growth Rates', description: 'Experience curve and leveling speed', sampleValue: 'slow' },
  { key: 'nature', name: 'Natures', description: 'Personality stat buffs and debuffs', sampleValue: 'hardy' },
  { key: 'stat', name: 'Stats', description: 'Base attribute definitions', sampleValue: 'speed' },
  { key: 'pokemon-habitat', name: 'Habitats', description: 'Wild living biomes (forest, mountain, etc.)', sampleValue: 'forest' },
  { key: 'pokemon-species', name: 'Species', description: 'Evolution lines, color, and flavor text', sampleValue: 'pikachu' },
  { key: 'pokemon-color', name: 'Colors', description: 'Primary visual pigmentation', sampleValue: 'yellow' },
  { key: 'pokemon-shape', name: 'Shapes', description: 'Anatomical body structure', sampleValue: 'quadruped' },
  { key: 'evolution-chain', name: 'Evolution Chains', description: 'Stage transitions and triggers', sampleValue: '1' },
  { key: 'item-category', name: 'Item Categories', description: 'Item groupings and inventory bags', sampleValue: 'standard-balls' },
  { key: 'item-attribute', name: 'Item Attributes', description: 'Consumable, holdable, countable flags', sampleValue: 'countable' },
  { key: 'move-category', name: 'Move Categories', description: 'Damage, ailment, net-good-stats', sampleValue: 'damage' },
  { key: 'move-battle-style', name: 'Battle Styles', description: 'Combat behavior styles', sampleValue: 'attack' },
  { key: 'encounter-method', name: 'Encounter Methods', description: 'Walk, surf, fish, rock smash', sampleValue: 'walk' },
  { key: 'characteristic', name: 'Characteristics', description: 'Flavor text determined by IVs', sampleValue: '1' },
];
