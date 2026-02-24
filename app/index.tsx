import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useWeather } from "../src/hooks/useWeather";
import { usePerfumes } from "../src/hooks/usePerfumes";
import { useFilters } from "../src/hooks/useFilters";
import { WeatherCard } from "../src/components/weatherCard";
import { PerfumeCard } from "../src/components/perfumeCard";
import { FilterBar } from "../src/components/filterBar";
import { LoadingScreen } from "../src/components/loadingScreen";
import { ErrorMessage } from "../src/components/errorBoundary";
import { Perfume } from "../src/types";
import { useFavorites } from "../src/context/FavoritesContext";

export default function HomeScreen() {
  const router = useRouter();
  const { weather, loading: weatherLoading, error, refresh } = useWeather();
  const { recommendations, perfumes, loading: perfumesLoading } = usePerfumes(weather);
  const { filters, setGender, setIntensity, setBrand, resetFilters, applyFilters, activeCount } = useFilters();
  const { isFavorite, toggle } = useFavorites();

  // On applique les filtres sur les recommandations
  const filteredRecommendations = applyFilters(recommendations);

  const handlePerfumePress = (perfume: Perfume) => {
    router.push({ pathname: "/perfume/[id]", params: { id: perfume.id } });
  };

  if (weatherLoading) {
    return <LoadingScreen message="Détection de votre position..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refresh} />;
  }

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8fc" />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.headline}>Votre parfum du jour</Text>

        {weather && <WeatherCard weather={weather} />}

        {/* Barre de filtres */}
        <FilterBar
          filters={filters}
          perfumes={perfumes}
          activeCount={activeCount}
          onGenderChange={setGender}
          onIntensityChange={setIntensity}
          onBrandChange={setBrand}
          onReset={resetFilters}
        />

        <Text style={styles.sectionTitle}>
          {filteredRecommendations.length > 0
            ? `${filteredRecommendations.length} parfum${filteredRecommendations.length > 1 ? "s" : ""} recommandé${filteredRecommendations.length > 1 ? "s" : ""} 🌸`
            : "Aucun parfum pour ces filtres 😔"}
        </Text>

        {perfumesLoading ? (
          <LoadingScreen message="Analyse des parfums..." />
        ) : (
          filteredRecommendations.map((perfume) => (
            <PerfumeCard
              key={perfume.id}
              perfume={perfume}
              onPress={handlePerfumePress}
              isFavorite={isFavorite(perfume.id)}
              onToggleFavorite={toggle}
            />
          ))
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Mis à jour à {new Date().toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <TouchableOpacity onPress={refresh}>
            <Text style={styles.refreshText}>↻ Actualiser</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#f8f8fc" },
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  headline: { fontSize: 28, fontWeight: "bold", color: "#1a1a2e", marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#1a1a2e", marginBottom: 16 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  footerText: { fontSize: 12, color: "#aaa" },
  refreshText: { fontSize: 14, color: "#6B4EFF", fontWeight: "600" },
});