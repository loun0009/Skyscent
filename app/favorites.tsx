import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useFavorites } from "../src/context/FavoritesContext";
import { PerfumeCard } from "../src/components/perfumeCard";
import { Perfume } from "../src/types";
import { useAppTheme } from "../src/theme";

export default function FavoritesScreen() {
  const router = useRouter();
  const { favoritePerfumes, isFavorite, toggle, loading } = useFavorites();
  const colors = useAppTheme();
  const styles = makeStyles(colors);

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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headline}>Mes favoris ❤️</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Contenu: état vide ou liste */}

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

const makeStyles = (colors: any) =>
  StyleSheet.create({
    // Layout
    wrapper: { 
      flex: 1, 
      backgroundColor: colors.background 
    },
    container: { flex: 1 },
    content: { 
      padding: 20, 
    paddingTop: 60, 
    paddingBottom: 40 
  },

    // Header
    headline: { 
      fontSize: 22, 
      fontWeight: "bold", 
      color: colors.text, 
    },

  // État vide
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
    color: colors.text, 
    marginBottom: 8 
  },
  emptySubtitle: { 
    fontSize: 14, 
    color:  colors.textSecondary, 
    textAlign: "center", 
    lineHeight: 22 
  },

  // Navigation
   backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gold20,
  },
  backText: {
    fontSize: 18,
    color: colors.gold,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
});