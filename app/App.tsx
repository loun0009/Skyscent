import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useWeather } from '../src/hooks/useWeather';

export default function HomeScreen() {
    const { weather, loading, error } = useWeather();

    if (loading) {
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
        <View style={styles.center}>
            <Text style={styles.city}>{weather?.city}</Text>
            <Text style={styles.temp}>{weather?.temperature}°C</Text>
            <Text>{weather?.description}</Text>
            <Text>Humidité: {weather?.humidity}%</Text>
        </View>
    );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  city: { fontSize: 28, fontWeight: "bold" },
  temp: { fontSize: 64, fontWeight: "bold", color: "#6B4EFF" },
  error: { color: "red" },
});