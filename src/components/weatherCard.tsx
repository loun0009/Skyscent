import { View, Text, StyleSheet, Animated } from "react-native";
import { WeatherData } from "../types";
import { useEffect, useRef } from "react";
import { AppTheme, useAppTheme } from "../theme";

interface   Props {
    weather: WeatherData;
}

const getWeatherBackground = (condition: string, colors: AppTheme) => {
    switch (condition.toLowerCase()) {
        case "snow": 
      return colors.weatherSnow;
        case "rain":
        case "drizzle": 
      return colors.weatherRain;
        case "thunderstorm": 
      return colors.weatherStorm;
        case "clouds": 
      return colors.weatherClouds;
        case "clear": 
      return colors.weatherClear;
        default: 
      return colors.weatherDefault;
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
  const colors = useAppTheme();
  const styles = makeStyles(colors);
  const bgColor = getWeatherBackground(weather.condition, colors);
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
      {/* En-tête météo */}
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

      {/* Détails météo */}
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

const makeStyles = (colors: AppTheme) => StyleSheet.create({
  // Carte
  card: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.gold20,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  city: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.text,
  },
  description: {
    fontSize: 14,
    color: colors.gold5,
    textTransform: "capitalize",
    marginTop: 4,
  },
  weatherEmoji: { fontSize: 48 },

  // Température
  temp: {
    fontSize: 80,
    fontWeight: "bold",
    color: colors.text,
    marginVertical: 8,
    letterSpacing: -2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gold30,
    marginVertical: 12,
  },

  // Détails
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailItem: { flex: 1, alignItems: "center" },
  detailLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  detailDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.gold20,
  },
});