import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { PokemonDetails } from './pages/PokemonDetails';
import { MovesPage } from './pages/MovesPage';
import { AbilitiesPage } from './pages/AbilitiesPage';
import { TypesPage } from './pages/TypesPage';
import { ItemsPage } from './pages/ItemsPage';
import { LocationsPage } from './pages/LocationsPage';
import { Explore } from './pages/Explore';
import { Favorites } from './pages/Favorites';
import { NotFound } from './pages/NotFound';
import { PokeBallIcon } from './components/PokeBallIcon';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] flex flex-col font-sans transition-colors duration-200">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pokemon" element={<Navigate to="/" replace />} />
            <Route path="/pokemon/:nameOrId" element={<PokemonDetails />} />
            <Route path="/moves" element={<MovesPage />} />
            <Route path="/abilities" element={<AbilitiesPage />} />
            <Route path="/types" element={<TypesPage />} />
            <Route path="/items" element={<ItemsPage />} />
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/regions" element={<Navigate to="/locations?tab=regions" replace />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/explore/:category" element={<Explore />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] py-8 px-4 sm:px-6 lg:px-8 mt-12 text-xs text-[var(--color-text-secondary)] transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <PokeBallIcon size={18} />
              <span className="font-extrabold text-[var(--color-text)]">PokéSphere Explorer</span>
              <span>·</span>
              <span>Poké Ball Design System</span>
            </div>

            <div className="flex items-center gap-4 text-[var(--color-text-secondary)] font-semibold">
              <Link to="/explore" className="hover:text-[#E53935] transition-colors">
                24 Resources
              </Link>
              <Link to="/types" className="hover:text-[#E53935] transition-colors">
                Type Chart
              </Link>
              <Link to="/favorites" className="hover:text-[#E53935] transition-colors">
                Squad Builder
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
