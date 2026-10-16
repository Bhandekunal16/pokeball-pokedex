import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { formatPokemonId, capitalize, getOfficialArtwork, getFallbackArtwork, getTypeStyle } from '../utils/formatters';
import { TypeBadge } from './TypeBadge';
import { PokeBallIcon } from './PokeBallIcon';
import { useFavorites } from '../hooks/useFavorites';

export interface PokemonCardData {
  id: number;
  name: string;
  types?: string[];
  sprite?: string;
  url?: string;
}

interface PokemonCardProps {
  pokemon: PokemonCardData;
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [imgSrc, setImgSrc] = useState<string>(
    pokemon.sprite || getOfficialArtwork(pokemon.id)
  );
  const [imgError, setImgError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const primaryType = pokemon.types && pokemon.types.length > 0 ? pokemon.types[0] : 'normal';
  const typeStyle = getTypeStyle(primaryType);
  const favorite = isFavorite(pokemon.id);

  const handleImageError = () => {
    if (imgSrc !== getFallbackArtwork(pokemon.id)) {
      setImgSrc(getFallbackArtwork(pokemon.id));
    } else {
      setImgError(true);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({
      id: pokemon.id,
      name: pokemon.name,
      types: pokemon.types,
      sprite: pokemon.sprite || getOfficialArtwork(pokemon.id),
    });
  };

  return (
    <div
      className="group relative flex flex-col justify-between bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[#E53935]/60 rounded-3xl p-4.5 transition-all duration-300 hover:shadow-xl hover:shadow-black/15 dark:hover:shadow-black/40 hover:-translate-y-1 overflow-hidden"
    >
      {/* Background subtle Poké Ball watermark */}
      <div className="absolute -right-8 -bottom-8 opacity-[0.04] dark:opacity-[0.06] group-hover:opacity-[0.10] group-hover:rotate-45 transition-all duration-500 pointer-events-none">
        <PokeBallIcon size={160} />
      </div>

      {/* Subtle type-based aura on card hover */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 25%, ${typeStyle.glow} 0%, transparent 70%)`,
        }}
      />

      {/* Card Header: Pokédex # and Favorite toggle */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="font-mono text-xs font-extrabold text-[var(--color-text-secondary)] group-hover:text-[#E53935] tracking-wider tabular-nums transition-colors">
          {formatPokemonId(pokemon.id)}
        </span>

        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={favorite ? `Remove ${pokemon.name} from favorites` : `Add ${pokemon.name} to favorites`}
          className="p-1.5 rounded-xl text-[var(--color-text-secondary)] hover:text-[#E53935] hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 transition-transform duration-200 active:scale-125 ${
              favorite ? 'fill-[#E53935] text-[#E53935]' : 'text-[var(--color-text-muted)] hover:text-[#E53935]'
            }`}
          />
        </button>
      </div>

      {/* Artwork Display with compatible neutral backdrop */}
      <Link
        to={`/pokemon/${pokemon.id}`}
        className="relative z-10 my-3 flex items-center justify-center h-40 focus:outline-none"
      >
        <div className="relative w-36 h-36 flex items-center justify-center rounded-2xl bg-black/[0.02] dark:bg-white/[0.02]">
          {!imgError ? (
            <>
              {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <PokeBallIcon size={28} spinning />
                </div>
              )}
              <img
                src={imgSrc}
                alt={pokemon.name}
                loading="lazy"
                referrerPolicy="no-referrer"
                onLoad={() => setIsLoaded(true)}
                onError={handleImageError}
                className={`max-w-full max-h-full object-contain filter drop-shadow-md group-hover:drop-shadow-xl group-hover:scale-110 transition-all duration-300 ${
                  isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </>
          ) : (
            <div className="w-24 h-24 rounded-full bg-[var(--color-surface-secondary)] flex items-center justify-center text-[var(--color-text-secondary)]">
              <span className="text-xl font-bold font-mono">#{pokemon.id}</span>
            </div>
          )}
        </div>
      </Link>

      {/* Card Body: Name & Elemental Types */}
      <div className="relative z-10 pt-2.5 border-t border-[var(--color-border-subtle)]">
        <Link to={`/pokemon/${pokemon.id}`} className="block focus:outline-none group/title">
          <h3 className="text-base font-extrabold text-[var(--color-text)] group-hover/title:text-[#E53935] transition-colors truncate">
            {capitalize(pokemon.name)}
          </h3>
        </Link>

        {pokemon.types && pokemon.types.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {pokemon.types.map((type) => (
              <TypeBadge key={type} type={type} size="sm" />
            ))}
          </div>
        ) : (
          <div className="mt-2 text-[11px] text-[var(--color-text-muted)] font-medium">
            Inspect Pokédex entry →
          </div>
        )}
      </div>
    </div>
  );
}
