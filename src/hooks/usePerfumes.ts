import { useState, useEffect} from "react";
import { Perfume, WeatherData } from "../types";
import { getRecommendations } from "../utils/recommendations";
import perfumesData from "../data/perfumes.json";

interface UsePerfumesReturn {
    perfumes: Perfume[];
    recommendations: Perfume[];
    loading: boolean;
}

export const usePerfumes = (weather: WeatherData | null): UsePerfumesReturn => {
    const [perfumes] = useState<Perfume[]>(perfumesData as Perfume[]);
    const [recommendations, setRecommendations] = useState<Perfume[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!weather) return;

        setLoading(true);
        const results = getRecommendations(weather, perfumes);
        setRecommendations(results);
        setLoading(false);
    }, [weather]);

    return { perfumes, recommendations, loading };
}