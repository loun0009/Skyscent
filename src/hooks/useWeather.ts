import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { WeatherData } from '../types';
import { fetchWeather } from '../services/weatherApi';

interface UseWeatherReturn {
    weather: WeatherData | null;
    loading: boolean;
    error: string | null;
    refresh: () => void;
}

export const useWeather = (): UseWeatherReturn => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadWeather = async () => {
        try {
            setLoading(true);
            setError(null);

            // Demander la permission de localisation
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setError('Permission de localisation refusée');
                setLoading(false);
                return;
            }

            // Récupérer la position actuelle
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            // Appel API météo
            const data = await fetchWeather(
                location.coords.latitude,
                location.coords.longitude
            );
            setWeather(data);
        } catch (err) {
            setError('Erreur lors de la récupération des données météo');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWeather();
    }, []);

    return { weather, loading, error, refresh: loadWeather };
}
