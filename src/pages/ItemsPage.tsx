import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package, ChevronRight, Coins, Zap, Info } from 'lucide-react';
import { getResourceList, getItemDetails, ApiError } from '../services/pokemonApi';
import { ItemDetail, NamedAPIResource } from '../types/pokemon';
import { capitalize, formatPokemonId } from '../utils/formatters';
import { PokeBallIcon } from '../components/PokeBallIcon';
import { Pagination } from '../components/Pagination';
import { SearchBar } from '../components/SearchBar';
import { ErrorMessage } from '../components/ErrorMessage';

export function ItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const queryParam = searchParams.get('q') || '';

  const [currentPage, setCurrentPage] = useState(pageParam);
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [pageSize] = useState(24);

  const [itemsList, setItemsList] = useState<NamedAPIResource[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedItem, setSelectedItem] = useState<ItemDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ message: string; statusCode?: number } | null>(null);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const controller = new AbortController();

    try {
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        try {
          const detail = await getItemDetails(query, controller.signal);
          setSelectedItem(detail);
          setItemsList([{ name: detail.name, url: `https://pokeapi.co/api/v2/item/${detail.id}/` }]);
          setTotalCount(1);
        } catch (err) {
          if (err instanceof ApiError && err.statusCode === 404) {
            setItemsList([]);
            setSelectedItem(null);
            setTotalCount(0);
          } else {
            throw err;
          }
        }
        setIsLoading(false);
        return;
      }

      const offset = (currentPage - 1) * pageSize;
      const res = await getResourceList('item', pageSize, offset, controller.signal);
      setItemsList(res.results);
      setTotalCount(res.count);

      if (res.results.length > 0 && !selectedItem) {
        loadItemDetail(res.results[0].name);
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const apiErr = err instanceof ApiError ? err : null;
      setError({
        message: apiErr?.message || 'Failed to load item inventory.',
        statusCode: apiErr?.statusCode,
      });
    } finally {
      setIsLoading(false);
    }

    return () => controller.abort();
  }, [currentPage, pageSize, searchQuery]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const loadItemDetail = async (itemName: string) => {
    setIsDetailLoading(true);
    try {
      const detail = await getItemDetails(itemName);
      setSelectedItem(detail);
    } catch (err) {
      console.error('Failed to load item detail', err);
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
          <span>Pokémon Items & Inventory</span>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border)] tabular-nums">
            {totalCount.toLocaleString()} TOTAL
          </span>
        </h1>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
          Explore hold items, Pokéballs, battle medicines, recovery potions, and berries.
        </p>
      </div>

      <div className="max-w-md">
        <SearchBar
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search items (e.g. Master Ball, Potion, Leftovers)..."
        />
      </div>

      {error ? (
        <ErrorMessage
          title="Item Inventory Error"
          message={error.message}
          statusCode={error.statusCode}
          onRetry={loadItems}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Item Grid */}
          <div className="lg:col-span-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-4 space-y-3 shadow-xs">
            <div className="text-xs font-bold text-[var(--color-text-secondary)] px-2 uppercase tracking-wider">
              Item Collection
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-16 bg-[var(--color-surface-secondary)] rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : itemsList.length === 0 ? (
              <div className="text-center py-8 text-xs text-[var(--color-text-secondary)]">
                No items found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {itemsList.map((item) => {
                  const isSelected = selectedItem?.name === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => loadItemDetail(item.name)}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#E53935]/15 border-[#E53935] text-[var(--color-text)] font-bold'
                          : 'bg-[var(--color-surface-secondary)] border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]'
                      }`}
                    >
                      <span className="text-xs truncate mr-2 capitalize font-semibold">{capitalize(item.name)}</span>
                      <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#E53935]' : 'text-[var(--color-text-muted)]'}`} />
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

          {/* Right Column: Item Inspector */}
          <div className="lg:col-span-6 sticky top-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            {isDetailLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="w-16 h-16 bg-[var(--color-surface-secondary)] rounded-2xl mx-auto" />
                <div className="h-8 w-48 bg-[var(--color-surface-secondary)] rounded-xl mx-auto" />
                <div className="h-20 bg-[var(--color-surface-secondary)] rounded-2xl" />
              </div>
            ) : selectedItem ? (
              <>
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="w-20 h-20 rounded-2xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] flex items-center justify-center p-2 shadow-inner">
                    {selectedItem.sprites.default ? (
                      <img
                        src={selectedItem.sprites.default}
                        alt={selectedItem.name}
                        className="w-12 h-12 object-contain image-rendering-pixelated filter drop-shadow-md"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-[#E53935]" />
                    )}
                  </div>

                  <div>
                    <span className="font-mono text-xs font-bold text-[#E53935]">
                      ITEM {formatPokemonId(selectedItem.id)}
                    </span>
                    <h2 className="text-2xl font-black text-[var(--color-text)] tracking-tight mt-0.5">
                      {capitalize(selectedItem.name)}
                    </h2>
                    {selectedItem.category && (
                      <span className="text-xs font-semibold text-[var(--color-text-secondary)] mt-1 block">
                        Category: <strong className="text-[var(--color-text)] capitalize">{capitalize(selectedItem.category.name)}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-2xl p-3 text-center">
                    <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center justify-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-500" /> Cost
                    </span>
                    <span className="text-base font-mono font-bold text-[var(--color-text)] tabular-nums mt-0.5 block">
                      {selectedItem.cost ? `₽${selectedItem.cost.toLocaleString()}` : 'Not for sale'}
                    </span>
                  </div>

                  <div className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-2xl p-3 text-center">
                    <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center justify-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-pink-500" /> Fling Power
                    </span>
                    <span className="text-base font-mono font-bold text-[var(--color-text)] tabular-nums mt-0.5 block">
                      {selectedItem.fling_power ?? 'None'}
                    </span>
                  </div>
                </div>

                {/* Effect */}
                <div className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-3xl p-4.5 space-y-2">
                  <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[#E53935]" /> Function & Utility
                  </span>
                  <p className="text-sm text-[var(--color-text)] leading-relaxed">
                    {selectedItem.effect_entries.find((e) => e.language.name === 'en')?.effect ||
                      selectedItem.effect_entries.find((e) => e.language.name === 'en')
                        ?.short_effect ||
                      'No description available for this item.'}
                  </p>
                </div>

                {/* Attributes */}
                {selectedItem.attributes && selectedItem.attributes.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Item Attributes:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedItem.attributes.map((attr) => (
                        <span
                          key={attr.name}
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text)] capitalize"
                        >
                          {capitalize(attr.name)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 text-[var(--color-text-secondary)] text-sm">
                Select an item from the collection to inspect its properties.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
