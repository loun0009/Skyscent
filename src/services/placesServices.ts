const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

export interface PerfumeStore {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number | null;
  isOpen: boolean | null;
  distance?: number;
}

export const fetchNearbyPerfumeStores = async (
  latitude: number,
  longitude: number,
  radius: number = 3000
): Promise<PerfumeStore[]> => {
  try {
    // Utilisation de l'API Google Places pour trouver les parfumeries à proximité
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=parfumerie&language=fr&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Places API error:", data.status);
      return [];
    }

    return data.results.map((place: any) => ({
      id: place.place_id,
      name: place.name,
      address: place.vicinity,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      rating: place.rating ?? null,
      isOpen: place.opening_hours?.open_now ?? null,
    }));
  } catch (e) {
    console.error("Erreur fetchNearbyPerfumeStores:", e);
    return [];
  }
};