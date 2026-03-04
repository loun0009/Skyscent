import { supabase } from "./supabaseClient";
import { User } from "../types";

export const fetchProfile = async (userId : string): Promise<Partial<User> | null> => {
    const {data, error} = await supabase
        .from("profiles")
        .select("*")
        .eq("id",userId)
        .single();

    if (error) return null;
    return {
        first_name: data.first_name,
        last_name: data.last_name,
        age: data.age,
        gender: data.gender,
        preferred_intensity: data.preferred_intensity,
        preferred_season: data.preferred_season,
        onboarding_completed: data.onboarding_completed ?? false,
    };
};

export const updateProfile = async (
    userId: string,
    updates: {
        first_name?: string;
        last_name?: string;
        age?: number;
        gender?: "homme" | "femme" | "autre";
        preferred_intensity?: "légère" | "modérée" | "intense";
        preferred_season?: "spring" | "summer" | "autumn" | "winter";
        onboarding_completed?: boolean;
    }
): Promise<boolean> => {
    const {error} = await supabase
        .from("profiles")
        .update({ ...updates, updated_at: new Date().toISOString()})
        .eq("id",userId)
    
    return !error;
}