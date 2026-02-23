import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { useWeather } from '../src/hooks/useWeather';
import { usePerfumes } from '../src/hooks/usePerfumes';

export default function HomeScreen() {
    const { weather, loading : weatherLoading, error } = useWeather();
    const { recommendations, loading: perfumesLoading } = usePerfumes(weather);

    if (weatherLoading || perfumesLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#6B4EFF" />
                <Text>Chargement des données météo...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>{error}</Text>
            </View>
        );
    }

    return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Météo */}
      <Text style={styles.city}>{weather?.city}</Text>
      <Text style={styles.temp}>{weather?.temperature}°C</Text>
      <Text style={styles.description}>{weather?.description}</Text>

      {/* Recommandations */}
      <Text style={styles.sectionTitle}>Parfums recommandés 🌸</Text>
      {recommendations.map((perfume) => (
        <View key={perfume.id} style={styles.card}>
          <Text style={styles.perfumeName}>{perfume.name}</Text>
          <Text style={styles.perfumeBrand}>{perfume.brand}</Text>
          <Text>{perfume.description}</Text>
          <Text style={styles.notes}>
            Notes : {perfume.notes.join(", ")}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { padding: 20, paddingTop: 60 },
  city: { fontSize: 28, fontWeight: "bold" },
  temp: { fontSize: 64, fontWeight: "bold", color: "#6B4EFF" },
  description: { fontSize: 16, color: "#666", marginBottom: 30, textTransform: "capitalize" },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  perfumeName: { fontSize: 18, fontWeight: "bold" },
  perfumeBrand: { color: "#6B4EFF", marginBottom: 8 },
  notes: { marginTop: 8, fontStyle: "italic", color: "#888" },
  error: { color: "red" },
});

  
