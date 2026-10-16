import { PokeBallIcon } from './PokeBallIcon';

export function PokemonCardSkeleton() {
  return (
    <div className="flex flex-col justify-between bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-4.5 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-4 w-12 bg-[var(--color-surface-secondary)] rounded-lg" />
        <div className="h-5 w-5 bg-[var(--color-surface-secondary)] rounded-full" />
      </div>

      <div className="my-4 flex items-center justify-center h-36">
        <div className="w-28 h-28 rounded-full bg-[var(--color-surface-secondary)] flex items-center justify-center">
          <PokeBallIcon size={32} className="opacity-20" spinning />
        </div>
      </div>

      <div className="pt-2.5 border-t border-[var(--color-border-subtle)] space-y-2">
        <div className="h-5 w-3/4 bg-[var(--color-surface-secondary)] rounded-lg" />
        <div className="flex gap-2">
          <div className="h-4 w-14 bg-[var(--color-surface-secondary)] rounded-lg" />
          <div className="h-4 w-14 bg-[var(--color-surface-secondary)] rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function PokemonGridSkeleton({ count = 24 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <PokemonCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PokemonDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-8 w-32 bg-[var(--color-surface-secondary)] rounded-xl" />
        <div className="h-8 w-24 bg-[var(--color-surface-secondary)] rounded-xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 flex flex-col items-center">
          <div className="w-64 h-64 bg-[var(--color-surface-secondary)] rounded-full mb-6 flex items-center justify-center">
            <PokeBallIcon size={48} className="opacity-25" spinning />
          </div>
          <div className="h-8 w-48 bg-[var(--color-surface-secondary)] rounded-xl mb-3" />
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-[var(--color-surface-secondary)] rounded-lg" />
            <div className="h-6 w-16 bg-[var(--color-surface-secondary)] rounded-lg" />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 space-y-4">
            <div className="h-6 w-32 bg-[var(--color-surface-secondary)] rounded-lg" />
            <div className="grid grid-cols-3 gap-3">
              <div className="h-16 bg-[var(--color-surface-secondary)] rounded-2xl" />
              <div className="h-16 bg-[var(--color-surface-secondary)] rounded-2xl" />
              <div className="h-16 bg-[var(--color-surface-secondary)] rounded-2xl" />
            </div>
          </div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 space-y-3">
            <div className="h-6 w-36 bg-[var(--color-surface-secondary)] rounded-lg mb-2" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-6 bg-[var(--color-surface-secondary)] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
