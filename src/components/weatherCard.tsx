import { View, Text, StyleSheet, Animated } from "react-native";
import { WeatherData } from "../types";
import { useEffect, useRef } from "react";
import { AppTheme, useAppTheme } from "../theme";
import { useTheme } from "../context/ThemeContext";

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

const getWeatherAppearance = (
  condition: string,
  colors: AppTheme,
  isDark: boolean,
) => {
  const backgroundColor = getWeatherBackground(condition, colors);

  if (isDark) {
    return {
      backgroundColor,
      titleColor: colors.text,
      accentColor: colors.goldLight,
      labelColor: colors.textSecondary,
      valueColor: colors.text,
      dividerColor: colors.gold30,
      borderColor: colors.gold20,
    };
  }

  const useLightText = ["rain", "drizzle", "thunderstorm", "clear"].includes(
    condition.toLowerCase(),
  );

  return {
    backgroundColor,
    titleColor: useLightText ? colors.white : colors.text,
    accentColor: useLightText ? colors.white : colors.goldDark,
    labelColor: useLightText ? "#FFFFFFCC" : colors.textSecondary,
    valueColor: useLightText ? colors.white : colors.text,
    dividerColor: useLightText ? "#FFFFFF33" : colors.gold30,
    borderColor: useLightText ? "#FFFFFF26" : colors.cardBorder,
  };
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
  const { isDark } = useTheme();
  const appearance = getWeatherAppearance(weather.condition, colors, isDark);
  const styles = makeStyles(colors, appearance);
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

const makeStyles = (colors: AppTheme, appearance: ReturnType<typeof getWeatherAppearance>) => StyleSheet.create({
  // Carte
  card: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    backgroundColor: appearance.backgroundColor,
    borderWidth: 1,
    borderColor: appearance.borderColor,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  city: {
    fontSize: 26,
    fontWeight: "bold",
    color: appearance.titleColor,
  },
  description: {
    fontSize: 14,
    color: appearance.accentColor,
    textTransform: "capitalize",
    marginTop: 4,
  },
  weatherEmoji: { fontSize: 48 },

  // Température
  temp: {
    fontSize: 80,
    fontWeight: "bold",
    color: appearance.valueColor,
    marginVertical: 8,
    letterSpacing: -2,
  },
  divider: {
    height: 1,
    backgroundColor: appearance.dividerColor,
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
    color: appearance.labelColor,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: appearance.valueColor,
  },
  detailDivider: {
    width: 1,
    height: 30,
    backgroundColor: appearance.dividerColor,
  },
});