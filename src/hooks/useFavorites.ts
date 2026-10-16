import { useState, useEffect, useCallback } from 'react';
import { FavoritePokemon } from '../types/pokemon';

const STORAGE_KEY = 'pokesphere_favorites_v1';
const EVENT_NAME = 'pokesphere_favorites_updated';

function getInitialFavorites(): FavoritePokemon[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse favorites from storage', e);
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoritePokemon[]>(getInitialFavorites);

  useEffect(() => {
    const handleSync = () => {
      setFavorites(getInitialFavorites());
    };

    window.addEventListener(EVENT_NAME, handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener(EVENT_NAME, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const saveFavorites = useCallback((newFavs: FavoritePokemon[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavs));
      setFavorites(newFavs);
      window.dispatchEvent(new Event(EVENT_NAME));
    } catch (e) {
      console.error('Failed to save favorites to storage', e);
    }
  }, []);

  const isFavorite = useCallback(
    (id: number | string): boolean => {
      const numId = typeof id === 'string' ? parseInt(id, 10) : id;
      return favorites.some((fav) => fav.id === numId);
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    (pokemon: { id: number; name: string; types?: string[]; sprite?: string }) => {
      const exists = favorites.some((fav) => fav.id === pokemon.id);
      let updated: FavoritePokemon[];
      if (exists) {
        updated = favorites.filter((fav) => fav.id !== pokemon.id);
      } else {
        const item: FavoritePokemon = {
          id: pokemon.id,
          name: pokemon.name,
          types: pokemon.types,
          sprite: pokemon.sprite,
          addedAt: Date.now(),
        };
        updated = [item, ...favorites];
      }
      saveFavorites(updated);
    },
    [favorites, saveFavorites]
  );

  const removeFavorite = useCallback(
    (id: number) => {
      const updated = favorites.filter((fav) => fav.id !== id);
      saveFavorites(updated);
    },
    [favorites, saveFavorites]
  );

  const clearFavorites = useCallback(() => {
    saveFavorites([]);
  }, [saveFavorites]);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    clearFavorites,
    count: favorites.length,
  };
}
