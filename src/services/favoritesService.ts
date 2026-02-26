import { supabase } from "./supabaseClient";


export const getFavorites = async (): Promise<number[]> => {
  const { data, error } = await supabase
    .from("favorites")
    .select("perfume_id");
  if (error) return [];
  return data.map((f) => f.perfume_id);
};

export const addFavorite = async (perfumeId: number): Promise<void> => {
 const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("favorites").insert({
    user_id: user.id,
    perfume_id: perfumeId,
  });
};

export const removeFavorite = async (perfumeId: number): Promise<void> => {
  await supabase.from("favorites").delete().eq("perfume_id", perfumeId);
};

export const toggleFavorite = async (perfumeId: number): Promise<boolean> => {
  const favorites = await getFavorites();
  if (favorites.includes(perfumeId)) {
    await removeFavorite(perfumeId);
    return false;
  } else {
    await addFavorite(perfumeId);
    return true;
  }
};