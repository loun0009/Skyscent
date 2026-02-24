import { WeatherData, Perfume, Season } from "../types";

const getSeason = (temp: number): Season => {
  if (temp <= 5) return "winter";
  if (temp <= 14) return "autumn";
  if (temp <= 22) return "spring";
  return "summer";
};

export const getRecommendations = (
  weather: WeatherData,
  perfumes: Perfume[]
): Perfume[] => {
  const season = getSeason(weather.temperature);
  const condition = weather.condition.toLowerCase();

  const scored = perfumes.map((perfume) => {
    let score = 0;

    if (
      perfume.temp_min !== undefined &&
      perfume.temp_max !== undefined &&
      weather.temperature >= perfume.temp_min &&
      weather.temperature <= perfume.temp_max
    ) {
      score += 3;
    }

    if (Array.isArray(perfume.season) && perfume.season.includes(season)) {
      score += 2;
    }

    if (
      Array.isArray(perfume.weatherConditions) &&
      perfume.weatherConditions.includes(condition)
    ) {
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