import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useFavorites } from "../src/context/FavoritesContext";
import { PerfumeCard } from "../src/components/perfumeCard";
import { Perfume } from "../src/types";
import { theme } from "../src/theme";

export default function FavoritesScreen() {
  const router = useRouter();
  const { favoritePerfumes, isFavorite, toggle, loading } = useFavorites();

  const handlePress = (perfume: Perfume) => {
    router.push({ pathname: "/perfume/[id]", params: { id: perfume.id } });
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headline}>Mes favoris ❤️</Text>

        {!loading && favoritePerfumes.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🤍</Text>
            <Text style={styles.emptyTitle}>Aucun favori pour l'instant</Text>
            <Text style={styles.emptySubtitle}>
              Appuie sur le cœur d'un parfum pour l'ajouter ici.
            </Text>
          </View>
        ) : (
          favoritePerfumes.map((perfume) => (
            <PerfumeCard
              key={perfume.id}
              perfume={perfume}
              onPress={handlePress}
              isFavorite={isFavorite(perfume.id)}
              onToggleFavorite={toggle}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  container: { flex: 1 },
  content: { 
    padding: 20, 
    paddingTop: 60, 
    paddingBottom: 40 
  },
  headline: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: theme.colors.textPrimary, 
    marginBottom: 24 
  },
  empty: { 
    flex: 1, 
    alignItems: "center", 
    marginTop: 80 
  },
  emptyEmoji: { 
    fontSize: 56, 
    marginBottom: 16 
  },
  emptyTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: theme.colors.textPrimary, 
    marginBottom: 8 
  },
  emptySubtitle: { 
    fontSize: 14, 
    color: theme.colors.textSecondary, 
    textAlign: "center", 
    lineHeight: 22 
  },
});