import {View, Text, ScrollView, ActivityIndicator, StyleSheet, StatusBar,TouchableOpacity,} from "react-native";
import { useRouter } from "expo-router";
import { useWeather } from "../src/hooks/useWeather";
import { usePerfumes } from "../src/hooks/usePerfumes";
import { WeatherCard } from "../src/components/weatherCard";
import { PerfumeCard } from "../src/components/perfumeCard";
import { Perfume } from "../src/types";

export default function HomeScreen() {
  const router = useRouter();
  const { weather, loading: weatherLoading, error, refresh } = useWeather();
  const { recommendations, loading: perfumesLoading } = usePerfumes(weather);

  const handlePerfumePress = (perfume: Perfume) => {
    router.push({ pathname: "/perfume/[id]", params: { id: perfume.id } });
  };

  if (weatherLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6B4EFF" />
        <Text style={styles.loadingText}>Détection de votre position...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" />

      <Text style={styles.headline}>Votre parfum du jour</Text>

      {weather && <WeatherCard weather={weather} />}

      <Text style={styles.sectionTitle}>
        {recommendations.length > 0
          ? `${recommendations.length} parfums recommandés 🌸`
          : "Aucun parfum trouvé pour cette météo"}
      </Text>

      {perfumesLoading ? (
        <ActivityIndicator color="#6B4EFF" />
      ) : (
        recommendations.map((perfume) => (
          <PerfumeCard
            key={perfume.id}
            perfume={perfume}
            onPress={handlePerfumePress}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  container: { flex: 1, backgroundColor: "#f8f8fc", padding: 20, paddingTop: 60 },
  headline: { fontSize: 28, fontWeight: "bold", color: "#1a1a2e", marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#1a1a2e", marginBottom: 16 },
  loadingText: { marginTop: 12, color: "#666" },
  errorText: { color: "red", textAlign: "center", marginBottom: 16 },
  retryButton: { backgroundColor: "#6B4EFF", padding: 12, borderRadius: 12 },
  retryText: { color: "#fff", fontWeight: "600" },
});