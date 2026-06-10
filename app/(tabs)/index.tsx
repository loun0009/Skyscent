import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated, Image } from "react-native";
import { useRouter } from "expo-router";
import { useWeather } from "../../src/hooks/useWeather";
import { usePerfumes } from "../../src/hooks/usePerfumes";
import { useFilters } from "../../src/hooks/useFilters";
import { WeatherCard } from "../../src/components/weatherCard";
import { PerfumeCard } from "../../src/components/perfumeCard";
import { LoadingScreen } from "../../src/components/loadingScreen";
import { ErrorMessage } from "../../src/components/errorBoundary";
import { Perfume } from "../../src/types";
import { useFavorites } from "../../src/context/FavoritesContext";
import { useEffect, useMemo, useRef } from "react";
import { useAppTheme } from "../../src/theme";
import { useAuth } from "../../src/context/AuthContext";
import { useCollection } from "../../src/context/CollectionContext";

const QuickActionCard = ({
  label,
  icon,
  onPress,
  styles,
}: {
  label: string;
  icon: string;
  onPress: () => void;
  styles: ReturnType<typeof makeStyles>;
}) => (
  <TouchableOpacity style={styles.quickActionCard} onPress={onPress} activeOpacity={0.85}>
    <Text style={styles.quickActionIcon}>{icon}</Text>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
);

