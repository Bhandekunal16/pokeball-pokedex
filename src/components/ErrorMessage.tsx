import { AlertCircle, RefreshCw, FilterX, HelpCircle } from 'lucide-react';
import { PokeBallIcon } from './PokeBallIcon';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  statusCode?: number;
  onRetry?: () => void;
  onResetFilters?: () => void;
  className?: string;
}

export function ErrorMessage({
  title = 'Unable to Load Data',
  message = 'An unexpected error occurred while communicating with the Pokémon API server.',
  statusCode,
  onRetry,
  onResetFilters,
  className = '',
}: ErrorMessageProps) {
  let helpfulTip = '';
  if (statusCode === 404) {
    helpfulTip = 'Check the Pokémon name spelling or ID number. Valid identifiers include "pikachu", "charizard", or "25".';
  } else if (statusCode === 500 || statusCode === 502) {
    helpfulTip = 'The upstream API server is experiencing temporary traffic. Retrying in a few moments often resolves this.';
  } else if (statusCode === 0) {
    helpfulTip = 'Please check your internet connection or verify the active API server endpoint in Settings.';
  }

  return (
    <div
      className={`rounded-3xl border border-[#E53935]/40 bg-[var(--color-surface)] p-6 text-center max-w-xl mx-auto my-8 shadow-lg ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#E53935]/10 border border-[#E53935]/30 text-[#E53935] mx-auto flex items-center justify-center mb-4">
        <PokeBallIcon size={32} />
      </div>

      <div className="flex items-center justify-center gap-2 mb-1">
        <h3 className="text-base font-extrabold text-[var(--color-text)]">{title}</h3>
        {statusCode !== undefined && statusCode > 0 && (
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-[#E53935]/15 text-[#E53935] border border-[#E53935]/30">
            HTTP {statusCode}
          </span>
        )}
      </div>

      <p className="text-sm text-[var(--color-text-secondary)] mt-1 max-w-md mx-auto">{message}</p>

      {helpfulTip && (
        <div className="mt-3 text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface-secondary)] rounded-2xl p-3.5 border border-[var(--color-border)] text-left flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-[#E53935] shrink-0 mt-0.5" />
          <span>{helpfulTip}</span>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#E53935] hover:bg-[#C62828] active:scale-95 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )}

        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[var(--color-text)] bg-[var(--color-surface-secondary)] hover:border-[#E53935] border border-[var(--color-border)] rounded-xl transition-colors cursor-pointer"
          >
            <FilterX className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
