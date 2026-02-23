import { View, Text, Image, StyleSheet } from "react-native";
import { WeatherData } from "../types";

interface   Props {
    weather: WeatherData;
}

const getWheatherBackground = (condition: string) => {
    switch (condition.toLowerCase()) {
        case "snow":
            return "#a8c0ff"; // Bleu clair
        case "rain":
        case "drizzle":
            return "#4a6fa5"; // Bleu moyen
        case "thunderstorm":
            return "#373b44"; // Gris foncé
        case "clouds":
            return "#7f8c8d"; // Gris
        case "clear":
            return "#f7b733"; // Orange
        default:
            return "#6b4eff"; // Violet par défaut
    }
};

export const WeatherCard: React.FC<Props> = ({ weather }) => {
    const bgColor = getWheatherBackground(weather.condition);

    return (
        <View style={[styles.card, { backgroundColor: bgColor }]}>
            <View style={styles.row}>
                <View>
                    <Text style={styles.city}>{weather.city}</Text>
                    <Text style={styles.description}>{weather.description}°C</Text>
                </View>
                <Image source={{ uri:weather.icon}} style={styles.icon} />
            </View>

            <Text style={styles.temp}>{weather.temperature}°C</Text>

            <View style={styles.row}>
                <Text style={styles.detail}>Ressenti : {weather.feelsLike}°C</Text>
                <Text style={styles.detail}>Humidité : {weather.humidity}%</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  city: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
  },
  description: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textTransform: "capitalize",
    marginTop: 4,
  },
  icon: {
    width: 70,
    height: 70,
  },
  temp: {
    fontSize: 72,
    fontWeight: "bold",
    color: "#fff",
    marginVertical: 8,
  },
  detail: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
});