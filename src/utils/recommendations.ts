import { WeatherData, Perfume, Season } from "../types";

const getSeason = (temp: number): Season => {
  if (temp <= 5) return "winter";
  if (temp <= 14) return "autumn";
  if (temp <= 22) return "spring";
  return "summer";
};

const normalizeCondition = (condition: string): string => {
  return condition.toLowerCase();
};

export const getRecommendations = (
  weather: WeatherData,
  perfumes: Perfume[]
): Perfume[] => {
  const season = getSeason(weather.temperature);
  const condition = normalizeCondition(weather.condition);

  const scored = perfumes.map((perfume) => {

    let score = 0;

    const range = perfume["temperatureRange"]; 
    if (range && range["min"] !== undefined && range["max"] !== undefined) {
      if (weather.temperature >= range["min"] && weather.temperature <= range["max"]) {
        score += 3;
      }
    }

    if (Array.isArray(perfume.season) && perfume.season.includes(season)) {
      score += 2;
    }

    if (Array.isArray(perfume.weatherConditions) && perfume.weatherConditions.includes(condition)) {
      score += 1;
    }

    return { perfume, score };
  });

  return scored
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ perfume }) => perfume);
};