const FeaturedPerfumeCard = ({
  perfume,
  onPress,
  isFavorite,
  onToggleFavorite,
  styles,
}: {
  perfume: Perfume;
  onPress: (perfume: Perfume) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
  styles: ReturnType<typeof makeStyles>;
}) => (
  <TouchableOpacity
    style={styles.featuredCard}
    onPress={() => onPress(perfume)}
    activeOpacity={0.85}
  >
    <View style={styles.featuredImageWrapper}>
      <Image
        source={{ uri: perfume.image_url || undefined }}
        style={styles.featuredImage}
        resizeMode="cover"
      />
    </View>
    <View style={styles.featuredContent}>
      <View style={styles.featuredHeader}>
        <View>
          <Text style={styles.featuredBadge}>Suggestion</Text>
          <Text style={styles.featuredName} numberOfLines={1}>{perfume.name}</Text>
          <Text style={styles.featuredBrand} numberOfLines={1}>{perfume.brand}</Text>
        </View>
        <TouchableOpacity
          style={styles.featuredHeart}
          onPress={() => onToggleFavorite(perfume.id)}
        >
          <Text style={styles.featuredHeartText}>{isFavorite ? "❤️" : "🤍"}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.featuredDescription} numberOfLines={2}>
        {perfume.description}
      </Text>
    </View>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const router = useRouter();
  const { weather, loading: weatherLoading, error, refresh } = useWeather();
  const { recommendations, perfumes, loading: perfumesLoading } = usePerfumes(weather);
  const { filters, setGender, setIntensity, setBrand, resetFilters, applyFilters, activeCount } = useFilters();
  const { isFavorite, toggle } = useFavorites();
  const { user } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const { collection, isInCollection } = useCollection();

  const colors = useAppTheme();
  const styles = makeStyles(colors);

  const hasCollection = collection.length > 0;

  const filteredRecommendations = applyFilters(recommendations);

  // ── Trier : parfums de la collection en premier ─────────────
  const sortedRecommendations = useMemo(() => {
    const inCollection = filteredRecommendations.filter((p) => isInCollection(p.id));
    const notInCollection = filteredRecommendations.filter((p) => !isInCollection(p.id));
    return [...inCollection, ...notInCollection];
  }, [filteredRecommendations, collection]);

  const featuredRecommendation = sortedRecommendations[0];
  const otherRecommendations = sortedRecommendations.slice(1);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePerfumePress = (perfume: Perfume) => {
    router.push({ pathname: "/perfume/[id]", params: { id: perfume.id } });
  };

  if (weatherLoading) return <LoadingScreen message="Détection de votre position..." />;
  if (error) return <ErrorMessage message={error} onRetry={refresh} />;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header animé */}
        <Animated.View
          style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <View>
            <Text style={styles.greeting}>
              Bonjour{user?.first_name ? `, ${user.first_name}` : ""} 👋
            </Text>
            <Text style={styles.headline}>Parfums du jour</Text>
            <Text style={styles.subtitle}>Découvre une sélection personnalisée et adaptée à la météo.</Text>
          </View>
          <TouchableOpacity style={styles.refreshButton} onPress={refresh}>
            <Text style={styles.refreshText}>↻</Text>
          </TouchableOpacity>
        </Animated.View>

        {weather && <WeatherCard weather={weather} />}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActionsRow}
          style={styles.quickActionsContainer}
        >
          <QuickActionCard
            label="Mon catalogue"
            icon="📦"
            onPress={() => router.push("/catalog")}
            styles={styles}
          />
          <QuickActionCard
            label="Mes favoris"
            icon="❤️"
            onPress={() => router.push("/favorites")}
            styles={styles}
          />
        </ScrollView>


        {/* Collection utilisateur */}
        {hasCollection && (
          <View style={styles.collectionSection}>
            <Text style={styles.collectionTitle}>Ma Collection 💎</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.collectionScroll}
            >
              {collection.map((perfume) => (
                <TouchableOpacity
                  key={perfume.id}
                  style={styles.collectionItem}
                  onPress={() =>
                    router.push({ pathname: "/perfume/[id]", params: { id: perfume.id } })
                  }
                  activeOpacity={0.8}
                >
                  <View style={styles.collectionItemImage}>
                    <Image
                      source={{ uri: perfume.image_url || undefined }}
                      style={{ width: 70, height: 70 }}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={styles.collectionItemName} numberOfLines={1}>
                    {perfume.name}
                  </Text>
                  <Text style={styles.collectionItemBrand} numberOfLines={1}>
                    {perfume.brand}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {featuredRecommendation && (
          <View style={styles.featuredSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>À découvrir aujourd’hui</Text>
              {isInCollection(featuredRecommendation.id) && (
                <Text style={styles.collectionHint}>💎 déjà dans ta collection</Text>
              )}
            </View>
            <FeaturedPerfumeCard
              perfume={featuredRecommendation}
              onPress={handlePerfumePress}
              isFavorite={isFavorite(featuredRecommendation.id)}
              onToggleFavorite={toggle}
              styles={styles}
            />
          </View>
        )}

        <View style={styles.sectionHeader}> 
          <Text style={styles.sectionTitle}>
            {otherRecommendations.length > 0
              ? `${otherRecommendations.length} autre${otherRecommendations.length > 1 ? "s" : ""} recommandation${otherRecommendations.length > 1 ? "s" : ""}`
              : "Aucune autre recommandation"}
          </Text>
          {sortedRecommendations.some((p) => isInCollection(p.id)) && (
            <Text style={styles.collectionHint}>💎 = dans ta collection</Text>
          )}
        </View>

        {perfumesLoading ? (
          <LoadingScreen message="Analyse des parfums..." />
        ) : (
          otherRecommendations.map((perfume, index) => (
            <PerfumeCard
              key={perfume.id}
              perfume={perfume}
              onPress={handlePerfumePress}
              isFavorite={isFavorite(perfume.id)}
              onToggleFavorite={toggle}
              index={index}
              isInCollection={isInCollection(perfume.id)}
            />
          ))
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Mis à jour à{" "}
            {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
    },
    content: {
      padding: 20,
      paddingTop: 60,
      paddingBottom: 40,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 24,
    },
    greeting: {
      fontSize: 14,
      color: colors.gold,
      marginBottom: 4,
    },
    headline: {
      fontSize: 26,
      fontWeight: "bold",
      color: colors.text,
    },
    refreshButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.gold20,
      justifyContent: "center",
      alignItems: "center",
    },
    refreshText: {
      fontSize: 20,
      color: colors.gold,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 6,
      lineHeight: 20,
      maxWidth: "80%",
    },
    quickActionsContainer: {
      marginBottom: 16,
    },
    quickActionsRow: {
      gap: 12,
      paddingHorizontal: 2,
    },
    quickActionCard: {
      width: 128,
      minHeight: 92,
      backgroundColor: colors.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.gold20,
      padding: 14,
      justifyContent: "space-between",
      shadowColor: colors.text,
      shadowOpacity: 0.05,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
    },
    quickActionIcon: {
      fontSize: 24,
      marginBottom: 10,
    },
    quickActionLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.text,
    },
    collectionHint: {
      fontSize: 11,
      color: colors.gold,
      fontWeight: "500",
    },
    featuredSection: {
      marginBottom: 24,
    },
    featuredCard: {
      borderRadius: 24,
      overflow: "hidden",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.gold20,
      shadowColor: colors.text,
      shadowOpacity: 0.06,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
    },
    featuredImageWrapper: {
      width: "100%",
      height: 200,
      backgroundColor: colors.surfaceLight,
    },
    featuredImage: {
      width: "100%",
      height: "100%",
    },
    featuredContent: {
      padding: 18,
    },
    featuredHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    featuredBadge: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.gold,
      marginBottom: 6,
    },
    featuredName: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
    },
    featuredBrand: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 4,
    },
    featuredHeart: {
      width: 38,
      height: 38,
      borderRadius: 18,
      backgroundColor: colors.surfaceLight,
      justifyContent: "center",
      alignItems: "center",
    },
    featuredHeartText: {
      fontSize: 16,
    },
    featuredDescription: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    footer: {
      alignItems: "center",
      marginTop: 24,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.gold10,
    },
    footerText: {
      fontSize: 12,
      color: colors.textMuted,
    },
    collectionSection: {
      marginBottom: 24,
    },
    collectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 12,
    },
    collectionScroll: {
      gap: 12,
      paddingRight: 4,
    },
    collectionItem: {
      width: 90,
      alignItems: "center",
      gap: 4,
    },
    collectionItemImage: {
      width: 90,
      height: 90,
      backgroundColor: colors.white,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.gold20,
      overflow: "hidden",
    },
    collectionItemName: {
      fontSize: 11,
      fontWeight: "bold",
      color: colors.text,
      textAlign: "center",
      width: 90,
    },
    collectionItemBrand: {
      fontSize: 10,
      color: colors.gold,
      textAlign: "center",
      width: 90,
    },
  });