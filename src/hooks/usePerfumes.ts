import { useState, useEffect } from "react";
import { Perfume, WeatherData } from "../types";
import { fetchPerfumes } from "../services/perfumesApi";
import { getDailyRecommendations } from "../utils/recommendations";
import { useAuth } from "../context/AuthContext";
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

  useEffect(() => {
    loadPerfumes();
  }, []);

  useEffect(() => {
    if (!weather || perfumes.length === 0) return;
    const mappedGender = user?.gender === "homme" ? "masculin" : user?.gender === "femme" ? "féminin" : null;
    getDailyRecommendations(weather, perfumes, mappedGender).then(setRecommendations);
  }, [weather, perfumes, user?.gender]);

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