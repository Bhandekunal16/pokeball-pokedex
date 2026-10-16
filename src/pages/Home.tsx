import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  ArrowUpDown,
  Heart,
  RotateCcw,
} from 'lucide-react';
import {
  getPokemonList,
  getPokemonByNameOrId,
  getPokemonByType,
  ApiError,
} from '../services/pokemonApi';
import { PokemonCardData } from '../components/PokemonCard';
import { PokemonGrid } from '../components/PokemonGrid';
import { SearchBar } from '../components/SearchBar';
import { Pagination } from '../components/Pagination';
import { ErrorMessage } from '../components/ErrorMessage';
import { FeaturedPokemon } from '../components/FeaturedPokemon';
import { TypeBadge } from '../components/TypeBadge';
import { PokeBallIcon } from '../components/PokeBallIcon';
import { useFavorites } from '../hooks/useFavorites';
import { extractIdFromUrl } from '../utils/formatters';

const POPULAR_TYPES = [
  'all',
  'fire',
  'water',
  'grass',
  'electric',
  'psychic',
  'ice',
  'dragon',
  'dark',
  'fairy',
  'fighting',
  'poison',
  'ground',
  'flying',
  'bug',
  'rock',
  'ghost',
  'steel',
  'normal',
];

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams();

  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const typeParam = searchParams.get('type') || 'all';
  const queryParam = searchParams.get('q') || '';
  const sortParam = searchParams.get('sort') || 'id_asc';
  const sizeParam = parseInt(searchParams.get('size') || '24', 10);
  const favOnlyParam = searchParams.get('fav') === 'true';

  const [currentPage, setCurrentPage] = useState(pageParam);
  const [selectedType, setSelectedType] = useState(typeParam);
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [sortOrder, setSortOrder] = useState<'id_asc' | 'id_desc' | 'name_asc' | 'name_desc'>(
    (sortParam as any) || 'id_asc'
  );
  const [pageSize, setPageSize] = useState(sizeParam);
  const [favoritesOnly, setFavoritesOnly] = useState(favOnlyParam);

  const [pokemonItems, setPokemonItems] = useState<PokemonCardData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<{ message: string; statusCode?: number } | null>(null);

  const { favorites } = useFavorites();

  const updateUrlParams = useCallback(
    (updates: Record<string, string | number | boolean | null>) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === '' || val === 'all' || val === false || (key === 'page' && val === 1)) {
          next.delete(key);
        } else {
          next.set(key, String(val));
        }
      });
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const controller = new AbortController();

    try {
      // 1. Direct Search Query Mode
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        try {
          const detail = await getPokemonByNameOrId(query, controller.signal);
          const mapped: PokemonCardData = {
            id: detail.id,
            name: detail.name,
            types: detail.types.map((t) => t.type.name),
            sprite:
              detail.sprites.other?.['official-artwork']?.front_default ||
              detail.sprites.front_default ||
              undefined,
          };
          setPokemonItems([mapped]);
          setTotalCount(1);
        } catch (err) {
          if (err instanceof ApiError && err.statusCode === 404) {
            setPokemonItems([]);
            setTotalCount(0);
          } else {
            throw err;
          }
        }
        setIsLoading(false);
        return;
      }

      // 2. Favorites-only Mode
      if (favoritesOnly) {
        let favList: PokemonCardData[] = favorites.map((f) => ({
          id: f.id,
          name: f.name,
          types: f.types,
          sprite: f.sprite,
        }));

        if (selectedType !== 'all') {
          favList = favList.filter((f) => f.types?.includes(selectedType));
        }

        favList.sort((a, b) => {
          if (sortOrder === 'id_asc') return a.id - b.id;
          if (sortOrder === 'id_desc') return b.id - a.id;
          if (sortOrder === 'name_asc') return a.name.localeCompare(b.name);
          return b.name.localeCompare(a.name);
        });

        setTotalCount(favList.length);
        const start = (currentPage - 1) * pageSize;
        setPokemonItems(favList.slice(start, start + pageSize));
        setIsLoading(false);
        return;
      }

      // 3. Type-filtered Mode
      if (selectedType !== 'all') {
        const typeData = await getPokemonByType(selectedType, controller.signal);
        const mappedList: PokemonCardData[] = typeData.pokemon.map((entry) => {
          const id = extractIdFromUrl(entry.pokemon.url);
          return {
            id,
            name: entry.pokemon.name,
            types: [selectedType],
            url: entry.pokemon.url,
          };
        });

        mappedList.sort((a, b) => {
          if (sortOrder === 'id_asc') return a.id - b.id;
          if (sortOrder === 'id_desc') return b.id - a.id;
          if (sortOrder === 'name_asc') return a.name.localeCompare(b.name);
          return b.name.localeCompare(a.name);
        });

        setTotalCount(mappedList.length);
        const start = (currentPage - 1) * pageSize;
        setPokemonItems(mappedList.slice(start, start + pageSize));
        setIsLoading(false);
        return;
      }

      // 4. Standard Paginated API Collection
      const offset = (currentPage - 1) * pageSize;
      const listRes = await getPokemonList(pageSize, offset, controller.signal);

      const mapped: PokemonCardData[] = listRes.results.map((res) => {
        const id = extractIdFromUrl(res.url);
        return {
          id,
          name: res.name,
          url: res.url,
        };
      });

      if (sortOrder === 'name_asc') {
        mapped.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortOrder === 'name_desc') {
        mapped.sort((a, b) => b.name.localeCompare(a.name));
      } else if (sortOrder === 'id_desc') {
        mapped.sort((a, b) => b.id - a.id);
      }

      setPokemonItems(mapped);
      setTotalCount(listRes.count);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const apiErr = err instanceof ApiError ? err : null;
      setError({
        message: apiErr ? apiErr.message : 'Failed to retrieve Pokémon data.',
        statusCode: apiErr?.statusCode,
      });
    } finally {
      setIsLoading(false);
    }

    return () => controller.abort();
  }, [searchQuery, favoritesOnly, selectedType, currentPage, pageSize, sortOrder, favorites]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
    updateUrlParams({ q: val, page: 1 });
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setCurrentPage(1);
    updateUrlParams({ type, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateUrlParams({ page: newPage });
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    updateUrlParams({ size: newSize, page: 1 });
  };

  const handleSortChange = (newSort: any) => {
    setSortOrder(newSort);
    updateUrlParams({ sort: newSort });
  };

  const handleFavoritesToggle = () => {
    const nextVal = !favoritesOnly;
    setFavoritesOnly(nextVal);
    setCurrentPage(1);
    updateUrlParams({ fav: nextVal, page: 1 });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setFavoritesOnly(false);
    setSortOrder('id_asc');
    setCurrentPage(1);
    setSearchParams({}, { replace: true });
  };

  const isFiltered = Boolean(
    searchQuery.trim() || selectedType !== 'all' || favoritesOnly || sortOrder !== 'id_asc'
  );

  return (
    <div className="space-y-10">
      {/* Featured Champion Spotlight */}
      {!searchQuery && <FeaturedPokemon />}

      {/* Main Exploration Section */}
      <section className="space-y-6">
        {/* Section Header with Poké Ball Red Accents */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[var(--color-border)]">
          <div>
            <h1 className="text-2xl font-black text-[var(--color-text)] tracking-tight flex items-center gap-2.5">
              <PokeBallIcon size={24} />
              <span>National Pokédex Collection</span>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border)] tabular-nums">
                {totalCount.toLocaleString()} TOTAL
              </span>
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Browse, filter by elemental affinity, search by ID or name, and inspect battle parameters.
            </p>
          </div>

          {/* Quick Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFavoritesToggle}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                favoritesOnly
                  ? 'bg-[#E53935] text-white border-[#E53935] shadow-xs'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[#E53935] hover:text-[var(--color-text)]'
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  favoritesOnly ? 'fill-white text-white' : 'text-[#E53935]'
                }`}
              />
              <span>Squad Only</span>
            </button>

            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-xl transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Search and Sort Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search Pokémon by name or Pokédex number (e.g. Lucario or 448)..."
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            {/* Sort Selector */}
            <div className="relative flex items-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl px-3 py-2 text-xs text-[var(--color-text-secondary)] w-full sm:w-auto shadow-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#E53935] mr-2 shrink-0" />
              <select
                value={sortOrder}
                onChange={(e) => handleSortChange(e.target.value)}
                aria-label="Sort collection by"
                className="bg-transparent text-[var(--color-text)] text-xs font-semibold focus:outline-none cursor-pointer pr-4"
              >
                <option value="id_asc" className="bg-[var(--color-surface)] text-[var(--color-text)]">
                  Pokédex # (Lowest First)
                </option>
                <option value="id_desc" className="bg-[var(--color-surface)] text-[var(--color-text)]">
                  Pokédex # (Highest First)
                </option>
                <option value="name_asc" className="bg-[var(--color-surface)] text-[var(--color-text)]">
                  Name (A to Z)
                </option>
                <option value="name_desc" className="bg-[var(--color-surface)] text-[var(--color-text)]">
                  Name (Z to A)
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Elemental Type Filter Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
            <span className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#E53935]" /> Filter by Elemental Type:
            </span>
            {selectedType !== 'all' && (
              <span>
                Active: <strong className="text-[#E53935] uppercase">{selectedType}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none py-1">
            <button
              type="button"
              onClick={() => handleTypeSelect('all')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl uppercase tracking-wide transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                selectedType === 'all'
                  ? 'bg-[#E53935] text-white shadow-sm'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-secondary)] border border-[var(--color-border)]'
              }`}
            >
              All Types
            </button>

            {POPULAR_TYPES.filter((t) => t !== 'all').map((type) => (
              <TypeBadge
                key={type}
                type={type}
                size="md"
                interactive
                active={selectedType === type}
                onClick={() => handleTypeSelect(type)}
              />
            ))}
          </div>
        </div>

        {/* Content Section: Error / Grid / Pagination */}
        {error ? (
          <ErrorMessage
            title="Failed to Retrieve Pokémon"
            message={error.message}
            statusCode={error.statusCode}
            onRetry={loadData}
            onResetFilters={handleResetFilters}
          />
        ) : (
          <>
            <PokemonGrid
              pokemonList={pokemonItems}
              isLoading={isLoading}
              onClearFilters={handleResetFilters}
              emptyTitle={
                searchQuery
                  ? `No Pokémon found matching "${searchQuery}"`
                  : favoritesOnly
                  ? 'No favorite Pokémon saved yet'
                  : 'No Pokémon found'
              }
              emptyMessage={
                searchQuery
                  ? 'Try searching by a full English name or numeric Pokédex ID like "pikachu", "charizard", or "25".'
                  : favoritesOnly
                  ? 'Click the heart icon on any Pokémon card to save it to your personal favorites collection.'
                  : 'No results found for the active type filter.'
              }
            />

            {!isLoading && totalCount > pageSize && (
              <Pagination
                currentPage={currentPage}
                totalItems={totalCount}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </>
        )}
      </section>
    </div>
  );
}
