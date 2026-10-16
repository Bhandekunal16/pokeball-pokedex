import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Heart, Settings, Menu, X } from 'lucide-react';
import { ThemeSelector } from './ThemeSelector';
import { ApiSettingsModal } from './ApiSettingsModal';
import { PokeBallIcon } from './PokeBallIcon';
import { useFavorites } from '../hooks/useFavorites';

export function Navbar() {
  const { count } = useFavorites();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiModalOpen, setApiModalOpen] = useState(false);

  const navLinks = [
    { label: 'Pokémon', path: '/' },
    { label: 'Moves', path: '/moves' },
    { label: 'Abilities', path: '/abilities' },
    { label: 'Types', path: '/types' },
    { label: 'Items', path: '/items' },
    { label: 'Locations', path: '/locations' },
    { label: 'Explore', path: '/explore' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-md transition-colors duration-200 shadow-xs">
        {/* Subtle Poké Ball red accent top stripe */}
        <div className="h-1 w-full bg-linear-to-r from-[#E53935] via-[#C62828] to-[#E53935]" />

        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 lg:px-8 h-16">
          {/* Zone 1: Poké Ball Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-lg font-black tracking-tight text-[var(--color-text)] whitespace-nowrap shrink-0 group focus:outline-none"
          >
            <div className="relative p-0.5 rounded-full group-hover:scale-105 group-hover:rotate-12 transition-transform duration-300">
              <PokeBallIcon size={32} />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight text-base font-extrabold flex items-center gap-1">
                <span>Poké</span>
                <span className="text-[#E53935]">Sphere</span>
              </span>
              <span className="text-[9px] font-mono font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] -mt-0.5">
                Pokédex OS
              </span>
            </div>
          </Link>

          {/* Zone 2: Navigation links with Pokéball red indicators */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `transition-all whitespace-nowrap shrink-0 py-1.5 px-1 border-b-2 font-semibold ${
                    isActive
                      ? 'border-[#E53935] text-[#E53935]'
                      : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-black/20 dark:hover:border-white/20'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: Primary action + 3-Mode Theme Selector + Tools */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Favorites shortcut */}
            <Link
              to="/favorites"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#E53935] hover:bg-[#C62828] active:scale-95 rounded-xl transition-all shadow-sm shadow-[#E53935]/25 whitespace-nowrap shrink-0"
              title="View Favorite Pokémon"
            >
              <Heart className={`w-3.5 h-3.5 ${count > 0 ? 'fill-white text-white' : 'text-white'}`} />
              <span className="hidden sm:inline">Favorites</span>
              {count > 0 && (
                <span className="px-1.5 py-0.2 bg-black/30 text-white text-[10px] font-mono font-bold rounded-full">
                  {count}
                </span>
              )}
            </Link>

            {/* 3-Mode Theme Selector: Light, Dark, System */}
            <ThemeSelector />

            {/* API Settings */}
            <button
              type="button"
              onClick={() => setApiModalOpen(true)}
              className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-black/5 dark:hover:bg-white/5 border border-[var(--color-border)] rounded-xl transition-colors cursor-pointer"
              title="API Server Settings"
              aria-label="API Server Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-black/5 dark:hover:bg-white/5 border border-[var(--color-border)] rounded-xl transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 pt-3 pb-4 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#E53935]/10 text-[#E53935] font-bold border-l-4 border-[#E53935]'
                      : 'text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--color-text)]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      <ApiSettingsModal
        isOpen={apiModalOpen}
        onClose={() => setApiModalOpen(false)}
        onUrlChanged={() => window.location.reload()}
      />
    </>
  );
}
