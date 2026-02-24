import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "parfummeteo:favorites";

export const getFavorites = async (): Promise<number[]> => {
  try {
    const data = await AsyncStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const addFavorite = async (id: number): Promise<void> => {
  try {
    const favorites = await getFavorites();
    if (!favorites.includes(id)) {
      await AsyncStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify([...favorites, id])
      );
    }
  } catch (e) {
    console.error("Erreur ajout favori :", e);
  }
};

export const removeFavorite = async (id: number): Promise<void> => {
  try {
    const favorites = await getFavorites();
    await AsyncStorage.setItem(
      FAVORITES_KEY,
      JSON.stringify(favorites.filter((fid) => fid !== id))
    );
  } catch (e) {
    console.error("Erreur suppression favori :", e);
  }
};

export const toggleFavorite = async (id: number): Promise<boolean> => {
  const favorites = await getFavorites();
  if (favorites.includes(id)) {
    await removeFavorite(id);
    return false;
  } else {
    await addFavorite(id);
    return true;
  }
};