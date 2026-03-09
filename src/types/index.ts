// Données météo retournées par OpenWeatherMap
export interface WeatherData {
    temperature: number;
    feelsLike: number;
    condition: string;
    description: string;
    humidity: number;
    city: string;
    icon: string;
}

// Données de parfum 
export interface Perfume {
    id: number;
    name: string;
    brand: string;
    season: Season[];
    temp_min: number;
    temp_max: number;
    weatherConditions: string[];
    notes: string[];
    intensity: 'légère' | 'modérée' | 'intense';
    gender: "masculin" | "féminin" | "mixte";
    description: string;
    image_url: string | null;
}

// Saisons de l'année
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface Filters {
    gender: 'tous' | 'masculin' | 'féminin' | 'mixte';
    intensity: 'tous' | 'légère' | 'modérée' | 'intense';
    brand: string;
}

export interface User {
    id: string;
    email: string;
    created_at: string;
    first_name: string | null;
    last_name: string | null;
    age: number | null;
    gender: "homme" | "femme" | "autre" | null;
    preferred_intensity: "légère" | "modérée" | "intense" | null;
    preferred_season: "spring" | "summer" | "autumn" | "winter" | null;
    onboarding_completed: boolean;
}

export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

export interface HistoryEntry {
    id: number;
    user_id: string;
    perfume_id: number;
    worn_at: string;
    temperature: number | null;
    weather_condition: string | null;
    city: string | null;
    perfume: Perfume;
}

export interface Review {
    id: number;
    user_id: string;
    perfume_id: number;
    rating: number; // 1 à 5
    comment: string | null;
    created_at: string;
    updated_at: string;
    profile?: {
        first_name: string | null;
        last_name: string | null;
    };
}

export interface PerfumeRating {
    average: number;
    count: number;
}