import { WeatherData, Perfume, Season } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HISTORY_KEY = "recommendations_history";
const MAX_HISTORY_DAYS = 7;

const getSeason = (temp: number): Season => {
  if (temp <= 5) return "winter";
  if (temp <= 14) return "autumn";
  if (temp <= 22) return "spring";
  return "summer";
};

const getTodayKey = (): string => {
  return new Date().toISOString().split("T")[0];
};

const loadHistory = async (): Promise<Record<string, number[]>> => {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Failed to load history", e);
    return {};
  }
};

const saveHistory = async (ids: number[]): Promise<void> => {
  try {
    const history = await loadHistory();
    const today = getTodayKey();
    // Ajouter les recommandations du jour
    history[today] = ids;
    // Nettoyer les entrées plus anciennes que MAX_HISTORY_DAYS
    const keys = Object.keys(history).sort();
    while (keys.length > MAX_HISTORY_DAYS) {
      delete history[keys.shift()!];
    }
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error("Failed to save history", e);
  }
};

// Récupérer les IDs des parfums recommandés récemment (hors aujourd'hui)
const getRecentlyShownIds = async (): Promise<Set<number>> => {
  const history = await loadHistory();
  const today = getTodayKey();
  const ids = new Set<number>();
  Object.entries(history).forEach(([date, perfumeIds]) => {
    if (date !== today) {
      perfumeIds.forEach((id) => ids.add(id));
    }
  });
  return ids;
};

const getTodayShownIds = async (): Promise<number[] | null> => {
  const history = await loadHistory();
  return history[getTodayKey()] || null;
};

const scorePerfumes = (
  weather: WeatherData,
  perfumes: Perfume[]
): { perfume: Perfume; score: number }[] => {
  const season = getSeason(weather.temperature);
  const condition = weather.condition.toLowerCase();

  return perfumes.map((perfume) => {
    let score = 0;
    if (
      perfume.temp_min !== undefined &&
      perfume.temp_max !== undefined &&
      weather.temperature >= perfume.temp_min &&
      weather.temperature <= perfume.temp_max
    ) {
      score += 3;
    }
        if (Array.isArray(perfume.season) && perfume.season.includes(season)) {
      score += 2;
    }

    if (
      Array.isArray(perfume.weatherConditions) &&
      perfume.weatherConditions.includes(condition)
    ) {
      score += 1;
    }

    return { perfume, score };
  });
};

export const getRecommendations = (
  weather: WeatherData,
  perfumes: Perfume[]
): Perfume[] => {

  return scorePerfumes(weather, perfumes)
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ perfume }) => perfume);
};

export const getDailyRecommendations = async (
  weather: WeatherData,
  perfumes: Perfume[]
): Promise<Perfume[]> => {
  const todayIds = await getTodayShownIds();
  if (todayIds && todayIds.length > 0) {
    const todayPerfumes = todayIds
      .map((id) => perfumes.find((p) => p.id === id))
      .filter(Boolean) as Perfume[];
    if (todayPerfumes.length > 0) {
      return todayPerfumes;
    }
  }
  const recentIds = await getRecentlyShownIds();
  const scored = scorePerfumes(weather, perfumes).filter(({score}) => score > 0);
  const freshPerfumes = scored.filter(({ perfume }) => !recentIds.has(perfume.id));
  const seenPerfumes = scored.filter(({ perfume }) => recentIds.has(perfume.id));

   const combined = [
    ...freshPerfumes.sort((a, b) => b.score - a.score),
    ...seenPerfumes.sort((a, b) => b.score - a.score),
  ];
  const recommendations = combined.slice(0, 5).map(({ perfume }) => perfume);
  await saveHistory(recommendations.map((p) => p.id));
  return recommendations;
};