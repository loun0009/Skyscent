import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useHistory } from "../src/context/HistoryContext";
import { theme } from "../src/theme";

const getConditionEmoji = (condition: string | null): string => {
  if (!condition) return "🌤️";
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

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) {
    return "Aujourd'hui";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Hier";
  } else {
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }
};

const formatTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function HistoryScreen() {
    const router = useRouter();
    const { history, loading, removeEntry, clearAll } = useHistory();
    const handleClearAll = () => {
        Alert.alert(
            "Effacer l'historique",
            "Es-tu sûr de vouloir effacer tout ton historique de parfums portés ? Cette action est irréversible.",
            [
                { text: "Annuler", style: "cancel" },
                { text: "Effacer", style: "destructive", onPress: clearAll },
            ]
        );
    };

    const grouped = history.reduce((acc, entry) => {
        const date = formatDate(entry.worn_at);
        if (!acc[date]) acc[date] = [];
        acc[date].push(entry);
        return acc;
    }, {} as Record<string, typeof history>);

    return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headline}>Historique 📖</Text>
          {history.length > 0 && (
            <TouchableOpacity onPress={handleClearAll}>
              <Text style={styles.clearButton}>Tout effacer</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <ActivityIndicator color={theme.colors.gold} style={{ marginTop: 40 }} />
        ) : history.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>Aucun historique</Text>
            <Text style={styles.emptySubtitle}>
              Marque un parfum comme porté depuis sa page de détail.
            </Text>
          </View>
        ) : (
            // Parcours les groupes de dates et affiche les entrées correspondantes
          Object.entries(grouped).map(([date, entries]) => (
            <View key={date} style={styles.group}>
              <Text style={styles.groupTitle}>{date}</Text>
              {entries.map((entry) => (
                <View key={entry.id} style={styles.card}>
                  <View style={styles.cardLeft}>
                    <Text style={styles.weatherEmoji}>
                      {getConditionEmoji(entry.weather_condition)}
                    </Text>
                    <View style={styles.metaBlock}>
                      {entry.city && (
                        <Text style={styles.city}>{entry.city}</Text>
                      )}
                      {entry.temperature !== null && (
                        <Text style={styles.temp}>{entry.temperature}°C</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.cardCenter}>
                    <Text style={styles.perfumeName} numberOfLines={1}>
                      {entry.perfume?.name ?? "Parfum inconnu"}
                    </Text>
                    <Text style={styles.perfumeBrand} numberOfLines={1}>
                      {entry.perfume?.brand ?? ""}
                    </Text>
                    <Text style={styles.time}>{formatTime(entry.worn_at)}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => removeEntry(entry.id)}
                  >
                    <Text style={styles.deleteText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
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
  container: { 
    flex: 1 
},
  content: { 
    padding: 20, 
    paddingTop: 60, 
    paddingBottom: 40 
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headline: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
  },
  clearButton: {
    fontSize: 13,
    color: theme.colors.error,
    fontWeight: "600",
  },
  empty: { 
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
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  group: { 
    marginBottom: 24 
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.gold,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#c9a84c26",
    gap: 12,
  },
  cardLeft: {
    alignItems: "center",
    gap: 4,
  },
  weatherEmoji: { 
    fontSize: 28 
  },
  metaBlock: { 
    alignItems: "center" 
  },
  city: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  temp: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.colors.gold,
  },
  cardCenter: { 
    flex: 1 
  },
  perfumeName: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
  },
  perfumeBrand: {
    fontSize: 12,
    color: theme.colors.gold,
    marginTop: 2,
  },
  time: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ff6b6b1a",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteText: {
    fontSize: 12,
    color: theme.colors.error,
    fontWeight: "bold",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.2)",
  },
  backText: {
    fontSize: 18,
    color: theme.colors.gold,
  },
});