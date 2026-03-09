import { useState, useEffect } from "react";
import { Perfume, WeatherData } from "../types";
import { fetchPerfumes } from "../services/perfumesApi";
import { getDailyRecommendations } from "../utils/recommendations";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

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

  useEffect(() => {
    loadPerfumes();
  }, []);

  useEffect(() => {
    if (!weather || perfumes.length === 0) return;
    getDailyRecommendations(weather, perfumes).then(setRecommendations);
  }, [weather, perfumes]);

  const loadPerfumes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPerfumes();
      setPerfumes(data);
    } catch (e) {
      setError("Impossible de charger les parfums.");
    } finally {
      setLoading(false);
    }
  };

  return { perfumes, recommendations, loading, error };
}