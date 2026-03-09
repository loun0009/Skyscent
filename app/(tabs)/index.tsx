import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity, Animated, Image } from "react-native";
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
import { useEffect, useRef } from "react";
import { theme } from "../../src/theme";
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
  const { collection } = useCollection();

  const hasCollection = collection.length > 0;

  const filteredRecommendations = applyFilters(recommendations);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePerfumePress = (perfume: Perfume) => {
    router.push({ pathname: "/perfume/[id]", params: { id: perfume.id } });
  };

  if (weatherLoading) {
    return <LoadingScreen message="Détection de votre position..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refresh} />;
  }

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header animé */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
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

        {hasCollection && (
          // Collection utilisateur
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
                  onPress={() => router.push({ pathname: "/perfume/[id]", params: { id: perfume.id } })}
                  activeOpacity={0.8}
                >
                  <View style={styles.collectionItemImage}>
                    <Image
                        source={{ uri: perfume.image_url || ""}}
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

        <Text style={styles.sectionTitle}>
          {filteredRecommendations.length > 0
            ? `${filteredRecommendations.length} parfum${filteredRecommendations.length > 1 ? "s" : ""} recommandé${filteredRecommendations.length > 1 ? "s" : ""} ✨`
            : "Aucun parfum pour ces filtres 😔"}
        </Text>

        {perfumesLoading ? (
          <LoadingScreen message="Analyse des parfums..." />
        ) : (
          // Liste recommandée
          filteredRecommendations.map((perfume, index) => (
            <PerfumeCard
              key={perfume.id}
              perfume={perfume}
              onPress={handlePerfumePress}
              isFavorite={isFavorite(perfume.id)}
              onToggleFavorite={toggle}
              index={index}
            />
          ))
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Mis à jour à{" "}
            {new Date().toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  // Layout
  wrapper: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  container: { 
    flex: 1 
  },
  content: { 
    padding: theme.spacing.md, 
    paddingTop: 60, 
    paddingBottom: 40 
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.lg,
  },
  greeting: { 
    fontSize: 14, 
    color: theme.colors.gold, 
    marginBottom: 4 
  },
  headline: { 
    fontSize: 26, 
    fontWeight: "bold", 
    color: theme.colors.textPrimary 
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.gold20,
    justifyContent: "center",
    alignItems: "center",
  },
  refreshText: { 
    fontSize: 20, 
    color: theme.colors.gold 
  },

  // Recommandations & footer
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  footer: {
    alignItems: "center",
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gold10,
  },
  footerText: { 
    fontSize: 12, 
    color: theme.colors.textMuted 
  },

  // Collection
  collectionSection: {
    marginBottom: 24,
  },
  collectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
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
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.gold20,
    overflow: "hidden",
  },
  collectionItemName: {
    fontSize: 11,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    textAlign: "center",
    width: 90,
  },
  collectionItemBrand: {
    fontSize: 10,
    color: theme.colors.gold,
    textAlign: "center",
    width: 90,
  },
});