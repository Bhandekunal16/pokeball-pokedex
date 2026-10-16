import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Code2,
  ChevronRight,
} from 'lucide-react';
import { getResourceList, getResourceByValue, ApiError } from '../services/pokemonApi';
import { ResourceCategory, NamedAPIResource } from '../types/pokemon';
import { ALL_RESOURCE_CATEGORIES, capitalize, formatPokemonId } from '../utils/formatters';
import { PokeBallIcon } from '../components/PokeBallIcon';
import { Pagination } from '../components/Pagination';
import { SearchBar } from '../components/SearchBar';
import { ErrorMessage } from '../components/ErrorMessage';

export function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = (searchParams.get('category') as ResourceCategory) || 'generation';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const queryParam = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory>(categoryParam);
  const [currentPage, setCurrentPage] = useState(pageParam);
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [pageSize] = useState(20);

  const [itemsList, setItemsList] = useState<NamedAPIResource[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedItemData, setSelectedItemData] = useState<any>(null);
  const [selectedItemName, setSelectedItemName] = useState<string>('');
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ message: string; statusCode?: number } | null>(null);

  const activeCategoryMeta =
    ALL_RESOURCE_CATEGORIES.find((c) => c.key === selectedCategory) || ALL_RESOURCE_CATEGORIES[0];

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const controller = new AbortController();

    try {
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        try {
          const detail = await getResourceByValue<any>(selectedCategory, query, controller.signal);
          setSelectedItemData(detail);
          setSelectedItemName(query);
          setItemsList([{ name: query, url: '' }]);
          setTotalCount(1);
        } catch (err) {
          if (err instanceof ApiError && err.statusCode === 404) {
            setItemsList([]);
            setSelectedItemData(null);
            setSelectedItemName('');
            setTotalCount(0);
          } else {
            throw err;
          }
        }
        setIsLoading(false);
        return;
      }

      const offset = (currentPage - 1) * pageSize;
      const res = await getResourceList(selectedCategory, pageSize, offset, controller.signal);
      setItemsList(res.results);
      setTotalCount(res.count);

      if (res.results.length > 0) {
        loadDetail(res.results[0].name);
      } else {
        setSelectedItemData(null);
        setSelectedItemName('');
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const apiErr = err instanceof ApiError ? err : null;
      setError({
        message: apiErr?.message || `Failed to query "${selectedCategory}" resources.`,
        statusCode: apiErr?.statusCode,
      });
    } finally {
      setIsLoading(false);
    }

    return () => controller.abort();
  }, [selectedCategory, currentPage, pageSize, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadDetail = async (value: string) => {
    setIsDetailLoading(true);
    setSelectedItemName(value);
    try {
      const detail = await getResourceByValue<any>(selectedCategory, value);
      setSelectedItemData(detail);
    } catch (err) {
      console.error(err);
      setSelectedItemData(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleCategoryChange = (cat: ResourceCategory) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    setSearchQuery('');
    setSelectedItemData(null);
    const next = new URLSearchParams(searchParams);
    next.set('category', cat);
    next.delete('q');
    next.set('page', '1');
    setSearchParams(next, { replace: true });
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

  const renderDynamicSummary = (data: any) => {
    if (!data || typeof data !== 'object') return null;

    const entries = Object.entries(data).filter(
      ([key, val]) =>
        val !== null &&
        val !== undefined &&
        typeof val !== 'object' &&
        !['id', 'name'].includes(key)
    );

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {entries.slice(0, 6).map(([key, val]) => (
          <div key={key} className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-2xl p-3">
            <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider block">
              {capitalize(key)}
            </span>
            <span className="text-xs font-mono font-bold text-[var(--color-text)] truncate block mt-0.5">
              {String(val)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-3 border-b border-[var(--color-border)]">
        <h1 className="text-2xl font-black text-[var(--color-text)] tracking-tight flex items-center gap-2.5">
          <PokeBallIcon size={24} />
          <span>Universal 24-Resource Pokédex Explorer</span>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border)] tabular-nums">
            {totalCount.toLocaleString()} TOTAL
          </span>
        </h1>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
          Direct access to all 24 PokeAPI resource specifications, growth curves, egg groups, evolutions, and battle styles.
        </p>
      </div>

      {/* Category Horizontal Filter Buttons */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
          Resource Category ({ALL_RESOURCE_CATEGORIES.length} Categories):
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none py-1">
          {ALL_RESOURCE_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => handleCategoryChange(cat.key)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-[#E53935] text-white shadow-sm'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-secondary)] border border-[var(--color-border)]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar with sample hint */}
      <div className="max-w-md">
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={`Search ${activeCategoryMeta.name} (e.g. "${activeCategoryMeta.sampleValue}")...`}
        />
      </div>

      {error ? (
        <ErrorMessage
          title="Resource Query Error"
          message={error.message}
          statusCode={error.statusCode}
          onRetry={loadData}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Paginated List */}
          <div className="lg:col-span-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-4 space-y-2 shadow-xs">
            <div className="text-xs font-bold text-[var(--color-text-secondary)] px-2 py-1 uppercase tracking-wider flex items-center justify-between">
              <span>{activeCategoryMeta.name} Results</span>
              <span className="font-mono font-bold text-[var(--color-text-muted)] tabular-nums">Page {currentPage}</span>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-12 bg-[var(--color-surface-secondary)] rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : itemsList.length === 0 ? (
              <div className="text-center py-8 text-xs text-[var(--color-text-secondary)]">
                No items found.
              </div>
            ) : (
              <div className="space-y-1.5">
                {itemsList.map((item) => {
                  const isSelected = selectedItemName === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => loadDetail(item.name)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#E53935]/15 border-[#E53935] text-[var(--color-text)] font-bold'
                          : 'bg-[var(--color-surface-secondary)] border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]'
                      }`}
                    >
                      <span className="text-xs capitalize font-semibold">{capitalize(item.name)}</span>
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

          {/* Right Column: Dynamic Resource Inspector */}
          <div className="lg:col-span-7 sticky top-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            {isDetailLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-8 w-48 bg-[var(--color-surface-secondary)] rounded-xl" />
                <div className="h-20 bg-[var(--color-surface-secondary)] rounded-2xl" />
                <div className="h-48 bg-[var(--color-surface-secondary)] rounded-2xl" />
              </div>
            ) : selectedItemData ? (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#E53935] uppercase">
                      {selectedCategory} {selectedItemData.id ? formatPokemonId(selectedItemData.id) : ''}
                    </span>
                    <h2 className="text-3xl font-black text-[var(--color-text)] tracking-tight mt-0.5 capitalize">
                      {capitalize(selectedItemData.name || selectedItemName)}
                    </h2>
                  </div>

                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text)] uppercase">
                    {selectedCategory}
                  </span>
                </div>

                {renderDynamicSummary(selectedItemData)}

                {/* Raw API Inspector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                    <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-[#E53935]" /> Raw API JSON Payload
                    </span>
                    <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                      type={selectedCategory}&value={selectedItemName}
                    </span>
                  </div>

                  <pre className="p-4 rounded-2xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-xs font-mono text-[#E53935] dark:text-[#FF7070] max-h-80 overflow-y-auto leading-relaxed">
                    {JSON.stringify(selectedItemData, null, 2)}
                  </pre>
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-[var(--color-text-secondary)] text-sm">
                Select an item on the left to inspect its parameters.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
