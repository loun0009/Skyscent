import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, Modal, ScrollView, ActivityIndicator } from "react-native";
import { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import { usePerfumes } from "../../src/hooks/usePerfumes";
import { useFavorites } from "../../src/context/FavoritesContext";
import { Perfume } from "../../src/types";
import { theme } from "../../src/theme";

type SortOption = "name" | "brand" | "intensity";
type GenderFilter = "tous" | "masculin" | "féminin" | "mixte";
type IntensityFilter = "tous" | "légère" | "modérée" | "intense";
type SeasonFilter = "tous" | "spring" | "summer" | "autumn" | "winter";

const INTENSITY_ORDER = { "légère": 1, "modérée": 2, "intense": 3 };

const SEASON_OPTIONS: { value: SeasonFilter; label: string; emoji: string }[] = [
  { value: "tous", label: "Toutes", emoji: "🗓️" },
  { value: "spring", label: "Printemps", emoji: "🌱" },
  { value: "summer", label: "Été", emoji: "☀️" },
  { value: "autumn", label: "Automne", emoji: "🍂" },
  { value: "winter", label: "Hiver", emoji: "❄️" },
];

const GENDER_OPTIONS: { value: GenderFilter; label: string }[] = [
  { value: "tous", label: "Tous" },
  { value: "masculin", label: "Masculin" },
  { value: "féminin", label: "Féminin" },
  { value: "mixte", label: "Mixte" },
];

const INTENSITY_OPTIONS: { value: IntensityFilter; label: string; emoji: string }[] = [
  { value: "tous", label: "Toutes", emoji: "✨" },
  { value: "légère", label: "Légère", emoji: "🌸" },
  { value: "modérée", label: "Modérée", emoji: "🌺" },
  { value: "intense", label: "Intense", emoji: "🔥" },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "name", label: "Nom A→Z" },
  { value: "brand", label: "Marque A→Z" },
  { value: "intensity", label: "Intensité" },
];

const INTENSITY_DOT: Record<string, string> = {
  "légère": theme.colors.intensityLightDot,
  "modérée": theme.colors.intensityMediumDot,
  "intense": theme.colors.intensityStrongDot,
};

const PerfumeGridCard = ({
  perfume,
  onPress,
  isFavorite,
  onToggleFavorite,
}: {
  perfume: Perfume;
  onPress: (p: Perfume) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
}) => (
  // Carte unitaire de la grille catalogue
  <TouchableOpacity
    style={styles.gridCard}
    onPress={() => onPress(perfume)}
    activeOpacity={0.8}
  >
    <View style={styles.gridImageContainer}>
      <Image
        source={{ uri: perfume.image_url }}
        style={styles.gridImage}
        resizeMode="contain"
      />
      <TouchableOpacity
        style={styles.gridHeart}
        onPress={() => onToggleFavorite(perfume.id)}
      >
        <Text style={styles.gridHeartText}>{isFavorite ? "❤️" : "🤍"}</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.gridContent}>
      <Text style={styles.gridName} numberOfLines={1}>{perfume.name}</Text>
      <Text style={styles.gridBrand} numberOfLines={1}>{perfume.brand}</Text>
      <View style={styles.gridFooter}>
        <View style={styles.gridDot}>
          <View style={[styles.dot, { backgroundColor: INTENSITY_DOT[perfume.intensity] }]} />
          <Text style={styles.gridIntensity}>{perfume.intensity}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

