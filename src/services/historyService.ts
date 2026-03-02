import { supabase } from "./supabaseClient";
import { HistoryEntry } from "../types";

export const getHistory = async (): Promise<HistoryEntry[]> => {
    const {data, error} = await supabase
        .from("perfume_history")
        .select(`*, perfume:perfumes(*)`)
        .order("worn_at", { ascending: false })
        .limit(50);

    if (error) {
        console.error("Erreur lors de la récupération de l'historique :", error);
        return [];
    }

    return data as HistoryEntry[];
};

export const addToHistory = async ( perfumeId: number, temperature: number | null, weatherCondition: string | null, city: string | null ): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error("Utilisateur non authentifié");
    return false;
  }

  const { error } = await supabase.from("perfume_history").insert({
    user_id: user.id,
    perfume_id: perfumeId,
    temperature,
    weather_condition: weatherCondition,
    city,
  });

  return !error;
};

export const deleteHistoryEntry = async (entryId: number): Promise<boolean> => {
    const { error } = await supabase.from("perfume_history").delete().eq("id", entryId);
    return !error;
};

export const clearHistory = async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error("Utilisateur non authentifié");
        return false;
    }
    const { error } = await supabase.from("perfume_history").delete().eq("user_id", user.id);
    return !error;
};

export const isWornToday = async (perfumeId: number): Promise<boolean> => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  const { data, error } = await supabase
    .from("perfume_history")
    .select("id")
    .eq("perfume_id", perfumeId)
    .gte("worn_at", startOfDay)
    .lte("worn_at", endOfDay);

  if (error) return false;
  return data.length > 0;
};