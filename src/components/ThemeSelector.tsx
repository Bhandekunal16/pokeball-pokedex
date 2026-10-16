import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, ChevronDown, Check } from 'lucide-react';
import { useTheme, ThemeMode } from '../hooks/useTheme';

interface ThemeSelectorProps {
  className?: string;
  variant?: 'compact' | 'segmented' | 'dropdown';
}

export function ThemeSelector({ className = '', variant = 'segmented' }: ThemeSelectorProps) {
  const { mode, resolvedTheme, setMode } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [dropdownOpen]);

  const options: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  if (variant === 'segmented') {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 ${className}`}
        role="group"
        aria-label="Theme mode selector"
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = mode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setMode(opt.id)}
              title={`${opt.label} Mode${opt.id === 'system' ? ` (Currently ${resolvedTheme})` : ''}`}
              aria-label={`Switch to ${opt.label} mode`}
              aria-pressed={isActive}
              className={`relative flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#E53935] text-white shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Compact dropdown variant (for small headers or modals)
  const CurrentIcon = mode === 'system' ? Monitor : mode === 'dark' ? Moon : Sun;

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
        aria-label={`Theme mode: ${mode}. Click to change.`}
        title={`Theme: ${mode.toUpperCase()} (Click to toggle)`}
        className="flex items-center gap-1.5 p-2 rounded-xl text-[var(--color-text-secondary)] hover:text-[var(--color-text)] bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 transition-colors cursor-pointer"
      >
        <CurrentIcon className="w-4 h-4 text-[#E53935]" />
        <span className="text-xs font-semibold uppercase hidden md:inline">{mode}</span>
        <ChevronDown className="w-3 h-3 text-[var(--color-text-muted)]" />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-36 py-1 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = mode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setMode(opt.id);
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${
                  isSelected
                    ? 'text-[#E53935] font-bold bg-[#E53935]/10'
                    : 'text-[var(--color-text)] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#E53935]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Backwards-compatible export
export function ThemeToggle({ className = '' }: { className?: string }) {
  return <ThemeSelector className={className} variant="segmented" />;
}
