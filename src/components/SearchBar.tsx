import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search Pokémon by name or Pokédex number (e.g. Pikachu or 25)...',
  isLoading = false,
  className = '',
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [localValue, value, onChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(localValue.trim());
    } else {
      onChange(localValue.trim());
    }
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleFormSubmit} className={`relative flex items-center w-full ${className}`}>
      <div className="absolute left-3.5 flex items-center pointer-events-none text-[var(--color-text-secondary)]">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#E53935]" />
        ) : (
          <Search className="w-4 h-4 group-focus-within:text-[#E53935] transition-colors" />
        )}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-20 py-2.5 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[#E53935] focus:ring-2 focus:ring-[#E53935]/25 shadow-xs transition-all"
        autoComplete="off"
        spellCheck="false"
      />

      <div className="absolute right-3 flex items-center gap-1.5">
        {localValue && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Clear search input"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold text-[var(--color-text-secondary)] bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-md">
          /
        </kbd>
      </div>
    </form>
  );
}
