import { useState, useEffect } from "react";
import { Perfume, WeatherData } from "../types";
import { fetchPerfumes } from "../services/perfumesApi";
import { getDailyRecommendations, UserPreferences } from "../utils/recommendations";
import { useAuth } from "../context/AuthContext";
import { useCollection } from "../context/CollectionContext";

interface UsePerfumesReturn {
  perfumes: Perfume[];
  recommendations: Perfume[];
  loading: boolean;
  error: string | null;
}

export const usePerfumes = (weather: WeatherData | null): UsePerfumesReturn => {
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [recommendations, setRecommendations] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { collection } = useCollection();

  useEffect(() => {
    loadPerfumes();
  }, []);

  useEffect(() => {
    if (!weather || perfumes.length === 0) return;

    const mappedGender =
      user?.gender === "homme"
        ? "masculin"
        : user?.gender === "femme"
        ? "féminin"
        : null;

    const prefs: UserPreferences = {
      gender: mappedGender,
      preferredIntensity: user?.preferred_intensity ?? null,
      preferredSeason: user?.preferred_season ?? null,
      collectionIds: collection.map((p) => p.id), // ← IDs de la collection
    };

    getDailyRecommendations(weather, perfumes, prefs).then(setRecommendations);
  }, [
    weather,
    perfumes,
    user?.gender,
    user?.preferred_intensity,
    user?.preferred_season,
    collection, // ← re-calcul si la collection change
  ]);

  const loadPerfumes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPerfumes();
      setPerfumes(data);
    } catch {
      setError("Impossible de charger les parfums.");
    } finally {
      setLoading(false);
    }
  };

  return { perfumes, recommendations, loading, error };
};