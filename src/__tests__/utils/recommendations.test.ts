import { getRecommendations } from "../../utils/recommendations";
import { Perfume, WeatherData } from "../../types";

const mockPerfumes: Perfume[] = [
  {
    id: 1,
    name: "Santal 33",
    brand: "Le Labo",
    description: "Boisé",
    notes: ["santal"],
    intensity: "modérée",
    gender: "mixte",
    season: ["autumn", "winter"],
    temp_min: 5,
    temp_max: 18,
    weatherConditions: ["clouds", "rain"],
    image_url: null,
  },
  {
    id: 2,
    name: "Neroli Portofino",
    brand: "Tom Ford",
    description: "Citrus",
    notes: ["néroli"],
    intensity: "légère",
    gender: "mixte",
    season: ["spring", "summer"],
    temp_min: 18,
    temp_max: 35,
    weatherConditions: ["clear"],
    image_url: null,
  },
  {
    id: 3,
    name: "Black Opium",
    brand: "YSL",
    description: "Oriental",
    notes: ["café"],
    intensity: "intense",
    gender: "féminin",
    season: ["autumn", "winter"],
    temp_min: 0,
    temp_max: 15,
    weatherConditions: ["clouds", "rain", "snow"],
    image_url: null,
  },
];

const coldWeather: WeatherData = {
  temperature: 8,
  condition: "rain",
  description: "Pluie",
  city: "Paris",
  humidity: 80,
  feelsLike: 6,
  icon: "10d",
};

const hotWeather: WeatherData = {
  temperature: 28,
  condition: "clear",
  description: "Ensoleillé",
  city: "Nice",
  humidity: 40,
  feelsLike: 6,
  icon: "01d",
};

describe("getRecommendations", () => {
  it("retourne au maximum 5 parfums", () => {
    const results = getRecommendations(coldWeather, mockPerfumes);
    expect(results.length).toBeLessThanOrEqual(5);
  });

  it("recommande les parfums adaptés au froid et à la pluie", () => {
    const results = getRecommendations(coldWeather, mockPerfumes);
    const ids = results.map((p) => p.id);
    expect(ids).toContain(1); // Santal 33 : temp OK + saison OK + weather OK
  });

  it("recommande les parfums adaptés à la chaleur", () => {
    const results = getRecommendations(hotWeather, mockPerfumes);
    const ids = results.map((p) => p.id);
    expect(ids).toContain(2); // Neroli : temp OK + saison OK + weather OK
  });

  it("retourne un tableau vide si aucun parfum ne correspond", () => {
    const results = getRecommendations(coldWeather, []);
    expect(results).toEqual([]);
  });

  it("trie par score décroissant", () => {
    const results = getRecommendations(coldWeather, mockPerfumes);
    // Le premier résultat doit avoir le meilleur score
    expect(results[0].id).toBe(1);
  });
});