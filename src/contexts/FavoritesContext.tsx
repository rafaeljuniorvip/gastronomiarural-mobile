import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  addFavorito,
  listFavoritos,
  removeFavorito,
  type FavoriteRefType,
} from '../services/favorito.service';
import { useAuth } from './AuthContext';

interface FavoritesContextValue {
  favorites: Set<string>;
  loading: boolean;
  isFavorite: (refType: FavoriteRefType, refId: number) => boolean;
  toggle: (refType: FavoriteRefType, refId: number) => Promise<boolean>;
  refresh: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

function keyOf(refType: string, refId: number) {
  return `${refType}:${refId}`;
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setFavorites(new Set());
      return;
    }
    setLoading(true);
    try {
      const list = await listFavoritos();
      setFavorites(new Set(list.map((f) => keyOf(f.ref_type, f.ref_id))));
    } catch {
      setFavorites(new Set());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isFavorite = useCallback(
    (refType: FavoriteRefType, refId: number) => favorites.has(keyOf(refType, refId)),
    [favorites]
  );

  const toggle = useCallback(
    async (refType: FavoriteRefType, refId: number): Promise<boolean> => {
      if (!user) return false;
      const key = keyOf(refType, refId);
      const isFav = favorites.has(key);
      // Atualização otimista
      setFavorites((prev) => {
        const next = new Set(prev);
        if (isFav) next.delete(key);
        else next.add(key);
        return next;
      });
      try {
        if (isFav) {
          await removeFavorito(refType, refId);
          return false;
        } else {
          await addFavorito(refType, refId);
          return true;
        }
      } catch (err) {
        // Reverte em caso de erro
        setFavorites((prev) => {
          const next = new Set(prev);
          if (isFav) next.add(key);
          else next.delete(key);
          return next;
        });
        throw err;
      }
    },
    [favorites, user]
  );

  return (
    <FavoritesContext.Provider value={{ favorites, loading, isFavorite, toggle, refresh }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavoritesContext must be used within FavoritesProvider');
  return ctx;
}
