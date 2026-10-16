import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Shield, Zap, Flame } from 'lucide-react';
import { formatPokemonId, capitalize, getOfficialArtwork, getTypeStyle } from '../utils/formatters';
import { TypeBadge } from './TypeBadge';
import { PokeBallIcon } from './PokeBallIcon';
import { useFavorites } from '../hooks/useFavorites';

const FEATURED_ROSTER = [
  {
    id: 6,
    name: 'charizard',
    title: 'The Flame Pokémon',
    types: ['fire', 'flying'],
    hp: 78,
    attack: 84,
    speed: 100,
    description: 'Spits fire that is hot enough to melt boulders. Known to cause forest fires unintentionally.',
  },
  {
    id: 25,
    name: 'pikachu',
    title: 'The Mouse Pokémon',
    types: ['electric'],
    hp: 35,
    attack: 55,
    speed: 90,
    description: 'When several of these Pokémon gather, their electricity can build and cause lightning storms.',
  },
  {
    id: 94,
    name: 'gengar',
    title: 'The Shadow Pokémon',
    types: ['ghost', 'poison'],
    hp: 60,
    attack: 65,
    speed: 110,
    description: 'Under a full moon, this Pokémon likes to mimic the shadows of people and laugh at their fright.',
  },
  {
    id: 150,
    name: 'mewtwo',
    title: 'The Genetic Pokémon',
    types: ['psychic'],
    hp: 106,
    attack: 110,
    speed: 130,
    description: 'It was created by a scientist after years of horrific gene-splicing and DNA engineering experiments.',
  },
  {
    id: 448,
    name: 'lucario',
    title: 'The Aura Pokémon',
    types: ['fighting', 'steel'],
    hp: 70,
    attack: 110,
    speed: 90,
    description: 'By reading the auras of its opponents, it can predict their actions and perceive their thoughts.',
  },
];

export function FeaturedPokemon() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isFavorite, toggleFavorite } = useFavorites();

  const current = FEATURED_ROSTER[currentIndex];
  const typeStyle = getTypeStyle(current.types[0]);
  const favorite = isFavorite(current.id);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FEATURED_ROSTER.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl transition-all duration-300">
      {/* Background Poké Ball watermark silhouette */}
      <div className="absolute -right-16 -top-16 opacity-[0.04] dark:opacity-[0.07] pointer-events-none">
        <PokeBallIcon size={380} />
      </div>

      {/* Subtle type-colored ambient glow */}
      <div
        className="absolute -right-20 -top-20 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
        style={{ background: typeStyle.accent }}
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-8 lg:p-10">
        {/* Left Column: Info & Stats */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider text-white bg-[#E53935] px-2.5 py-0.5 rounded-full uppercase shadow-xs">
              <PokeBallIcon size={12} />
              <span>Featured Champion</span>
            </span>
            <span className="text-xs font-mono font-bold text-[var(--color-text-secondary)] tabular-nums">
              {formatPokemonId(current.id)}
            </span>
          </div>

          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-[var(--color-text)] tracking-tight">
              {capitalize(current.name)}
            </h2>
            <p className="text-sm font-semibold text-[var(--color-text-secondary)] mt-1">
              {current.title}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {current.types.map((t) => (
              <TypeBadge key={t} type={t} size="md" />
            ))}
          </div>

          <p className="text-sm text-[var(--color-text-secondary)] max-w-xl leading-relaxed">
            {current.description}
          </p>

          {/* Quick Stat strip */}
          <div className="grid grid-cols-3 gap-3 pt-2 max-w-md">
            <div className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-2xl p-3">
              <div className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-500" /> HP
              </div>
              <div className="text-lg font-black font-mono text-[var(--color-text)] tabular-nums mt-0.5">
                {current.hp}
              </div>
            </div>

            <div className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-2xl p-3">
              <div className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase flex items-center gap-1">
                <Flame className="w-3 h-3 text-[#E53935]" /> ATK
              </div>
              <div className="text-lg font-black font-mono text-[var(--color-text)] tabular-nums mt-0.5">
                {current.attack}
              </div>
            </div>

            <div className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-2xl p-3">
              <div className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" /> SPD
              </div>
              <div className="text-lg font-black font-mono text-[var(--color-text)] tabular-nums mt-0.5">
                {current.speed}
              </div>
            </div>
          </div>

          {/* Action Row & Carousel Navigation */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link
              to={`/pokemon/${current.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#E53935] hover:bg-[#C62828] active:scale-95 rounded-xl transition-all shadow-md shadow-[#E53935]/30 cursor-pointer"
            >
              <span>Explore Pokédex File</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={() =>
                toggleFavorite({
                  id: current.id,
                  name: current.name,
                  types: current.types,
                  sprite: getOfficialArtwork(current.id),
                })
              }
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                favorite
                  ? 'bg-[#E53935]/15 border-[#E53935] text-[#E53935]'
                  : 'bg-[var(--color-surface-secondary)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[#E53935]/60'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${
                  favorite ? 'fill-[#E53935] text-[#E53935]' : 'text-[var(--color-text-secondary)]'
                }`}
              />
              <span>{favorite ? 'In Your Squad' : 'Add to Squad'}</span>
            </button>

            {/* Carousel navigation pills */}
            <div className="flex items-center gap-1.5 ml-auto">
              {FEATURED_ROSTER.map((mon, idx) => (
                <button
                  key={mon.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentIndex
                      ? 'w-6 bg-[#E53935]'
                      : 'w-2 bg-[var(--color-border)] hover:bg-[var(--color-text-secondary)]'
                  }`}
                  aria-label={`View ${mon.name}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Hero Artwork */}
        <div className="lg:col-span-5 flex items-center justify-center relative">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-40 transition-colors duration-700"
              style={{ background: typeStyle.accent }}
            />
            <img
              src={getOfficialArtwork(current.id)}
              alt={current.name}
              className="relative z-10 max-h-full max-w-full object-contain filter drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
