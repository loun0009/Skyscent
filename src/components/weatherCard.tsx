import { View, Text, Image, StyleSheet, Animated } from "react-native";
import { WeatherData } from "../types";
import { useEffect, useRef } from "react";
import { theme } from "../theme";

interface   Props {
    weather: WeatherData;
}

const getWeatherBackground = (condition: string) => {
    switch (condition.toLowerCase()) {
        case "snow": 
            return "#1A2A4A"; // Bleu sombre pour la neige
        case "rain":
        case "drizzle": 
            return "#1A2030"; // Gris sombre pour la pluie
        case "thunderstorm": 
            return "#0A0A15"; // Noir profond pour l'orage
        case "clouds": 
            return "#1A1A25"; // Gris foncé pour les nuages
        case "clear": 
            return "#2A1A0A"; // Orange sombre pour le ciel dégagé
        default: 
            return "#1A1225"; // Couleur par défaut pour les conditions inconnues
    }
};

const getWeatherEmoji = (condition: string): string => {
  switch (condition.toLowerCase()) {
    case "snow": 
        return "❄️";
    case "rain":
    case "drizzle": 
        return "🌧️";
    case "thunderstorm": 
        return "⛈️";
    case "clouds": 
        return "☁️";
    case "clear": 
        return "☀️";
    case "mist":
    case "fog": 
        return "🌫️";
    default: 
        return "🌤️";
  }
};

export const WeatherCard = ({ weather }: Props) => {
  const bgColor = getWeatherBackground(weather.condition);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Fade in + slide up à l'apparition
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulsation sur l'emoji météo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: bgColor },
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.topRow}>
        <View>
          <Text style={styles.city}>{weather.city}</Text>
          <Text style={styles.description}>{weather.description}</Text>
        </View>
        <Animated.Text
          style={[styles.weatherEmoji, { transform: [{ scale: pulseAnim }] }]}
        >
          {getWeatherEmoji(weather.condition)}
        </Animated.Text>
      </View>

      <Text style={styles.temp}>{weather.temperature}°</Text>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Ressenti</Text>
          <Text style={styles.detailValue}>{weather.feelsLike}°C</Text>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Humidité</Text>
          <Text style={styles.detailValue}>{weather.humidity}%</Text>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Condition</Text>
          <Text style={styles.detailValue}>{weather.condition}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: "#c9a84c33",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  city: {
    fontSize: 26,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
  },
  description: {
    fontSize: 14,
    color: theme.colors.gold,
    textTransform: "capitalize",
    marginTop: 4,
  },
  weatherEmoji: { fontSize: 48 },
  temp: {
    fontSize: 80,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    marginVertical: theme.spacing.sm,
    letterSpacing: -2,
  },
  divider: {
    height: 1,
    backgroundColor: "#c9a84c4d",
    marginVertical: theme.spacing.md,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailItem: { flex: 1, alignItems: "center" },
  detailLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary,
  },
  detailDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#c9a84c33",
  },
});