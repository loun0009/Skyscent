import { supabase } from "./supabaseClient";
import { Review, PerfumeRating } from "../types";

export const getReviewsForPerfume = async (perfumeId: number): Promise<Review[]> => {
  // 1 — Récupère les avis
  const { data: reviewsData, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("perfume_id", perfumeId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }

  if (!reviewsData.length) return [];

  // 2 — Récupère les profils associés
  const userIds = reviewsData.map((r) => r.user_id);
  const { data: profilesData } = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .in("id", userIds);

  // 3 — Associe les profils aux avis
  return reviewsData.map((review) => ({
    ...review,
    profile: profilesData?.find((p) => p.id === review.user_id) ?? null,
  })) as Review[];
};

export const getUserReview = async (perfumeId: number): Promise<Review | null> => {
    const { data: {user}} = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("perfume_id", perfumeId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
        console.error("Error fetching user review:", error);
        return null;
    }

    return data as Review | null;
};

export const upsertReview = async (perfumeId: number, rating: number, comment: string | null): Promise<boolean> => {
    const { data: {user}} = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
        .from("reviews")
        .upsert({
            user_id: user.id,
            perfume_id: perfumeId,
            rating,
            comment,
            updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,perfume_id" });

    return !error;
};

export const deleteReview = async (perfumeId: number): Promise<boolean> => {
    const { data: {user}} = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("perfume_id", perfumeId)
        .eq("user_id", user.id);

    return !error;
};

export const getPerfumeRating = async (perfumeId: number): Promise<PerfumeRating> => {
    const { data, error } = await supabase
        .from("reviews")
        .select("rating")
        .eq("perfume_id", perfumeId);
    
    if (error || !data.length) return { average: 0, count: 0 };

    const average = data.reduce((sum, review) => sum + review.rating, 0) / data.length;
    return { average: Math.round(average*10)/10 , count: data.length };
};