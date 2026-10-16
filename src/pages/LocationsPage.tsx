import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { getResourceList, getResourceByValue, ApiError } from '../services/pokemonApi';
import { RegionDetail, LocationDetail, NamedAPIResource } from '../types/pokemon';
import { capitalize, formatPokemonId } from '../utils/formatters';
import { PokeBallIcon } from '../components/PokeBallIcon';
import { Pagination } from '../components/Pagination';
import { SearchBar } from '../components/SearchBar';
import { ErrorMessage } from '../components/ErrorMessage';

export function LocationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabParam = (searchParams.get('tab') as 'regions' | 'locations') || 'regions';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const queryParam = searchParams.get('q') || '';

  const [activeTab, setActiveTab] = useState<'regions' | 'locations'>(activeTabParam);
  const [currentPage, setCurrentPage] = useState(pageParam);
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [pageSize] = useState(20);

  const [itemsList, setItemsList] = useState<NamedAPIResource[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState<RegionDetail | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ message: string; statusCode?: number } | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const controller = new AbortController();
    const resourceType = activeTab === 'regions' ? 'region' : 'location';

    try {
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        try {
          if (activeTab === 'regions') {
            const detail = await getResourceByValue<RegionDetail>('region', query, controller.signal);
            setSelectedRegion(detail);
          } else {
            const detail = await getResourceByValue<LocationDetail>('location', query, controller.signal);
            setSelectedLocation(detail);
          }
          setItemsList([{ name: query, url: '' }]);
          setTotalCount(1);
        } catch (err) {
          if (err instanceof ApiError && err.statusCode === 404) {
            setItemsList([]);
            setSelectedRegion(null);
            setSelectedLocation(null);
            setTotalCount(0);
          } else {
            throw err;
          }
        }
        setIsLoading(false);
        return;
      }

      const offset = (currentPage - 1) * pageSize;
      const res = await getResourceList(resourceType, pageSize, offset, controller.signal);
      setItemsList(res.results);
      setTotalCount(res.count);

      if (res.results.length > 0) {
        if (activeTab === 'regions') {
          loadRegionDetail(res.results[0].name);
        } else {
          loadLocationDetail(res.results[0].name);
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const apiErr = err instanceof ApiError ? err : null;
      setError({
        message: apiErr?.message || `Failed to load ${activeTab} data.`,
        statusCode: apiErr?.statusCode,
      });
    } finally {
      setIsLoading(false);
    }

    return () => controller.abort();
  }, [activeTab, currentPage, pageSize, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadRegionDetail = async (regionName: string) => {
    setIsDetailLoading(true);
    try {
      const detail = await getResourceByValue<RegionDetail>('region', regionName);
      setSelectedRegion(detail);
      setSelectedLocation(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const loadLocationDetail = async (locationName: string) => {
    setIsDetailLoading(true);
    try {
      const detail = await getResourceByValue<LocationDetail>('location', locationName);
      setSelectedLocation(detail);
      setSelectedRegion(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleTabSwitch = (tab: 'regions' | 'locations') => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery('');
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
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

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-[var(--color-border)]">
        <h1 className="text-2xl font-black text-[var(--color-text)] tracking-tight flex items-center gap-2.5">
          <PokeBallIcon size={24} />
          <span>Pokémon World: Regions & Locations</span>
          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-border)] tabular-nums">
            {totalCount.toLocaleString()} {activeTab.toUpperCase()}
          </span>
        </h1>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
          Explore geographical lands, regional Pokédex divisions, cities, routes, and encounter areas.
        </p>
      </div>

      {/* Tab Switcher & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-2xl">
          <button
            type="button"
            onClick={() => handleTabSwitch('regions')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'regions'
                ? 'bg-[#E53935] text-white shadow-xs'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            }`}
          >
            Geographic Regions
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('locations')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'locations'
                ? 'bg-[#E53935] text-white shadow-xs'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            }`}
          >
            World Locations
          </button>
        </div>

        <div className="w-full sm:w-80">
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={activeTab === 'regions' ? 'Search region (e.g. Kanto, Johto)...' : 'Search location (e.g. Cerulean Cave)...'}
          />
        </div>
      </div>

      {error ? (
        <ErrorMessage
          title="Geography Data Error"
          message={error.message}
          statusCode={error.statusCode}
          onRetry={loadData}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: List */}
          <div className="lg:col-span-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-4 space-y-2 shadow-xs">
            <div className="text-xs font-bold text-[var(--color-text-secondary)] px-2 uppercase tracking-wider">
              {activeTab === 'regions' ? 'Known Regions' : 'Discovered Locations'}
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
                  const isSelected =
                    (activeTab === 'regions' && selectedRegion?.name === item.name) ||
                    (activeTab === 'locations' && selectedLocation?.name === item.name);

                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() =>
                        activeTab === 'regions'
                          ? loadRegionDetail(item.name)
                          : loadLocationDetail(item.name)
                      }
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

          {/* Right Column: Detail Inspector */}
          <div className="lg:col-span-7 sticky top-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            {isDetailLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-8 w-48 bg-[var(--color-surface-secondary)] rounded-xl" />
                <div className="h-24 bg-[var(--color-surface-secondary)] rounded-2xl" />
              </div>
            ) : activeTab === 'regions' && selectedRegion ? (
              <>
                <div>
                  <span className="font-mono text-xs font-bold text-[#E53935]">
                    REGION {formatPokemonId(selectedRegion.id)}
                  </span>
                  <h2 className="text-3xl font-black text-[var(--color-text)] tracking-tight mt-0.5 capitalize">
                    {capitalize(selectedRegion.name)} Region
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-2xl p-3 text-center">
                    <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider block">
                      Associated Locations
                    </span>
                    <span className="text-2xl font-mono font-black text-sky-500 tabular-nums mt-0.5 block">
                      {selectedRegion.locations?.length || 0}
                    </span>
                  </div>

                  <div className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-2xl p-3 text-center">
                    <span className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider block">
                      Regional Pokédexes
                    </span>
                    <span className="text-2xl font-mono font-black text-amber-500 tabular-nums mt-0.5 block">
                      {selectedRegion.pokedexes?.length || 0}
                    </span>
                  </div>
                </div>

                {selectedRegion.locations && selectedRegion.locations.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Prominent Locations:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto p-1">
                      {selectedRegion.locations.slice(0, 40).map((loc) => (
                        <span
                          key={loc.name}
                          className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text)] capitalize"
                        >
                          {capitalize(loc.name)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : activeTab === 'locations' && selectedLocation ? (
              <>
                <div>
                  <span className="font-mono text-xs font-bold text-[#E53935]">
                    LOCATION {formatPokemonId(selectedLocation.id)}
                  </span>
                  <h2 className="text-3xl font-black text-[var(--color-text)] tracking-tight mt-0.5 capitalize">
                    {capitalize(selectedLocation.name)}
                  </h2>
                  {selectedLocation.region && (
                    <span className="text-xs font-bold text-[#E53935] mt-1 block">
                      Region: {capitalize(selectedLocation.region.name)}
                    </span>
                  )}
                </div>

                {selectedLocation.areas && selectedLocation.areas.length > 0 ? (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Encounter Sub-Areas ({selectedLocation.areas.length}):
                    </span>
                    <div className="space-y-1.5">
                      {selectedLocation.areas.map((area) => (
                        <div
                          key={area.name}
                          className="p-3 rounded-2xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text)]"
                        >
                          {capitalize(area.name)}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-[var(--color-text-muted)] italic">
                    No specific encounter sub-areas cataloged for this location.
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 text-[var(--color-text-secondary)] text-sm">
                Select an entry to view geographical and regional details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
