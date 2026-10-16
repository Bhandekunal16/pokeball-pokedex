export interface NamedAPIResource {
  name: string;
  url: string;
}

export interface APIListResponse<T = NamedAPIResource> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface APIResponseWrapper<T> {
  success: boolean;
  statusCode: number;
  statusText?: string;
  url?: string;
  data: T;
}

export interface PokemonAbility {
  is_hidden: boolean;
  slot: number;
  ability: NamedAPIResource;
}

export interface PokemonType {
  slot: number;
  type: NamedAPIResource;
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: NamedAPIResource;
}

export interface PokemonMoveVersion {
  level_learned_at: number;
  move_learn_method: NamedAPIResource;
  version_group: NamedAPIResource;
}

export interface PokemonMove {
  move: NamedAPIResource;
  version_group_details: PokemonMoveVersion[];
}

export interface PokemonSprites {
  front_default: string | null;
  front_shiny: string | null;
  back_default?: string | null;
  back_shiny?: string | null;
  other?: {
    'official-artwork'?: {
      front_default: string | null;
      front_shiny?: string | null;
    };
    home?: {
      front_default: string | null;
      front_shiny?: string | null;
    };
    dream_world?: {
      front_default: string | null;
    };
  };
}

export interface PokemonDetail {
  id: number;
  name: string;
  base_experience: number;
  height: number;
  weight: number;
  is_default: boolean;
  order: number;
  abilities: PokemonAbility[];
  types: PokemonType[];
  stats: PokemonStat[];
  moves: PokemonMove[];
  sprites: PokemonSprites;
  cries?: {
    latest?: string;
    legacy?: string;
  };
  species?: NamedAPIResource;
}

export interface MoveDetail {
  id: number;
  name: string;
  accuracy: number | null;
  effect_chance: number | null;
  pp: number | null;
  priority: number;
  power: number | null;
  damage_class: NamedAPIResource;
  type: NamedAPIResource;
  effect_entries: Array<{
    effect: string;
    short_effect: string;
    language: NamedAPIResource;
  }>;
  flavor_text_entries?: Array<{
    flavor_text: string;
    language: NamedAPIResource;
    version_group: NamedAPIResource;
  }>;
}

export interface AbilityDetail {
  id: number;
  name: string;
  is_main_series: boolean;
  generation: NamedAPIResource;
  effect_entries: Array<{
    effect: string;
    short_effect: string;
    language: NamedAPIResource;
  }>;
  pokemon: Array<{
    is_hidden: boolean;
    slot: number;
    pokemon: NamedAPIResource;
  }>;
}

export interface TypeDamageRelations {
  no_damage_to: NamedAPIResource[];
  half_damage_to: NamedAPIResource[];
  double_damage_to: NamedAPIResource[];
  no_damage_from: NamedAPIResource[];
  half_damage_from: NamedAPIResource[];
  double_damage_from: NamedAPIResource[];
}

export interface TypeDetail {
  id: number;
  name: string;
  damage_relations: TypeDamageRelations;
  pokemon: Array<{
    slot: number;
    pokemon: NamedAPIResource;
  }>;
  moves: NamedAPIResource[];
}

export interface ItemDetail {
  id: number;
  name: string;
  cost: number;
  fling_power: number | null;
  fling_effect: NamedAPIResource | null;
  category: NamedAPIResource;
  sprites: {
    default: string | null;
  };
  effect_entries: Array<{
    effect: string;
    short_effect: string;
    language: NamedAPIResource;
  }>;
  attributes: NamedAPIResource[];
}

export interface LocationDetail {
  id: number;
  name: string;
  region: NamedAPIResource | null;
  areas: NamedAPIResource[];
}

export interface RegionDetail {
  id: number;
  name: string;
  locations: NamedAPIResource[];
  pokedexes: NamedAPIResource[];
  version_groups: NamedAPIResource[];
}

export type ResourceCategory =
  | 'pokemon'
  | 'type'
  | 'move'
  | 'ability'
  | 'item'
  | 'location'
  | 'region'
  | 'generation'
  | 'pokedex'
  | 'egg-group'
  | 'growth-rate'
  | 'nature'
  | 'stat'
  | 'pokemon-habitat'
  | 'pokemon-species'
  | 'pokemon-color'
  | 'pokemon-shape'
  | 'evolution-chain'
  | 'item-category'
  | 'item-attribute'
  | 'move-category'
  | 'move-battle-style'
  | 'encounter-method'
  | 'characteristic';

export interface FavoritePokemon {
  id: number;
  name: string;
  types?: string[];
  sprite?: string;
  addedAt: number;
}
