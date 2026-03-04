import { useState, useEffect } from "react";
import * as Location from "expo-location";
import { fetchNearbyPerfumeStores, PerfumeStore } from "../services/placesServices";

interface UseNearbyStoresReturn {
  stores: PerfumeStore[];
  loading: boolean;
  error: string | null;
  userLocation: { latitude: number; longitude: number } | null;
  refresh: () => void;
  radius: number;
  setRadius: (r: number) => void;
}

export const useNearbyStores = (): UseNearbyStoresReturn => {
  const [stores, setStores] = useState<PerfumeStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [radius, setRadius] = useState(3000);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
// Demander la permission d'accéder à la localisation
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Permission de localisation refusée.");
        return;
      }
// Récupérer la localisation actuelle de l'utilisateur
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(coords);
// Récupérer les parfumeries à proximité en utilisant les coordonnées de l'utilisateur
      const results = await fetchNearbyPerfumeStores(
        coords.latitude,
        coords.longitude,
        radius
      );

      setStores(results);
    } catch (e) {
      setError("Impossible de charger les parfumeries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [radius]);
  
  return {
    stores,
    loading,
    error,
    userLocation,
    refresh: load,
    radius,
    setRadius,
  };
};