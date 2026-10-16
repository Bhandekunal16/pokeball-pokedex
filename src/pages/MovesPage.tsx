import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Swords, Info, ChevronRight } from 'lucide-react';
import { getResourceList, getMoveDetails, ApiError } from '../services/pokemonApi';
import { MoveDetail, NamedAPIResource } from '../types/pokemon';
import { capitalize, formatPokemonId } from '../utils/formatters';
import { TypeBadge } from '../components/TypeBadge';
import { PokeBallIcon } from '../components/PokeBallIcon';
import { Pagination } from '../components/Pagination';
import { SearchBar } from '../components/SearchBar';
import { ErrorMessage } from '../components/ErrorMessage';

export function MovesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const queryParam = searchParams.get('q') || '';

  const [currentPage, setCurrentPage] = useState(pageParam);
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [pageSize] = useState(20);

  const [movesList, setMovesList] = useState<NamedAPIResource[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedMove, setSelectedMove] = useState<MoveDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ message: string; statusCode?: number } | null>(null);

  const loadMoves = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const controller = new AbortController();

    try {
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        try {
          const detail = await getMoveDetails(query, controller.signal);
          setSelectedMove(detail);
          setMovesList([{ name: detail.name, url: `https://pokeapi.co/api/v2/move/${detail.id}/` }]);
          setTotalCount(1);
        } catch (err) {
          if (err instanceof ApiError && err.statusCode === 404) {
            setMovesList([]);
            setSelectedMove(null);
            setTotalCount(0);
          } else {
            throw err;
          }
        }
        setIsLoading(false);
        return;
      }

      const offset = (currentPage - 1) * pageSize;
      const res = await getResourceList('move', pageSize, offset, controller.signal);
      setMovesList(res.results);
      setTotalCount(res.count);

      if (res.results.length > 0 && !selectedMove) {
        loadMoveDetail(res.results[0].name);
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const apiErr = err instanceof ApiError ? err : null;
      setError({
        message: apiErr?.message || 'Failed to load battle moves database.',
        statusCode: apiErr?.statusCode,
      });
    } finally {
      setIsLoading(false);
    }

    return () => controller.abort();
  }, [currentPage, pageSize, searchQuery]);

  useEffect(() => {
    loadMoves();
  }, [loadMoves]);

  const loadMoveDetail = async (moveName: string) => {
    setIsDetailLoading(true);
    try {
      const detail = await getMoveDetails(moveName);
      setSelectedMove(detail);
    } catch (err) {
      console.error('Failed to load move detail', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
    const next = new URLSearchParams(searchParams);
    if (val) next.set('q', val);
    else next.delete('q');
    next.set('page', '1');
    setSearchParams(next, { replace: true });
  };

  const handlePageChange = (p: number) => {
    setCurrentPage(p);
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-[var(--color-border)]">
        <h1 className="text-2xl font-black text-[var(--color-text)] tracking-tight flex items-center gap-2.5">
          <PokeBallIcon size={24} />
          <span>Pokémon Moves Database</span>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border)] tabular-nums">
            {totalCount.toLocaleString()} TOTAL
          </span>
        </h1>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
          Explore battle attacks, damage classes, accuracy rates, and effect descriptions.
        </p>
      </div>

      <div className="max-w-md">
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search moves (e.g. Thunderbolt, Flamethrower, Earthquake)..."
        />
      </div>

      {error ? (
        <ErrorMessage
          title="Moves Catalog Error"
          message={error.message}
          statusCode={error.statusCode}
          onRetry={loadMoves}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: List of Moves */}
          <div className="lg:col-span-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-4 space-y-2 shadow-xs">
            <div className="text-xs font-bold text-[var(--color-text-secondary)] px-2 py-1 uppercase tracking-wider">
              Battle Moves Roster
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-12 bg-[var(--color-surface-secondary)] rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : movesList.length === 0 ? (
              <div className="text-center py-8 text-xs text-[var(--color-text-secondary)]">
                No moves matching your search.
              </div>
            ) : (
              <div className="space-y-1.5">
                {movesList.map((move) => {
                  const isSelected = selectedMove?.name === move.name;
                  return (
                    <button
                      key={move.name}
                      type="button"
                      onClick={() => loadMoveDetail(move.name)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#E53935]/15 border-[#E53935] text-[var(--color-text)] font-bold'
                          : 'bg-[var(--color-surface-secondary)] border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]'
                      }`}
                    >
                      <span className="text-xs capitalize">{capitalize(move.name)}</span>
                      <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-[#E53935]' : 'text-[var(--color-text-muted)]'}`} />
                    </button>
                  );
                })}
              </div>
            )}

            {!isLoading && totalCount > pageSize && (
              <div className="pt-2">
                <Pagination
                  currentPage={currentPage}
                  totalItems={totalCount}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>

          {/* Right Column: Move Details Inspector */}
          <div className="lg:col-span-7 sticky top-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            {isDetailLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-8 w-48 bg-[var(--color-surface-secondary)] rounded-xl" />
                <div className="h-20 bg-[var(--color-surface-secondary)] rounded-2xl" />
                <div className="grid grid-cols-4 gap-3">
                  <div className="h-16 bg-[var(--color-surface-secondary)] rounded-2xl" />
                  <div className="h-16 bg-[var(--color-surface-secondary)] rounded-2xl" />
                  <div className="h-16 bg-[var(--color-surface-secondary)] rounded-2xl" />
                  <div className="h-16 bg-[var(--color-surface-secondary)] rounded-2xl" />
                </div>
              </div>
            ) : selectedMove ? (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#E53935]">
                      MOVE {formatPokemonId(selectedMove.id)}
                    </span>
                    <h2 className="text-3xl font-black text-[var(--color-text)] tracking-tight mt-0.5">
                      {capitalize(selectedMove.name)}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <TypeBadge type={selectedMove.type.name} size="md" />
                    <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text)] capitalize">
                      {selectedMove.damage_class.name}
                    </span>
                  </div>
                </div>

                {/* Move Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-2xl p-3 text-center">
                    <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider block">
                      Power
                    </span>
                    <span className="text-xl font-mono font-black text-[#E53935] tabular-nums mt-0.5 block">
                      {selectedMove.power ?? '—'}
                    </span>
                  </div>

                  <div className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-2xl p-3 text-center">
                    <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider block">
                      Accuracy
                    </span>
                    <span className="text-xl font-mono font-black text-sky-500 tabular-nums mt-0.5 block">
                      {selectedMove.accuracy ? `${selectedMove.accuracy}%` : '—'}
                    </span>
                  </div>

                  <div className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-2xl p-3 text-center">
                    <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider block">
                      PP
                    </span>
                    <span className="text-xl font-mono font-black text-amber-500 tabular-nums mt-0.5 block">
                      {selectedMove.pp ?? '—'}
                    </span>
                  </div>

                  <div className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-2xl p-3 text-center">
                    <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider block">
                      Priority
                    </span>
                    <span className="text-xl font-mono font-black text-emerald-500 tabular-nums mt-0.5 block">
                      {selectedMove.priority}
                    </span>
                  </div>
                </div>

                {/* Effect & Description */}
                <div className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-3xl p-5 space-y-2">
                  <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#E53935]" /> Battle Effect
                  </span>
                  <p className="text-sm text-[var(--color-text)] leading-relaxed">
                    {selectedMove.effect_entries.find((e) => e.language.name === 'en')?.effect ||
                      selectedMove.flavor_text_entries?.find((f) => f.language.name === 'en')
                        ?.flavor_text ||
                      'No formal battle effect documented for this move.'}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-[var(--color-text-secondary)] text-sm">
                Select a move from the roster on the left to inspect its parameters.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
