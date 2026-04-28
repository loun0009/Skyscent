import { WeatherData, Perfume, Season } from "../types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../services/supabaseClient";

// ─── Constantes ───────────────────────────────────────────────
const HISTORY_KEY = "recommendations_history";
const MAX_HISTORY_DAYS = 7;
const RECOMMENDATIONS_LIMIT = 15;
const SCORE_THRESHOLD_RATIO = 0.65; // On garde les parfums à >= 65% du score max ( + de diversité)

// ─── Profil utilisateur transmis à l'algo ─────────────────────
export interface UserPreferences {
  gender: "masculin" | "féminin" | null;
  preferredIntensity: "légère" | "modérée" | "intense" | null;
  preferredSeason: Season | null;
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

// ─── AsyncStorage (recommandations du jour) ────────────────────
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

// ─── Historique Supabase (parfums portés récemment) ───────────
const getRecentlyWornIds = async (): Promise<Set<number>> => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7); // 7 derniers jours

    const { data } = await supabase
      .from("perfume_history")
      .select("perfume_id, worn_at")
      .gte("worn_at", since.toISOString())
      .order("worn_at", { ascending: false });

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
const scorePerfumes = (
  weather: WeatherData,
  perfumes: Perfume[],
  prefs: UserPreferences,
  recentlyWornIds: Set<number>
): { perfume: Perfume; score: number }[] => {
  const weatherSeason = getSeason(weather.temperature);
  const condition = weather.condition.toLowerCase();

  return perfumes.map((perfume) => {
    let score = 0;

    // ── Critères météo ─────────────────────────────────────────
    // Température dans la plage idéale (+3)
    if (
      weather.temperature >= perfume.temp_min &&
      weather.temperature <= perfume.temp_max
    ) {
      score += 3;
    } else {
      // Pénalité partielle si proche de la plage (+1)
      const delta = Math.min(
        Math.abs(weather.temperature - perfume.temp_min),
        Math.abs(weather.temperature - perfume.temp_max)
      );
      if (delta <= 3) score += 1;
    }

    // Saison météo correspondante (+2)
    if (Array.isArray(perfume.season) && perfume.season.includes(weatherSeason)) {
      score += 2;
    }

    // Condition météo correspondante (+1)
    if (
      Array.isArray(perfume.weatherConditions) &&
      perfume.weatherConditions.includes(condition)
    ) {
      score += 1;
    }

    // ── Préférences utilisateur ────────────────────────────────
    // Intensité préférée (+2)
    if (prefs.preferredIntensity && perfume.intensity === prefs.preferredIntensity) {
      score += 2;
    }

    // Saison préférée correspond à la saison météo actuelle (+2)
    // (on booste seulement si la saison préférée matche aussi la météo)
    if (
      prefs.preferredSeason &&
      prefs.preferredSeason === weatherSeason &&
      Array.isArray(perfume.season) &&
      perfume.season.includes(prefs.preferredSeason)
    ) {
      score += 2;
    }

    // ── Pénalités ──────────────────────────────────────────────
    // Porté dans les 7 derniers jours (-2)
    if (recentlyWornIds.has(perfume.id)) {
      score -= 2;
    }

    return { perfume, score };
  });
};

// ─── Sélection par seuil relatif ──────────────────────────────
// Au lieu de ne garder que le score max, on garde tout ce qui est
// >= SCORE_THRESHOLD_RATIO du score max puis on mélange
const pickByThreshold = <T extends { score: number }>(
  items: T[],
  limit: number
): T[] => {
  if (items.length === 0) return [];
  const maxScore = Math.max(...items.map((i) => i.score));
  const threshold = maxScore * SCORE_THRESHOLD_RATIO;
  const eligible = items.filter((i) => i.score >= threshold);
  return shuffleArray(eligible).slice(0, limit);
};

// ─── Export principal ──────────────────────────────────────────
export const getDailyRecommendations = async (
  weather: WeatherData,
  perfumes: Perfume[],
  prefs: UserPreferences
): Promise<Perfume[]> => {

  // 1. Filtrer par genre
  const genderFiltered = prefs.gender
    ? perfumes.filter(
        (p) => p.gender === prefs.gender || p.gender === "mixte"
      )
    : perfumes;

  // 2. Si les recommandations du jour existent déjà → les retourner
  const todayIds = await getTodayShownIds(prefs.gender);
  if (todayIds && todayIds.length > 0) {
    const todayPerfumes = todayIds
      .map((id) => genderFiltered.find((p) => p.id === id))
      .filter(Boolean) as Perfume[];
    if (todayPerfumes.length > 0) return todayPerfumes;
  }

  // 3. Charger l'historique de port (Supabase) et les recommandations récentes
  const [recentlyWornIds, recentlyShownIds] = await Promise.all([
    getRecentlyWornIds(),
    getRecentlyShownIds(prefs.gender),
  ]);

  // 4. Scorer tous les parfums
  const scored = scorePerfumes(weather, genderFiltered, prefs, recentlyWornIds)
    .filter(({ score }) => score > 0); // Exclure les scores nuls ou négatifs

  // 5. Séparer les parfums frais (non montrés récemment) des autres
  const fresh = scored.filter(({ perfume }) => !recentlyShownIds.has(perfume.id));
  const seen = scored.filter(({ perfume }) => recentlyShownIds.has(perfume.id));

  // 6. Prioriser les parfums frais, compléter avec les vus si besoin
  const pool = fresh.length >= 5 ? fresh : [...fresh, ...seen];

  // 7. Sélectionner par seuil relatif
  const recommendations = pickByThreshold(pool, RECOMMENDATIONS_LIMIT)
    .map(({ perfume }) => perfume);

  // 8. Sauvegarder pour le reste de la journée
  await saveHistory(recommendations.map((p) => p.id), prefs.gender);

  return recommendations;
};