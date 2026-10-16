import { PokemonCard, PokemonCardData } from './PokemonCard';
import { PokemonGridSkeleton } from './LoadingSkeleton';
import { FilterX } from 'lucide-react';
import { PokeBallIcon } from './PokeBallIcon';

interface PokemonGridProps {
  pokemonList: PokemonCardData[];
  isLoading: boolean;
  onClearFilters?: () => void;
  emptyTitle?: string;
  emptyMessage?: string;
}

export function PokemonGrid({
  pokemonList,
  isLoading,
  onClearFilters,
  emptyTitle = 'No Pokémon Found',
  emptyMessage = 'No Pokémon matched your current search and type filters. Try adjusting your query or resetting filters.',
}: PokemonGridProps) {
  if (isLoading) {
    return <PokemonGridSkeleton count={24} />;
  }

  if (pokemonList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl my-6 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-secondary)] flex items-center justify-center text-[var(--color-text-secondary)] mb-4">
          <PokeBallIcon size={36} />
        </div>
        <h3 className="text-lg font-black text-[var(--color-text)]">{emptyTitle}</h3>
        <p className="text-sm text-[var(--color-text-secondary)] max-w-md mt-1 mb-5">{emptyMessage}</p>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#E53935] hover:bg-[#C62828] active:scale-95 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <FilterX className="w-4 h-4" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {pokemonList.map((mon) => (
        <PokemonCard key={mon.id} pokemon={mon} />
      ))}
    </div>
  );
}
