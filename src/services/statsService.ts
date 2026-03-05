import { supabase } from "./supabaseClient";

export interface UserStats {
  totalWorn: number;
  uniquePerfumes: number;
  favoritePerfume: { name: string; brand: string; count: number } | null;
  favoriteBrand: { name: string; count: number } | null;
  favoriteIntensity: { value: string; count: number } | null;
  favoriteSeason: { value: string; count: number } | null;
  averageTemperature: number | null;
  currentStreak: number;
}

export const getUserStats = async (): Promise<UserStats> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return emptyStats();

  const { data, error } = await supabase
    .from("perfume_history")
    .select(`*,perfume:perfumes(name, brand, intensity, season)`)
    .eq("user_id", user.id)
    .order("worn_at", { ascending: false });

  if (error || !data.length) return emptyStats();

  const totalWorn = data.length;

  const uniquePerfumes = new Set(data.map((e) => e.perfume_id)).size;

  // Parfum le plus porté
  const perfumeCount: Record<number, { name: string; brand: string; count: number }> = {};
  data.forEach((e) => {
    if (!perfumeCount[e.perfume_id]) {
      perfumeCount[e.perfume_id] = {
        name: e.perfume?.name ?? "Inconnu",
        brand: e.perfume?.brand ?? "",
        count: 0,
      };
    }
    perfumeCount[e.perfume_id].count++;
  });
  const favoritePerfume = Object.values(perfumeCount).sort((a, b) => b.count - a.count)[0] ?? null;

  // Marque favorite
  const brandCount: Record<string, number> = {};
  data.forEach((e) => {
    const brand = e.perfume?.brand ?? "Inconnu";
    brandCount[brand] = (brandCount[brand] ?? 0) + 1;
  });
  const favoriteBrandEntry = Object.entries(brandCount).sort((a, b) => b[1] - a[1])[0];
  const favoriteBrand = favoriteBrandEntry
    ? { name: favoriteBrandEntry[0], count: favoriteBrandEntry[1] }
    : null;

  // Intensité favorite
  const intensityCount: Record<string, number> = {};
  data.forEach((e) => {
    const intensity = e.perfume?.intensity ?? "inconnue";
    intensityCount[intensity] = (intensityCount[intensity] ?? 0) + 1;
  });
  const favoriteIntensityEntry = Object.entries(intensityCount).sort((a, b) => b[1] - a[1])[0];
  const favoriteIntensity = favoriteIntensityEntry
    ? { value: favoriteIntensityEntry[0], count: favoriteIntensityEntry[1] }
    : null;

  // Saison favorite
  const seasonCount: Record<string, number> = {};
  data.forEach((e) => {
    const date = new Date(e.worn_at);
    const month = date.getMonth();
    const season =
      month >= 2 && month <= 4 ? "spring" :
      month >= 5 && month <= 7 ? "summer" :
      month >= 8 && month <= 10 ? "autumn" : "winter";
    seasonCount[season] = (seasonCount[season] ?? 0) + 1;
  });
  const favoriteSeasonEntry = Object.entries(seasonCount).sort((a, b) => b[1] - a[1])[0];
  const favoriteSeason = favoriteSeasonEntry
    ? { value: favoriteSeasonEntry[0], count: favoriteSeasonEntry[1] }
    : null;

  const temps = data.filter((e) => e.temperature !== null).map((e) => e.temperature);
  const averageTemperature = temps.length
    ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length)
    : null;

  const currentStreak = calculateStreak(data.map((e) => e.worn_at));

  return {
    totalWorn,
    uniquePerfumes,
    favoritePerfume,
    favoriteBrand,
    favoriteIntensity,
    favoriteSeason,
    averageTemperature,
    currentStreak,
  };
};

const calculateStreak = (dates: string[]): number => {
  if (!dates.length) return 0;

  const uniqueDays = [...new Set(
    dates.map((d) => new Date(d).toDateString())
  )].map((d) => new Date(d)).sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < uniqueDays.length; i++) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    if (uniqueDays[i].toDateString() === expected.toDateString()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

const emptyStats = (): UserStats => ({
  totalWorn: 0,
  uniquePerfumes: 0,
  favoritePerfume: null,
  favoriteBrand: null,
  favoriteIntensity: null,
  favoriteSeason: null,
  averageTemperature: null,
  currentStreak: 0,
});