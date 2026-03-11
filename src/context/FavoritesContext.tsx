import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getFavorites, toggleFavorite } from "../services/favoritesService";
import { Perfume } from "../types";
import { fetchPerfumes } from "../services/perfumesApi";

interface FavoritesContextType {
  favoriteIds: number[];
  favoritePerfumes: Perfume[];
  isFavorite: (id: number) => boolean;
  toggle: (id: number) => Promise<void>;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [allPerfumes, setAllPerfumes] = useState<Perfume[]>([]);

  const loadFavorites = useCallback(async () => {
    const ids = await getFavorites();
    setFavoriteIds(ids);
    setLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      await loadFavorites();
      const perfumes = await fetchPerfumes();
      setAllPerfumes(perfumes);
    };
    init();
  }, []);

  const toggle = async (id: number) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
    await toggleFavorite(id);
  };

  const isFavorite = (id: number) => favoriteIds.includes(id);

  const favoritePerfumes = allPerfumes.filter((p) =>
  favoriteIds.includes(p.id)
  );

  return (
    <FavoritesContext.Provider
      value={{ favoriteIds, favoritePerfumes, isFavorite, toggle, loading }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites doit être utilisé dans un FavoritesProvider");
  }
  return context;
};