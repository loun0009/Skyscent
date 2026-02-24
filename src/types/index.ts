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
    image_url: string;
}

// Saisons de l'année
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface Filters {
    gender: 'tous' | 'masculin' | 'féminin' | 'mixte';
    intensity: 'tous' | 'légère' | 'modérée' | 'intense';
    brand: string;
}