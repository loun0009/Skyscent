import { supabase } from "./supabaseClient";
import { Perfume } from "../types";

export const fetchPerfumes = async (): Promise<Perfume[]> => {
  const { data, error } = await supabase
    .from("perfumes")
    .select("*")
    .order("name", { ascending: true });

  console.log("data :", JSON.stringify(data));
  console.log("error :", JSON.stringify(error));
  console.log("type error :", typeof error);

  if (error) {
    console.error("Erreur complète :", JSON.stringify(error));
    throw new Error(error.message);
  }

  return data as Perfume[];
};

export const fetchPerfumeById = async (id: number): Promise<Perfume | null> => {
    const { data, error } = await supabase
        .from("perfumes")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error(`Erreur chargement du parfum ${id}:`, error);
        return null;
    }
    return data as Perfume;
};