export default function CatalogScreen() {
  const router = useRouter();
  const { perfumes, loading } = usePerfumes(null);
  const { isFavorite, toggle } = useFavorites();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [gender, setGender] = useState<GenderFilter>("tous");
  const [intensity, setIntensity] = useState<IntensityFilter>("tous");
  const [season, setSeason] = useState<SeasonFilter>("tous");
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = [
    gender !== "tous",
    intensity !== "tous",
    season !== "tous",
  ].filter(Boolean).length;

  const filtered = useMemo(() => {
    let result = [...perfumes];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
    }

    if (gender !== "tous") result = result.filter((p) => p.gender === gender);
    if (intensity !== "tous") result = result.filter((p) => p.intensity === intensity);
    if (season !== "tous") result = result.filter((p) => p.season.includes(season));

    // Tri
    result.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "brand") return a.brand.localeCompare(b.brand);
      if (sortBy === "intensity")
        return (INTENSITY_ORDER[a.intensity] ?? 0) - (INTENSITY_ORDER[b.intensity] ?? 0);
      return 0;
    });

    return result;
  }, [perfumes, search, gender, intensity, season, sortBy]);

  const handlePress = (perfume: Perfume) => {
    router.push({ pathname: "/perfume/[id]", params: { id: perfume.id } });
  };

  const resetFilters = () => {
    setGender("tous");
    setIntensity("tous");
    setSeason("tous");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.gold} />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headline}>Catalogue 🌸</Text>
        <Text style={styles.counter}>
          {filtered.length} parfum{filtered.length > 1 ? "s" : ""}
        </Text>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un parfum ou une marque..."
          placeholderTextColor={theme.colors.textMuted}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Text style={styles.searchClear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tri + ouverture des filtres */}
      <View style={styles.controlsRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortRow}
        >
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.sortPill, sortBy === option.value && styles.sortPillActive]}
              onPress={() => setSortBy(option.value)}
            >
              <Text style={[styles.sortText, sortBy === option.value && styles.sortTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterButtonText}>
            🎛 {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Grille */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <PerfumeGridCard
            perfume={item}
            onPress={handlePress}
            isFavorite={isFavorite(item.id)}
            onToggleFavorite={toggle}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>Aucun parfum trouvé</Text>
          </View>
        }
      />

      {/* Modal filtres */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtres</Text>
              {activeFilterCount > 0 && (
                <TouchableOpacity onPress={resetFilters}>
                  <Text style={styles.resetText}>Réinitialiser</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Genre */}
            <Text style={styles.filterLabel}>Genre</Text>
            <View style={styles.pillsRow}>
              {GENDER_OPTIONS.map((o) => (
                <TouchableOpacity
                  key={o.value}
                  style={[styles.pill, gender === o.value && styles.pillActive]}
                  onPress={() => setGender(o.value)}
                >
                  <Text style={[styles.pillText, gender === o.value && styles.pillTextActive]}>
                    {o.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Intensité */}
            <Text style={styles.filterLabel}>Intensité</Text>
            <View style={styles.pillsRow}>
              {INTENSITY_OPTIONS.map((o) => (
                <TouchableOpacity
                  key={o.value}
                  style={[styles.pill, intensity === o.value && styles.pillActive]}
                  onPress={() => setIntensity(o.value)}
                >
                  <Text style={[styles.pillText, intensity === o.value && styles.pillTextActive]}>
                    {o.emoji} {o.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Saison */}
            <Text style={styles.filterLabel}>Saison</Text>
            <View style={styles.pillsRow}>
              {SEASON_OPTIONS.map((o) => (
                <TouchableOpacity
                  key={o.value}
                  style={[styles.pill, season === o.value && styles.pillActive]}
                  onPress={() => setSeason(o.value)}
                >
                  <Text style={[styles.pillText, season === o.value && styles.pillTextActive]}>
                    {o.emoji} {o.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyText}>
                Afficher {filtered.length} parfum{filtered.length > 1 ? "s" : ""}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Layout
  wrapper: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: theme.colors.background 
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },
  headline: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: theme.colors.textPrimary 
  },
  counter: { 
    fontSize: 13, 
    color: theme.colors.gold, 
    fontWeight: "600" 
  },

  // Recherche
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    marginHorizontal: 20,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.gold,
    gap: 10,
  },
  searchIcon: { 
    fontSize: 16 
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  searchClear: { 
    fontSize: 14, 
    color: theme.colors.textMuted 
  },

  // Contrôles
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 20,
    marginBottom: 12,
    gap: 8,
  },
  sortRow: { 
    paddingLeft: 20, 
    gap: 8 
  },
  sortPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.gold,
  },
  sortPillActive: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.gold,
  },
  sortText: { 
    fontSize: 12, 
    color: theme.colors.textSecondary, 
    fontWeight: "600" 
  },
  sortTextActive: { 
    color: theme.colors.gold 
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.gold,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.gold,
    borderColor: theme.colors.gold,
  },
  filterButtonText: { 
    fontSize: 14, 
    color: theme.colors.gold 
  },

  // Grille
  listContent: { 
    paddingHorizontal: 12, 
    paddingBottom: 40 
  },
  row: { 
    justifyContent: "space-between", 
    paddingHorizontal: 8 
  },
  gridCard: {
    width: "48%",
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    marginBottom: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.gold,
  },
  gridImageContainer: {
    width: "100%",
    height: 150,
    backgroundColor: theme.colors.white,
    position: "relative",
  },
  gridImage: { 
    width: "100%", 
    height: 150 
  },
  gridHeart: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  gridHeartText: { 
    fontSize: 14 
  },
  gridContent: { 
    padding: 10 
  },
  gridName: {
    fontSize: 13,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  gridBrand: { 
    fontSize: 11, 
    color: theme.colors.gold, 
    marginBottom: 6 
  },
  gridFooter: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  gridDot: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 4 
  },
  dot: { 
    width: 6, 
    height: 6, 
    borderRadius: 3 
  },
  gridIntensity: { 
    fontSize: 10, 
    color: theme.colors.textSecondary 
  },

  // État vide
  empty: { 
    alignItems: "center", 
    marginTop: 60 
  },
  emptyEmoji: { 
    fontSize: 48, 
    marginBottom: 12 
  },
  emptyText: { 
    fontSize: 15, 
    color: theme.colors.textSecondary 
  },

  // Modal filtres
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
  },
  resetText: { 
    fontSize: 13, 
    color: theme.colors.error, 
    fontWeight: "600" 
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.colors.gold,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 16,
  },
  pillsRow: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: 8 
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.gold,
  },
  pillActive: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.gold,
  },
  pillText: { 
    fontSize: 13, 
    color: theme.colors.textSecondary, 
    fontWeight: "500" 
  },
  pillTextActive: { 
    color: theme.colors.gold, 
    fontWeight: "600" 
  },
  applyButton: {
    backgroundColor: theme.colors.gold,
    padding: 16,
    borderRadius: theme.radius.md,
    alignItems: "center",
    marginTop: 24,
  },
  applyText: { 
    color: theme.colors.background, 
    fontWeight: "bold", 
    fontSize: 15 
  },
});