import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Zap, Info, Users, ChevronRight } from 'lucide-react';
import { getResourceList, getAbilityDetails, ApiError } from '../services/pokemonApi';
import { AbilityDetail, NamedAPIResource } from '../types/pokemon';
import { capitalize, formatPokemonId, extractIdFromUrl } from '../utils/formatters';
import { PokeBallIcon } from '../components/PokeBallIcon';
import { Pagination } from '../components/Pagination';
import { SearchBar } from '../components/SearchBar';
import { ErrorMessage } from '../components/ErrorMessage';

export function AbilitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const queryParam = searchParams.get('q') || '';

  const [currentPage, setCurrentPage] = useState(pageParam);
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [pageSize] = useState(20);

  const [abilitiesList, setAbilitiesList] = useState<NamedAPIResource[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedAbility, setSelectedAbility] = useState<AbilityDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ message: string; statusCode?: number } | null>(null);

  const loadAbilities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const controller = new AbortController();

    try {
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        try {
          const detail = await getAbilityDetails(query, controller.signal);
          setSelectedAbility(detail);
          setAbilitiesList([{ name: detail.name, url: `https://pokeapi.co/api/v2/ability/${detail.id}/` }]);
          setTotalCount(1);
        } catch (err) {
          if (err instanceof ApiError && err.statusCode === 404) {
            setAbilitiesList([]);
            setSelectedAbility(null);
            setTotalCount(0);
          } else {
            throw err;
          }
        }
        setIsLoading(false);
        return;
      }

      const offset = (currentPage - 1) * pageSize;
      const res = await getResourceList('ability', pageSize, offset, controller.signal);
      setAbilitiesList(res.results);
      setTotalCount(res.count);

      if (res.results.length > 0 && !selectedAbility) {
        loadAbilityDetail(res.results[0].name);
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const apiErr = err instanceof ApiError ? err : null;
      setError({
        message: apiErr?.message || 'Failed to load abilities catalogue.',
        statusCode: apiErr?.statusCode,
      });
    } finally {
      setIsLoading(false);
    }

    return () => controller.abort();
  }, [currentPage, pageSize, searchQuery]);

  useEffect(() => {
    loadAbilities();
  }, [loadAbilities]);

  const loadAbilityDetail = async (abilityName: string) => {
    setIsDetailLoading(true);
    try {
      const detail = await getAbilityDetails(abilityName);
      setSelectedAbility(detail);
    } catch (err) {
      console.error('Failed to load ability details', err);
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
          <span>Pokémon Abilities Catalog</span>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border)] tabular-nums">
            {totalCount.toLocaleString()} TOTAL
          </span>
        </h1>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
          Review innate powers, passive modifiers, and Pokémon possessing each trait.
        </p>
      </div>

      <div className="max-w-md">
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search ability (e.g. Overgrow, Intimidate, Levitate)..."
        />
      </div>

      {error ? (
        <ErrorMessage
          title="Abilities Catalog Error"
          message={error.message}
          statusCode={error.statusCode}
          onRetry={loadAbilities}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: List */}
          <div className="lg:col-span-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-4 space-y-2 shadow-xs">
            <div className="text-xs font-bold text-[var(--color-text-secondary)] px-2 py-1 uppercase tracking-wider">
              Abilities Roster
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-12 bg-[var(--color-surface-secondary)] rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : abilitiesList.length === 0 ? (
              <div className="text-center py-8 text-xs text-[var(--color-text-secondary)]">
                No abilities found.
              </div>
            ) : (
              <div className="space-y-1.5">
                {abilitiesList.map((item) => {
                  const isSelected = selectedAbility?.name === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => loadAbilityDetail(item.name)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#E53935]/15 border-[#E53935] text-[var(--color-text)] font-bold'
                          : 'bg-[var(--color-surface-secondary)] border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]'
                      }`}
                    >
                      <span className="text-xs capitalize">{capitalize(item.name)}</span>
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

          {/* Right Column: Ability Detail */}
          <div className="lg:col-span-7 sticky top-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            {isDetailLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-8 w-48 bg-[var(--color-surface-secondary)] rounded-xl" />
                <div className="h-24 bg-[var(--color-surface-secondary)] rounded-2xl" />
              </div>
            ) : selectedAbility ? (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#E53935]">
                      ABILITY {formatPokemonId(selectedAbility.id)}
                    </span>
                    <h2 className="text-3xl font-black text-[var(--color-text)] tracking-tight mt-0.5">
                      {capitalize(selectedAbility.name)}
                    </h2>
                  </div>

                  {selectedAbility.generation && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text)] uppercase">
                      {capitalize(selectedAbility.generation.name)}
                    </span>
                  )}
                </div>

                {/* Effect Description */}
                <div className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-3xl p-5 space-y-2">
                  <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#E53935]" /> Effect Description
                  </span>
                  <p className="text-sm text-[var(--color-text)] leading-relaxed">
                    {selectedAbility.effect_entries.find((e) => e.language.name === 'en')?.effect ||
                      selectedAbility.effect_entries.find((e) => e.language.name === 'en')
                        ?.short_effect ||
                      'No detailed description found in English.'}
                  </p>
                </div>

                {/* Pokémon with this Ability */}
                {selectedAbility.pokemon && selectedAbility.pokemon.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#E53935]" /> Pokémon Possessing This Trait (
                      {selectedAbility.pokemon.length})
                    </span>

                    <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1">
                      {selectedAbility.pokemon.map((p) => {
                        const pokeId = extractIdFromUrl(p.pokemon.url);
                        return (
                          <Link
                            key={p.pokemon.name}
                            to={`/pokemon/${pokeId || p.pokemon.name}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-xs text-[var(--color-text)] hover:border-[#E53935] hover:text-[#E53935] transition-colors"
                          >
                            <span className="font-semibold">{capitalize(p.pokemon.name)}</span>
                            {p.is_hidden && (
                              <span className="text-[9px] text-purple-600 dark:text-purple-400 font-bold uppercase">
                                (Hidden)
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 text-[var(--color-text-secondary)] text-sm">
                Select an ability from the roster to review its properties.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
