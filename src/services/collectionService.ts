import { supabase } from "./supabaseClient";
import { Perfume } from "../types";

export const getCollection = async (): Promise<Perfume[]> => {
  const { data, error } = await supabase
    .from("collection")
    .select(`perfume:perfumes(*)`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur getCollection:", error.message);
    return [];
  }

  return data.map((e: any) => e.perfume) as Perfume[];
};

export const addToCollection = async (perfumeId: number): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("collection")
    .insert({ user_id: user.id, perfume_id: perfumeId });

  return !error;
};

export const removeFromCollection = async (perfumeId: number): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("collection")
    .delete()
    .eq("user_id", user.id)
    .eq("perfume_id", perfumeId);

  return !error;
};

export const addManyToCollection = async (perfumeIds: number[]): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const rows = perfumeIds.map((perfume_id) => ({
    user_id: user.id,
    perfume_id,
  }));

  const { error } = await supabase
    .from("collection")
    .upsert(rows, { onConflict: "user_id,perfume_id" });

  return !error;
};