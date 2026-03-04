import { useEffect, useRef, useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchPerfumeById } from "../../src/services/perfumesApi";
import { Perfume } from "../../src/types";
import { theme } from "../../src/theme";
import { useHistory } from "../../src/context/HistoryContext";
import { useWeather } from "../../src/hooks/useWeather";
import { useFavorites } from "../../src/context/FavoritesContext";
import { getRecommendations } from "../../src/utils/recommendations";

const SEASON_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  spring: { emoji: "🌱", label: "Printemps", color: "rgba(76, 175, 80, 0.2)" },
  summer: { emoji: "☀️", label: "Été", color: "rgba(255, 193, 7, 0.2)" },
  autumn: { emoji: "🍂", label: "Automne", color: "rgba(255, 152, 0, 0.2)" },
  winter: { emoji: "❄️", label: "Hiver", color: "rgba(33, 150, 243, 0.2)" },
};

const INTENSITY_CONFIG: Record<string, { emoji: string; color: string; dot: string }> = {
  "légère":  { emoji: "🌸", color: "rgba(76, 175, 80, 0.15)",  dot: "#4CAF50" },
  "modérée": { emoji: "🌺", color: "rgba(255, 152, 0, 0.15)",  dot: "#FF9800" },
  "intense": { emoji: "🔥", color: "rgba(244, 67, 54, 0.15)",  dot: "#F44336" },
};

