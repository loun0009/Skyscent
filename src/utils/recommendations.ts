import { WeatherData, Perfume, Season } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../services/supabaseClient";

// ─── Constantes ───────────────────────────────────────────────
const HISTORY_KEY = "recommendations_history";
const MAX_HISTORY_DAYS = 7;
const RECOMMENDATIONS_LIMIT = 15;
const SCORE_THRESHOLD_RATIO = 0.65;

// ─── Profil utilisateur transmis à l'algo ─────────────────────
export interface UserPreferences {
  gender: "masculin" | "féminin" | null;
  preferredIntensity: "légère" | "modérée" | "intense" | null;
  preferredSeason: Season | null;
  collectionIds: number[]; 
}

// ─── Utilitaires de date ───────────────────────────────────────
const getSeason = (temp: number): Season => {
  if (temp <= 5) return "winter";
  if (temp <= 14) return "autumn";
  if (temp <= 22) return "spring";
  return "summer";
};

const getTodayKey = (): string => new Date().toISOString().split("T")[0];

const getHistoryKey = (gender?: string | null): string =>
  `${HISTORY_KEY}_${gender ?? "all"}`;

// ─── AsyncStorage ──────────────────────────────────────────────
const loadHistory = async (
  gender?: string | null
): Promise<Record<string, number[]>> => {
  try {
    const raw = await AsyncStorage.getItem(getHistoryKey(gender));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveHistory = async (
  ids: number[],
  gender?: string | null
): Promise<void> => {
  try {
    const history = await loadHistory(gender);
    const today = getTodayKey();
    history[today] = ids;
    const keys = Object.keys(history).sort();
    while (keys.length > MAX_HISTORY_DAYS) delete history[keys.shift()!];
    await AsyncStorage.setItem(getHistoryKey(gender), JSON.stringify(history));
  } catch {
    // silencieux
  }
};

const getTodayShownIds = async (
  gender?: string | null
): Promise<number[] | null> => {
  const history = await loadHistory(gender);
  return history[getTodayKey()] || null;
};

const getRecentlyShownIds = async (
  gender?: string | null
): Promise<Set<number>> => {
  const history = await loadHistory(gender);
  const today = getTodayKey();
  const ids = new Set<number>();
  Object.entries(history).forEach(([date, perfumeIds]) => {
    if (date !== today) perfumeIds.forEach((id) => ids.add(id));
  });
  return ids;
};

// ─── Historique Supabase ───────────────────────────────────────
const getRecentlyWornIds = async (): Promise<Set<number>> => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const { data } = await supabase
      .from("perfume_history")
      .select("perfume_id")
      .gte("worn_at", since.toISOString());
    return new Set((data ?? []).map((e) => e.perfume_id));
  } catch {
    return new Set();
  }
};

// ─── Shuffle ──────────────────────────────────────────────────
const shuffleArray = <T>(items: T[]): T[] => {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ─── Scoring ──────────────────────────────────────────────────
//
//  Météo           : temp plage (+3), temp proche (+1), saison (+2), condition (+1)
//  Préférences     : intensité (+2), saison préférée (+2)
//  Collection      : dans ma collection (+2)
//  Pénalités       : porté récemment (-2)
//  Score max théorique : 12
//
const scorePerfumes = (
  weather: WeatherData,
  perfumes: Perfume[],
  prefs: UserPreferences,
  recentlyWornIds: Set<number>
): { perfume: Perfume; score: number }[] => {
  const weatherSeason = getSeason(weather.temperature);
  const condition = weather.condition.toLowerCase();
  const collectionSet = new Set(prefs.collectionIds);

  return perfumes.map((perfume) => {
    let score = 0;

    // ── Météo ──────────────────────────────────────────────────
    if (
      weather.temperature >= perfume.temp_min &&
      weather.temperature <= perfume.temp_max
    ) {
      score += 3;
    } else {
      const delta = Math.min(
        Math.abs(weather.temperature - perfume.temp_min),
        Math.abs(weather.temperature - perfume.temp_max)
      );
      if (delta <= 3) score += 1;
    }

    if (Array.isArray(perfume.season) && perfume.season.includes(weatherSeason)) {
      score += 2;
    }

    if (
      Array.isArray(perfume.weatherConditions) &&
      perfume.weatherConditions.includes(condition)
    ) {
      score += 1;
    }

    // ── Préférences utilisateur ────────────────────────────────
    if (prefs.preferredIntensity && perfume.intensity === prefs.preferredIntensity) {
      score += 2;
    }

    if (
      prefs.preferredSeason &&
      prefs.preferredSeason === weatherSeason &&
      Array.isArray(perfume.season) &&
      perfume.season.includes(prefs.preferredSeason)
    ) {
      score += 2;
    }

    // ── Collection (+2) ────────────────────────────────────────
    // Un parfum que l'utilisateur possède et qui est adapté
    // à la météo remonte naturellement en tête
    if (collectionSet.has(perfume.id)) {
      score += 2;
    }

    // ── Pénalités ──────────────────────────────────────────────
    if (recentlyWornIds.has(perfume.id)) {
      score -= 2;
    }

    return { perfume, score };
  });
};

// ─── Sélection par seuil relatif ──────────────────────────────
const pickByThreshold = <T extends { score: number }>(
  items: T[],
  limit: number
): T[] => {
  if (items.length === 0) return [];
  const maxScore = Math.max(...items.map((i) => i.score));
  const threshold = maxScore * SCORE_THRESHOLD_RATIO;
  return shuffleArray(items.filter((i) => i.score >= threshold)).slice(0, limit);
};

// ─── Export principal ──────────────────────────────────────────
export const getDailyRecommendations = async (
  weather: WeatherData,
  perfumes: Perfume[],
  prefs: UserPreferences
): Promise<Perfume[]> => {

  // 1. Filtrer par genre
  const genderFiltered = prefs.gender
    ? perfumes.filter((p) => p.gender === prefs.gender || p.gender === "mixte")
    : perfumes;

  // 2. Recommandations du jour déjà calculées → les retourner
  const todayIds = await getTodayShownIds(prefs.gender);
  if (todayIds && todayIds.length > 0) {
    const todayPerfumes = todayIds
      .map((id) => genderFiltered.find((p) => p.id === id))
      .filter(Boolean) as Perfume[];
    if (todayPerfumes.length > 0) return todayPerfumes;
  }

  // 3. Charger les historiques en parallèle
  const [recentlyWornIds, recentlyShownIds] = await Promise.all([
    getRecentlyWornIds(),
    getRecentlyShownIds(prefs.gender),
  ]);

  // 4. Scorer
  const scored = scorePerfumes(weather, genderFiltered, prefs, recentlyWornIds)
    .filter(({ score }) => score > 0);

  // 5. Prioriser les parfums non montrés récemment
  const fresh = scored.filter(({ perfume }) => !recentlyShownIds.has(perfume.id));
  const seen = scored.filter(({ perfume }) => recentlyShownIds.has(perfume.id));
  const pool = fresh.length >= 5 ? fresh : [...fresh, ...seen];

  // 6. Sélectionner par seuil
  const recommendations = pickByThreshold(pool, RECOMMENDATIONS_LIMIT)
    .map(({ perfume }) => perfume);

  // 7. Sauvegarder pour la journée
  await saveHistory(recommendations.map((p) => p.id), prefs.gender);

  return recommendations;
};