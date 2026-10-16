import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ArrowLeft, ArrowUpDown } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { PokemonGrid } from '../components/PokemonGrid';
import { PokemonCardData } from '../components/PokemonCard';
import { PokeBallIcon } from '../components/PokeBallIcon';

export function Favorites() {
  const { favorites, clearFavorites } = useFavorites();
  const [sortOrder, setSortOrder] = useState<'id_asc' | 'id_desc' | 'name_asc' | 'name_desc'>('id_asc');

  const sortedList: PokemonCardData[] = [...favorites].sort((a, b) => {
    if (sortOrder === 'id_asc') return a.id - b.id;
    if (sortOrder === 'id_desc') return b.id - a.id;
    if (sortOrder === 'name_asc') return a.name.localeCompare(b.name);
    return b.name.localeCompare(a.name);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[var(--color-border)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/"
              className="text-xs font-bold text-[#E53935] hover:underline inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Pokédex</span>
            </Link>
          </div>
          <h1 className="text-2xl font-black text-[var(--color-text)] tracking-tight flex items-center gap-2.5">
            <PokeBallIcon size={26} />
            <span>My Favorite Pokémon Squad</span>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[#E53935]/15 text-[#E53935] border border-[#E53935]/30 tabular-nums">
              {favorites.length} SQUAD MEMBERS
            </span>
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Your customized Pokémon team preserved locally in browser storage across sessions.
          </p>
        </div>

        {favorites.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl px-3 py-2 text-xs text-[var(--color-text-secondary)] shadow-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#E53935] mr-2 shrink-0" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="bg-transparent text-[var(--color-text)] text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="id_asc" className="bg-[var(--color-surface)] text-[var(--color-text)]">
                  Pokédex # (Lowest)
                </option>
                <option value="id_desc" className="bg-[var(--color-surface)] text-[var(--color-text)]">
                  Pokédex # (Highest)
                </option>
                <option value="name_asc" className="bg-[var(--color-surface)] text-[var(--color-text)]">
                  Name (A to Z)
                </option>
                <option value="name_desc" className="bg-[var(--color-surface)] text-[var(--color-text)]">
                  Name (Z to A)
                </option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear your favorite Pokémon squad?')) {
                  clearFavorites();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#E53935] hover:text-white bg-[#E53935]/10 hover:bg-[#E53935] border border-[#E53935]/30 rounded-2xl transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Squad</span>
            </button>
          </div>
        )}
      </div>

      <PokemonGrid
        pokemonList={sortedList}
        isLoading={false}
        emptyTitle="Your Pokémon Squad is Empty"
        emptyMessage="Tap the heart icon on any Pokémon card in the collection or details page to add them to your squad."
      />
    </div>
  );
}
