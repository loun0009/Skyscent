import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated, Image } from "react-native";
import { useRouter } from "expo-router";
import { useWeather } from "../../src/hooks/useWeather";
import { usePerfumes } from "../../src/hooks/usePerfumes";
import { useFilters } from "../../src/hooks/useFilters";
import { WeatherCard } from "../../src/components/weatherCard";
import { PerfumeCard } from "../../src/components/perfumeCard";
import { FilterBar } from "../../src/components/filterBar";
import { LoadingScreen } from "../../src/components/loadingScreen";
import { ErrorMessage } from "../../src/components/errorBoundary";
import { Perfume } from "../../src/types";
import { useFavorites } from "../../src/context/FavoritesContext";
import { useEffect, useMemo, useRef } from "react";
import { useAppTheme } from "../../src/theme";
import { useAuth } from "../../src/context/AuthContext";
import { useCollection } from "../../src/context/CollectionContext";

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
            <Text style={styles.headline}>Les parfums du jour</Text>
          </View>
          <TouchableOpacity style={styles.refreshButton} onPress={refresh}>
            <Text style={styles.refreshText}>↻</Text>
          </TouchableOpacity>
        </Animated.View>

        {weather && <WeatherCard weather={weather} />}

        {/* Barre de filtres */}
        <FilterBar
          filters={filters}
          perfumes={perfumes}
          activeCount={activeCount}
          onGenderChange={setGender}
          onIntensityChange={setIntensity}
          onBrandChange={setBrand}
          onReset={resetFilters}
        />

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

        {/* Titre section recommandations */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {sortedRecommendations.length > 0
              ? `${sortedRecommendations.length} parfum${sortedRecommendations.length > 1 ? "s" : ""} recommandé${sortedRecommendations.length > 1 ? "s" : ""} ✨`
              : "Aucun parfum pour ces filtres 😔"}
          </Text>
          {/* Indicateur si des parfums de la collection sont dans les résultats */}
          {sortedRecommendations.some((p) => isInCollection(p.id)) && (
            <Text style={styles.collectionHint}>💎 = dans ta collection</Text>
          )}
        </View>

        {perfumesLoading ? (
          <LoadingScreen message="Analyse des parfums..." />
        ) : (
          sortedRecommendations.map((perfume, index) => (
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
    collectionHint: {
      fontSize: 11,
      color: colors.gold,
      fontWeight: "500",
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