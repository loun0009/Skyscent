import axios from 'axios';
import { WeatherData } from '../types';

const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
const BASE_URL = process.env.EXPO_PUBLIC_WEATHER_BASE_URL;

export const fetchWeather = async ( 
    lat: number, 
    lon: number
): Promise<WeatherData> => {
    const response = await axios.get(`${BASE_URL}/weather`, {
        params: {
            lat,
            lon,
            appid: API_KEY,
            units: 'metric',  // température en °C
            lang: 'fr',
        },
    });

    const data = response.data;

    return {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        condition: data.weather[0].main,
        description: data.weather[0].description,
        humidity: data.main.humidity,
        city: data.name,
        icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
    };
};