export default function PerfumeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [loading, setLoading] = useState(true);
  const { addEntry, checkWornToday } = useHistory();
  const { weather } = useWeather();
  const { isFavorite, toggle } = useFavorites();
  const alreadyWornToday = perfume ? checkWornToday(perfume.id) : false;
  const [justAdded, setJustAdded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const handleWorn = async () => {
    if (!perfume || alreadyWornToday) return;
    await addEntry(perfume.id, weather?.temperature ?? null, weather?.condition ?? null, weather?.city ?? null);
    setJustAdded(true);
  };

  useEffect(() => {
    const load = async () => {
      const data = await fetchPerfumeById(Number(id));
      setPerfume(data);
      setLoading(false);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]).start();
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.gold} />
      </View>
    );
  }

  if (!perfume) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Parfum introuvable.</Text>
      </View>
    );
  }

  const favorite = isFavorite(perfume.id);
  const intensity = INTENSITY_CONFIG[perfume.intensity];
  const isCompatible = weather
    ? weather.temperature >= perfume.temp_min && weather.temperature <= perfume.temp_max
    : false;
  const weatherScore = !weather ? null : isCompatible ? "Parfait aujourd'hui" : "Peu adapté aujourd'hui";
  const weatherScoreColor = isCompatible ? theme.colors.success : theme.colors.textMuted;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Image plein écran avec dégradé */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: perfume.image_url }}
          style={styles.image}
          resizeMode="contain"
        />
        <LinearGradient
          colors={["transparent", "rgba(10,10,15,0.7)", theme.colors.background]}
          style={styles.gradient}
        />

        {/* Bouton retour */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        {/* Bouton favori */}
        <TouchableOpacity
          style={[styles.favoriteButton, favorite && styles.favoriteButtonActive]}
          onPress={() => toggle(perfume.id)}
        >
          <Text style={styles.favoriteText}>{favorite ? "❤️" : "🤍"}</Text>
          <Text style={[styles.favoriteLabel, favorite && styles.favoriteLabelActive]}>
            {favorite ? "Favori" : "Ajouter"}
          </Text>
        </TouchableOpacity>

        {/* Nom sur l'image */}
        <View style={styles.imageOverlayContent}>
          <Text style={styles.brand}>{perfume.brand}</Text>
          <Text style={styles.name}>{perfume.name}</Text>
        </View>
      </View>

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        {/* Score météo du jour */}
        {weather && (
          <View style={[styles.weatherBadge, { borderColor: isCompatible ? theme.colors.success : theme.colors.textMuted }]}>
            <Text style={styles.weatherBadgeEmoji}>
              {isCompatible ? "✅" : "⚠️"}
            </Text>
            <View>
              <Text style={[styles.weatherBadgeTitle, { color: weatherScoreColor }]}>
                {weatherScore}
              </Text>
              <Text style={styles.weatherBadgeDesc}>
                {weather.city} · {weather.temperature}°C · {weather.description}
              </Text>
            </View>
          </View>
        )}

        {/* Description */}
        <Text style={styles.description}>{perfume.description}</Text>

        {/* Intensité */}
        <View style={[styles.intensityCard, { backgroundColor: intensity.color }]}>
          <Text style={styles.intensityEmoji}>{intensity.emoji}</Text>
          <View>
            <Text style={styles.intensityLabel}>Intensité</Text>
            <Text style={styles.intensityValue}>
              {perfume.intensity.charAt(0).toUpperCase() + perfume.intensity.slice(1)}
            </Text>
          </View>
          <View style={styles.intensityDivider} />
          <View>
            <Text style={styles.intensityLabel}>Genre</Text>
            <Text style={styles.intensityValue}>
              {perfume.gender.charAt(0).toUpperCase() + perfume.gender.slice(1)}
            </Text>
          </View>
          <View style={styles.intensityDivider} />
          <View>
            <Text style={styles.intensityLabel}>Température</Text>
            <Text style={styles.intensityValue}>{perfume.temp_min}° → {perfume.temp_max}°</Text>
          </View>
        </View>

        {/* Saisons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saisons idéales</Text>
          <View style={styles.seasonsRow}>
            {(["spring", "summer", "autumn", "winter"] as const).map((s) => {
              const config = SEASON_CONFIG[s];
              const active = perfume.season.includes(s);
              return (
                <View
                  key={s}
                  style={[
                    styles.seasonBadge,
                    active
                      ? { backgroundColor: config.color, borderColor: theme.colors.gold }
                      : { backgroundColor: "transparent", borderColor: theme.colors.textMuted, opacity: 0.3 }
                  ]}
                >
                  <Text style={styles.seasonBadgeEmoji}>{config.emoji}</Text>
                  <Text style={[styles.seasonBadgeLabel, { color: active ? theme.colors.textPrimary : theme.colors.textMuted }]}>
                    {config.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Notes olfactives */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes olfactives</Text>
          <View style={styles.tags}>
            {perfume.notes.map((note) => (
              <View key={note} style={styles.tag}>
                <Text style={styles.tagText}>{note}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bouton porté discret */}
        <TouchableOpacity
          style={[
            styles.wornButton,
            alreadyWornToday && styles.wornButtonDisabled,
            justAdded && styles.wornButtonActive,
          ]}
          onPress={handleWorn}
          disabled={alreadyWornToday}
        >
          <Text style={[
            styles.wornButtonText,
            alreadyWornToday && styles.wornButtonTextDisabled,
          ]}>
            {alreadyWornToday
              ? "📅 Déjà dans votre historique du jour"
              : justAdded
              ? "✅ Ajouté à l'historique"
              : "💧 Porté aujourd'hui"}
          </Text>
        </TouchableOpacity>

      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },

  // Image
  imageContainer: { 
    height: 380, 
    position: "relative", 
    backgroundColor: theme.colors.cardElevated 
  },
  image: { 
    width: "100%", 
    height: 380,
    resizeMode: "contain",
  },
  gradient: { 
    ...StyleSheet.absoluteFillObject, 
    top: "40%" 
  },
  backButton: { 
    position: "absolute", 
    top: 52, 
    left: 20,
    width: 38, 
    height: 38, 
    borderRadius: 19,
    backgroundColor: theme.colors.background,
    justifyContent: "center", 
    alignItems: "center",
    borderWidth: 1, 
    borderColor: "#c9a84c4d",
  },
  backText: { 
    fontSize: 18, 
    color: theme.colors.gold 
  },
  favoriteButton: {
    position: "absolute", 
    top: 52, 
    right: 20,
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 14, 
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1, 
    borderColor: theme.colors.gold,
  },
  favoriteButtonActive: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.gold,
  },
  favoriteText: { 
    fontSize: 16 
  },
  favoriteLabel: { 
    fontSize: 12, 
    color: theme.colors.textSecondary, 
    fontWeight: "600" 
  },
  favoriteLabelActive: { 
    color: theme.colors.gold 
  },
  imageOverlayContent: {
    position: "absolute", 
    bottom: 20, 
    left: 20, 
    right: 20,
  },
  brand: { 
    fontSize: 14, 
    color: theme.colors.gold, 
    fontWeight: "600", 
    marginBottom: 4 
  },
  name: { 
    fontSize: 30, 
    fontWeight: "bold", 
    color: theme.colors.textPrimary 
  },

  // Contenu
  content: { 
    padding: theme.spacing.lg, 
    paddingTop: theme.spacing.md 
  },

  // Score météo
  weatherBadge: {
    flexDirection: "row", 
    alignItems: "center", 
    gap: 12,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md, 
    padding: 14,
    marginBottom: 20, 
    borderWidth: 1,
  },
  weatherBadgeEmoji: { 
    fontSize: 24 
  },
  weatherBadgeTitle: { 
    fontSize: 14, 
    fontWeight: "bold" 
  },
  weatherBadgeDesc: { 
    fontSize: 12, 
    color: theme.colors.textSecondary, 
    marginTop: 2 
  },

  // Description
  description: { 
    fontSize: 15, 
    color: theme.colors.textSecondary, 
    lineHeight: 24, 
    marginBottom: 24 
  },

  // Intensité card
  intensityCard: {
    flexDirection: "row", 
    alignItems: "center",
    borderRadius: theme.radius.md, 
    padding: 12,
    marginBottom: 24,  
    justifyContent: "space-between",
  },
  intensityEmoji: { 
    fontSize: 24 
  },
  intensityLabel: { 
    fontSize: 10, 
    color: theme.colors.textSecondary, 
    textTransform: "uppercase", 
    letterSpacing: 0.5 
  },
  intensityValue: { 
    fontSize: 12, 
    fontWeight: "bold", 
    color: theme.colors.textPrimary, 
    marginTop: 2,
    flexShrink: 1, 
  },
  intensityDivider: { 
    width: 1, 
    height: 30, 
    backgroundColor: "#c9a84c33",
      marginHorizontal: 8, 
  },

  // Sections
  section: { 
    marginBottom: 24 
  },
  sectionTitle: { 
    fontSize: 12, 
    fontWeight: "bold", 
    color: theme.colors.gold,
    textTransform: "uppercase", 
    letterSpacing: 1, 
    marginBottom: 12 
  },

  // Saisons
  seasonsRow: { 
    flexDirection: "row", 
    gap: 8 
  },
  seasonBadge: {
    flex: 1, 
    alignItems: "center", 
    padding: 10,
    borderRadius: theme.radius.md, 
    borderWidth: 1, 
    gap: 4,
  },
  seasonBadgeEmoji: { 
    fontSize: 20 
  },
  seasonBadgeLabel: { 
    fontSize: 10, 
    fontWeight: "600" 
  },

  // Notes
  tags: {
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: 8 
  },
  tag: { 
    backgroundColor: "#c9a84c14",
    borderWidth: 1, 
    borderColor: "#c9a84c40",
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20 
  },
  tagText: {
    color: theme.colors.gold, 
    fontSize: 13, 
    fontWeight: "500" 
  },

  // Bouton porté
  wornButton: {
    alignSelf: "center",
    paddingHorizontal: 16, 
    paddingVertical: 8,
    borderRadius: 20, 
    marginBottom: 32,
    borderWidth: 1, 
    borderColor: "#c9a84c33",
  },
  wornButtonActive: {
    borderColor: theme.colors.success,
  },
  wornButtonDisabled: { 
    borderColor: theme.colors.textMuted 
  },
  wornButtonText: { 
    fontSize: 13, 
    color: theme.colors.textSecondary 
  },
  wornButtonTextDisabled: { 
    color: theme.colors.textMuted 
  },

  // Erreur
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    fontWeight: "600"
  },
  infoRow: {
    flexDirection: "row", 
    justifyContent: "space-between", 
    paddingVertical: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: "#c9a84c1a"
  },
  infoLabel: {
    color: theme.colors.textSecondary, 
    fontSize: 14 
  },
  infoValue: {
    color: theme.colors.textPrimary, 
    fontSize: 14, 
    fontWeight: "600" 
  },
});