import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Shield, ArrowUpRight } from 'lucide-react';
import { getPokemonByType, ApiError } from '../services/pokemonApi';
import { TypeDetail } from '../types/pokemon';
import { capitalize, getTypeStyle, extractIdFromUrl } from '../utils/formatters';
import { TypeBadge } from '../components/TypeBadge';
import { PokeBallIcon } from '../components/PokeBallIcon';
import { ErrorMessage } from '../components/ErrorMessage';

const ELEMENTAL_TYPES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
];

export function TypesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTypeParam = searchParams.get('type') || 'fire';

  const [activeType, setActiveType] = useState(selectedTypeParam);
  const [typeDetail, setTypeDetail] = useState<TypeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ message: string; statusCode?: number } | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();

    async function fetchType() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPokemonByType(activeType, controller.signal);
        if (isSubscribed) {
          setTypeDetail(data);
        }
      } catch (err: unknown) {
        if (!isSubscribed) return;
        if (err instanceof DOMException && err.name === 'AbortError') return;
        const apiErr = err instanceof ApiError ? err : null;
        setError({
          message: apiErr?.message || 'Failed to load type data.',
          statusCode: apiErr?.statusCode,
        });
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    }

    fetchType();

    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [activeType]);

  const handleSelectType = (typeName: string) => {
    setActiveType(typeName);
    const next = new URLSearchParams(searchParams);
    next.set('type', typeName);
    setSearchParams(next, { replace: true });
  };

  const style = getTypeStyle(activeType);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-3 border-b border-[var(--color-border)]">
        <h1 className="text-2xl font-black text-[var(--color-text)] tracking-tight flex items-center gap-2.5">
          <PokeBallIcon size={24} />
          <span>Elemental Types & Combat Effectiveness</span>
        </h1>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
          Explore offensive matchups, defensive resistances, weaknesses, and elemental rosters.
        </p>
      </div>

      {/* Type Selection Grid */}
      <div className="flex flex-wrap gap-2">
        {ELEMENTAL_TYPES.map((t) => (
          <TypeBadge
            key={t}
            type={t}
            size="md"
            interactive
            active={activeType === t}
            onClick={() => handleSelectType(t)}
          />
        ))}
      </div>

      {error ? (
        <ErrorMessage
          title="Failed to Load Type Matrix"
          message={error.message}
          statusCode={error.statusCode}
          onRetry={() => setActiveType(activeType)}
        />
      ) : isLoading || !typeDetail ? (
        <div className="h-96 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] animate-pulse" />
      ) : (
        <div className="space-y-8">
          {/* Main Type Banner */}
          <div
            className="relative rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8 overflow-hidden shadow-xl"
            style={{
              boxShadow: `0 10px 30px -10px ${style.glow}`,
            }}
          >
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#E53935] uppercase tracking-widest">
                  Elemental Affinity
                </span>
                <h2 className="text-4xl font-black text-[var(--color-text)] tracking-tight mt-1 capitalize">
                  {capitalize(typeDetail.name)} Type
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-2xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text)]">
                  {typeDetail.pokemon.length} Pokémon
                </span>
                <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-2xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-[var(--color-text)]">
                  {typeDetail.moves.length} Moves
                </span>
              </div>
            </div>
          </div>

          {/* Combat Effectiveness Matrix (Offensive vs Defensive) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Offensive: Damage Dealt To Others */}
            <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border)]">
                <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-bold text-[var(--color-text)]">Attacking Matchups</h3>
              </div>

              <div className="space-y-4 text-xs">
                {/* 2x Super Effective */}
                <div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-2">
                    Super Effective (2x Damage To):
                  </span>
                  {typeDetail.damage_relations.double_damage_to.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {typeDetail.damage_relations.double_damage_to.map((t) => (
                        <TypeBadge key={t.name} type={t.name} size="sm" />
                      ))}
                    </div>
                  ) : (
                    <span className="text-[var(--color-text-muted)] italic">None</span>
                  )}
                </div>

                {/* 0.5x Not Very Effective */}
                <div>
                  <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-2">
                    Not Very Effective (0.5x Damage To):
                  </span>
                  {typeDetail.damage_relations.half_damage_to.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {typeDetail.damage_relations.half_damage_to.map((t) => (
                        <TypeBadge key={t.name} type={t.name} size="sm" />
                      ))}
                    </div>
                  ) : (
                    <span className="text-[var(--color-text-muted)] italic">None</span>
                  )}
                </div>

                {/* 0x No Damage */}
                <div>
                  <span className="font-bold text-[#E53935] uppercase tracking-wider block mb-2">
                    No Effect (0x Damage To):
                  </span>
                  {typeDetail.damage_relations.no_damage_to.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {typeDetail.damage_relations.no_damage_to.map((t) => (
                        <TypeBadge key={t.name} type={t.name} size="sm" />
                      ))}
                    </div>
                  ) : (
                    <span className="text-[var(--color-text-muted)] italic">None</span>
                  )}
                </div>
              </div>
            </div>

            {/* Defensive: Damage Received From Others */}
            <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border)]">
                <Shield className="w-5 h-5 text-sky-500" />
                <h3 className="text-base font-bold text-[var(--color-text)]">Defensive Matchups</h3>
              </div>

              <div className="space-y-4 text-xs">
                {/* 2x Weakness */}
                <div>
                  <span className="font-bold text-[#E53935] uppercase tracking-wider block mb-2">
                    Weaknesses (Takes 2x Damage From):
                  </span>
                  {typeDetail.damage_relations.double_damage_from.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {typeDetail.damage_relations.double_damage_from.map((t) => (
                        <TypeBadge key={t.name} type={t.name} size="sm" />
                      ))}
                    </div>
                  ) : (
                    <span className="text-[var(--color-text-muted)] italic">None</span>
                  )}
                </div>

                {/* 0.5x Resistances */}
                <div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-2">
                    Resistances (Takes 0.5x Damage From):
                  </span>
                  {typeDetail.damage_relations.half_damage_from.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {typeDetail.damage_relations.half_damage_from.map((t) => (
                        <TypeBadge key={t.name} type={t.name} size="sm" />
                      ))}
                    </div>
                  ) : (
                    <span className="text-[var(--color-text-muted)] italic">None</span>
                  )}
                </div>

                {/* 0x Immunities */}
                <div>
                  <span className="font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block mb-2">
                    Immunities (Takes 0x Damage From):
                  </span>
                  {typeDetail.damage_relations.no_damage_from.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {typeDetail.damage_relations.no_damage_from.map((t) => (
                        <TypeBadge key={t.name} type={t.name} size="sm" />
                      ))}
                    </div>
                  ) : (
                    <span className="text-[var(--color-text-muted)] italic">None</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Pokémon Belonging to this Type */}
          <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
              <h3 className="text-base font-bold text-[var(--color-text)] capitalize">
                {typeDetail.name} Pokémon ({typeDetail.pokemon.length})
              </h3>
              <Link
                to={`/?type=${typeDetail.name}`}
                className="text-xs font-bold text-[#E53935] hover:underline"
              >
                View in main Pokédex grid →
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto p-1">
              {typeDetail.pokemon.slice(0, 100).map((entry) => {
                const id = extractIdFromUrl(entry.pokemon.url);
                return (
                  <Link
                    key={entry.pokemon.name}
                    to={`/pokemon/${id || entry.pokemon.name}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] text-xs text-[var(--color-text)] hover:border-[#E53935] hover:text-[#E53935] transition-colors"
                  >
                    <span className="font-mono text-[10px] text-[var(--color-text-muted)] font-bold">#{id}</span>
                    <span className="font-semibold">{capitalize(entry.pokemon.name)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
