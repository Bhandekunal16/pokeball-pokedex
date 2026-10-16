import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';
import { PokeBallIcon } from '../components/PokeBallIcon';

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
      <div className="w-24 h-24 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center shadow-lg">
        <PokeBallIcon size={56} />
      </div>
      <h1 className="text-3xl font-black text-[var(--color-text)] tracking-tight">
        Wild Area Not Discovered
      </h1>
      <p className="text-sm text-[var(--color-text-secondary)] max-w-md">
        The Pokédex entry or screen you were attempting to access does not exist in this region.
      </p>
      <div className="pt-2 flex items-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#E53935] hover:bg-[#C62828] active:scale-95 rounded-2xl transition-all shadow-md shadow-[#E53935]/25 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Return to Pokédex</span>
        </Link>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[var(--color-text)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-2xl transition-colors cursor-pointer"
        >
          <Compass className="w-4 h-4 text-[#E53935]" />
          <span>Universal Explorer</span>
        </Link>
      </div>
    </div>
  );
}
