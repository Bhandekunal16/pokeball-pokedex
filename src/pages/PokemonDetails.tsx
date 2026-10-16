import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Volume2,
  Sparkles,
  Weight,
  Ruler,
  Award,
  Swords,
} from 'lucide-react';
import { getPokemonByNameOrId, ApiError } from '../services/pokemonApi';
import { PokemonDetail } from '../types/pokemon';
import {
  formatPokemonId,
  capitalize,
  formatHeight,
  formatWeight,
  getTypeStyle,
  getStatInfo,
} from '../utils/formatters';
import { TypeBadge } from '../components/TypeBadge';
import { PokeBallIcon } from '../components/PokeBallIcon';
import { PokemonDetailSkeleton } from '../components/LoadingSkeleton';
import { ErrorMessage } from '../components/ErrorMessage';
import { useFavorites } from '../hooks/useFavorites';

export function PokemonDetails() {
  const { nameOrId } = useParams<{ nameOrId: string }>();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ message: string; statusCode?: number } | null>(null);
  const [isShiny, setIsShiny] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'moves' | 'abilities'>('stats');
  const [moveSearch, setMoveSearch] = useState('');

  useEffect(() => {
    if (!nameOrId) return;

    let isSubscribed = true;
    const controller = new AbortController();

    async function fetchDetail() {
      setIsLoading(true);
      setError(null);
      setIsShiny(false);

      try {
        const data = await getPokemonByNameOrId(nameOrId!, controller.signal);
        if (isSubscribed) {
          setPokemon(data);
        }
      } catch (err: unknown) {
        if (!isSubscribed) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;

        const apiErr = err instanceof ApiError ? err : null;
        setError({
          message:
            apiErr?.statusCode === 404
              ? `No Pokémon record found for "${nameOrId}".`
              : apiErr?.message || 'Failed to load Pokémon specifications.',
          statusCode: apiErr?.statusCode,
        });
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    }

    fetchDetail();

    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [nameOrId]);

  if (isLoading) {
    return <PokemonDetailSkeleton />;
  }

  if (error || !pokemon) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <ErrorMessage
          title="Pokémon Record Not Found"
          message={error?.message || 'Could not locate the requested Pokémon database record.'}
          statusCode={error?.statusCode}
          onRetry={() => window.location.reload()}
          onResetFilters={() => navigate('/')}
        />
        <div className="text-center mt-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#E53935] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Pokédex Collection</span>
          </Link>
        </div>
      </div>
    );
  }

  const favorite = isFavorite(pokemon.id);
  const primaryType = pokemon.types[0]?.type.name || 'normal';
  const typeStyle = getTypeStyle(primaryType);

  const defaultArtwork =
    pokemon.sprites.other?.['official-artwork']?.front_default ||
    pokemon.sprites.front_default ||
    '';
  const shinyArtwork =
    pokemon.sprites.other?.['official-artwork']?.front_shiny ||
    pokemon.sprites.front_shiny ||
    defaultArtwork;

  const currentArtwork = isShiny ? shinyArtwork : defaultArtwork;
  const totalBaseStats = pokemon.stats.reduce((acc, stat) => acc + stat.base_stat, 0);

  const prevId = pokemon.id > 1 ? pokemon.id - 1 : null;
  const nextId = pokemon.id < 1025 ? pokemon.id + 1 : null;

  const handlePlayCry = () => {
    const cryUrl = pokemon.cries?.latest || pokemon.cries?.legacy;
    if (cryUrl) {
      const audio = new Audio(cryUrl);
      audio.volume = 0.5;
      audio.play().catch((e) => console.log('Audio cry playback', e));
    }
  };

  const filteredMoves = pokemon.moves.filter((m) =>
    m.move.name.toLowerCase().includes(moveSearch.toLowerCase().trim())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Navigation Row: Back button & Prev/Next pager */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[var(--color-text)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl hover:border-[#E53935] transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#E53935]" />
          <span>Back to Pokédex</span>
        </Link>

        <div className="flex items-center gap-2">
          {prevId ? (
            <Link
              to={`/pokemon/${prevId}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl hover:border-[#E53935] transition-colors tabular-nums shadow-xs"
              title="Previous Pokémon"
            >
              <ChevronLeft className="w-4 h-4 text-[#E53935]" />
              <span>#{prevId}</span>
            </Link>
          ) : (
            <span className="px-3.5 py-2 text-xs font-mono text-[var(--color-text-muted)] bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-2xl opacity-40 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4 inline" />
            </span>
          )}

          {nextId && (
            <Link
              to={`/pokemon/${nextId}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl hover:border-[#E53935] transition-colors tabular-nums shadow-xs"
              title="Next Pokémon"
            >
              <span>#{nextId}</span>
              <ChevronRight className="w-4 h-4 text-[#E53935]" />
            </Link>
          )}
        </div>
      </div>

      {/* Main 2-Column Pokédex Specification Card */}
      <div className="relative rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl overflow-hidden transition-colors">
        {/* Decorative background Poké Ball watermark */}
        <div className="absolute -right-24 -bottom-24 opacity-[0.03] dark:opacity-[0.06] pointer-events-none">
          <PokeBallIcon size={480} />
        </div>

        {/* Ambient type aura background */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: typeStyle.accent }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 lg:p-10">
          {/* Left Column: Visual Showcase & Sprites */}
          <div className="lg:col-span-5 flex flex-col items-center justify-between space-y-6">
            {/* Header badges & Favorite */}
            <div className="w-full flex items-center justify-between">
              <span className="font-mono text-sm font-extrabold text-[var(--color-text)] bg-[var(--color-surface-secondary)] px-3.5 py-1 rounded-full border border-[var(--color-border)] tabular-nums">
                {formatPokemonId(pokemon.id)}
              </span>

              <div className="flex items-center gap-2">
                {pokemon.cries?.latest && (
                  <button
                    type="button"
                    onClick={handlePlayCry}
                    className="p-2 rounded-xl text-[var(--color-text-secondary)] hover:text-[#E53935] hover:bg-black/5 dark:hover:bg-white/5 border border-[var(--color-border)] transition-colors cursor-pointer"
                    title="Play Official Cry"
                    aria-label="Play Official Cry"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    toggleFavorite({
                      id: pokemon.id,
                      name: pokemon.name,
                      types: pokemon.types.map((t) => t.type.name),
                      sprite: defaultArtwork,
                    })
                  }
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    favorite
                      ? 'bg-[#E53935]/15 text-[#E53935] border-[#E53935]'
                      : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[#E53935]'
                  }`}
                  aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
                  title={favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-4 h-4 ${favorite ? 'fill-[#E53935] text-[#E53935]' : ''}`} />
                </button>
              </div>
            </div>

            {/* Main Official Artwork Display with clean contrast */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center my-4 p-4 rounded-3xl bg-black/[0.02] dark:bg-white/[0.02]">
              <img
                src={currentArtwork}
                alt={pokemon.name}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-full object-contain filter drop-shadow-2xl hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Artwork Variant Switcher (Default vs Shiny) */}
            <div className="flex items-center gap-1.5 p-1 bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-2xl">
              <button
                type="button"
                onClick={() => setIsShiny(false)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  !isShiny
                    ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-xs border border-[var(--color-border)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                }`}
              >
                Standard Form
              </button>
              <button
                type="button"
                onClick={() => setIsShiny(true)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isShiny
                    ? 'bg-[#E53935] text-white shadow-xs'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Shiny Form</span>
              </button>
            </div>

            {/* Elemental Types */}
            <div className="flex items-center gap-2">
              {pokemon.types.map((entry) => (
                <TypeBadge key={entry.type.name} type={entry.type.name} size="lg" />
              ))}
            </div>
          </div>

          {/* Right Column: Name, Vitals & Tabbed Parameters */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-baseline gap-3">
                <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-text)] tracking-tight">
                  {capitalize(pokemon.name)}
                </h1>
                <span className="font-mono text-sm font-bold text-[#E53935] tabular-nums">
                  {formatPokemonId(pokemon.id)}
                </span>
              </div>
            </div>

            {/* Physical Vitals Strip */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-2xl p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                  <Ruler className="w-3.5 h-3.5 text-sky-500" />
                  <span>Height</span>
                </div>
                <div className="text-sm font-black font-mono text-[var(--color-text)] tabular-nums">
                  {formatHeight(pokemon.height)}
                </div>
              </div>

              <div className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-2xl p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                  <Weight className="w-3.5 h-3.5 text-amber-500" />
                  <span>Weight</span>
                </div>
                <div className="text-sm font-black font-mono text-[var(--color-text)] tabular-nums">
                  {formatWeight(pokemon.weight)}
                </div>
              </div>

              <div className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-2xl p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-text-secondary)] mb-1">
                  <Award className="w-3.5 h-3.5 text-purple-500" />
                  <span>Base Exp</span>
                </div>
                <div className="text-sm font-black font-mono text-[var(--color-text)] tabular-nums">
                  {pokemon.base_experience ? `${pokemon.base_experience} XP` : '--'}
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveTab('stats')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'stats'
                    ? 'bg-[#E53935] text-white shadow-xs'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                }`}
              >
                Base Stats
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('abilities')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'abilities'
                    ? 'bg-[#E53935] text-white shadow-xs'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                }`}
              >
                Abilities ({pokemon.abilities.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('moves')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'moves'
                    ? 'bg-[#E53935] text-white shadow-xs'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                }`}
              >
                Moves ({pokemon.moves.length})
              </button>
            </div>

            {/* Tab 1: Base Stats Progress Bars */}
            {activeTab === 'stats' && (
              <div className="bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-3xl p-5 space-y-3.5">
                <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] pb-2 border-b border-[var(--color-border)]">
                  <span className="font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <PokeBallIcon size={14} /> Combat Attributes
                  </span>
                  <span className="font-mono">
                    Stat Total:{' '}
                    <strong className="text-[#E53935] text-sm font-black tabular-nums">
                      {totalBaseStats}
                    </strong>
                  </span>
                </div>

                <div className="space-y-3">
                  {pokemon.stats.map((statItem) => {
                    const info = getStatInfo(statItem.stat.name);
                    const percentage = Math.min(100, Math.round((statItem.base_stat / info.max) * 100));

                    return (
                      <div key={statItem.stat.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[var(--color-text)] w-24">
                            {info.label}
                          </span>
                          <span className="font-mono font-bold text-[var(--color-text)] tabular-nums">
                            {statItem.base_stat}
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${info.barColor}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 2: Abilities & Hidden Traits */}
            {activeTab === 'abilities' && (
              <div className="space-y-3">
                <div className="text-xs text-[var(--color-text-secondary)]">
                  Passive mechanics and traits that trigger automatically during battles.
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {pokemon.abilities.map((item) => (
                    <div
                      key={item.ability.name}
                      className="p-3.5 rounded-2xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[var(--color-text)]">
                            {capitalize(item.ability.name)}
                          </span>
                          {item.is_hidden && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-300">
                              Hidden Ability
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-[var(--color-text-secondary)] mt-0.5 block">
                          Slot {item.slot}
                        </span>
                      </div>
                      <Link
                        to={`/abilities?q=${item.ability.name}`}
                        className="text-xs font-bold text-[#E53935] hover:underline"
                      >
                        Inspect Ability →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Moves Catalogue */}
            {activeTab === 'moves' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={moveSearch}
                    onChange={(e) => setMoveSearch(e.target.value)}
                    placeholder="Filter moves learned by this Pokémon..."
                    className="w-full px-3.5 py-2 text-xs bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[#E53935]"
                  />
                  {moveSearch && (
                    <button
                      type="button"
                      onClick={() => setMoveSearch('')}
                      className="px-3 py-2 text-xs font-semibold bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl hover:text-[#E53935] cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto pr-1 space-y-1.5">
                  {filteredMoves.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[var(--color-text-muted)]">
                      No moves matching "{moveSearch}"
                    </div>
                  ) : (
                    filteredMoves.map((m) => {
                      const latestVersion = m.version_group_details[0];
                      return (
                        <div
                          key={m.move.name}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Swords className="w-3.5 h-3.5 text-[#E53935]" />
                            <span className="font-bold text-[var(--color-text)]">
                              {capitalize(m.move.name)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {latestVersion && (
                              <span className="text-[11px] text-[var(--color-text-secondary)] font-mono font-bold">
                                {latestVersion.move_learn_method.name === 'level-up'
                                  ? `Lv. ${latestVersion.level_learned_at}`
                                  : capitalize(latestVersion.move_learn_method.name)}
                              </span>
                            )}
                            <Link
                              to={`/moves?q=${m.move.name}`}
                              className="text-[11px] font-bold text-[#E53935] hover:underline ml-2"
                            >
                              Details
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
