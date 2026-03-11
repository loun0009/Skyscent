import { useEffect, useRef, useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchPerfumeById } from "../../src/services/perfumesApi";
import { Perfume } from "../../src/types";
import { AppTheme, useAppTheme } from "../../src/theme";
import { useHistory } from "../../src/context/HistoryContext";
import { useWeather } from "../../src/hooks/useWeather";
import { useFavorites } from "../../src/context/FavoritesContext";
import { useReviews } from "../../src/context/ReviewsContext";
import { StarRating } from "../../src/components/starRating";
import { useCollection } from "../../src/context/CollectionContext";

const getSeasonConfig = (colors: AppTheme): Record<string, { emoji: string; label: string; color: string }> => ({
  spring: { emoji: "🌱", label: "Printemps", color: colors.seasonSpring },
  summer: { emoji: "☀️", label: "Été", color: colors.seasonSummer },
  autumn: { emoji: "🍂", label: "Automne", color: colors.seasonAutumn },
  winter: { emoji: "❄️", label: "Hiver", color: colors.seasonWinter },
});

const getIntensityConfig = (colors: AppTheme): Record<string, { emoji: string; color: string; dot: string }> => ({
  "légère": { emoji: "🌸", color: colors.intensityLightBg, dot: colors.intensityLightDot },
  "modérée": { emoji: "🌺", color: colors.intensityMediumBg, dot: colors.intensityMediumDot },
  "intense": { emoji: "🔥", color: colors.intensityStrongBg, dot: colors.intensityStrongDot },
});

export default function PerfumeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colors = useAppTheme();
  const styles = makeStyles(colors);
  const SEASON_CONFIG = getSeasonConfig(colors);
  const INTENSITY_CONFIG = getIntensityConfig(colors);
  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [loading, setLoading] = useState(true);
  const { addEntry, checkWornToday } = useHistory();
  const { weather } = useWeather();
  const { isFavorite, toggle } = useFavorites();
  const alreadyWornToday = perfume ? checkWornToday(perfume.id) : false;
  const [justAdded, setJustAdded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const { reviews, userReview, rating, loading: reviewsLoading, loadReviews, submitReview, removeReview } = useReviews();
  const [reviewRating, setReviewRating] = useState(userReview?.rating ?? 0);
  const [reviewComment, setReviewComment] = useState(userReview?.comment ?? "");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { isInCollection, toggleCollection } = useCollection();


  const inCollection = perfume ? isInCollection(perfume.id) : false;

  const handleWorn = async () => {
    if (!perfume || alreadyWornToday) return;
    await addEntry(perfume.id, weather?.temperature ?? null, weather?.condition ?? null, weather?.city ?? null);
    setJustAdded(true);
  };

  useEffect(() => {
    if (perfume) 
      loadReviews(perfume.id);
    }, [perfume]);
  
  const handleSubmitReview = async () => {
    if (!perfume || reviewRating === 0) return;
    setSubmitting(true);
    await submitReview(perfume.id, reviewRating, reviewComment || null);
    setSubmitting(false);
    setShowReviewForm(false);
  };

  const handleDeleteReview = async () => {
    if (!perfume) return;
    await removeReview(perfume.id);
    setReviewRating(0);
    setReviewComment("");
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
        <ActivityIndicator size="large" color={colors.gold} />
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
  const weatherScoreColor = isCompatible ? colors.success : colors.textMuted;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Image plein écran avec dégradé */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: perfume.image_url || "" }}
          style={styles.image}
          resizeMode="contain"
        />
        <LinearGradient
          colors={["transparent", colors.overlayDark, colors.background]}
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

        {/* Bouton collection */}
        <TouchableOpacity
          style={[styles.collectionButton, inCollection && styles.collectionButtonActive]}
          onPress={() => toggleCollection(perfume.id)}
        >
          <Text style={styles.collectionButtonText}>
            {inCollection ? "💎 Dans ma collection" : "➕ Ajouter à ma collection"}
          </Text>
        </TouchableOpacity>

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        {/* Score météo du jour */}
        {weather && (
          <View style={[styles.weatherBadge, { borderColor: isCompatible ? colors.success : colors.textMuted }]}>
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
                      ? { backgroundColor: config.color, borderColor: colors.gold }
                      : { backgroundColor: "transparent", borderColor: colors.textMuted, opacity: 0.3 }
                  ]}
                >
                  <Text style={styles.seasonBadgeEmoji}>{config.emoji}</Text>
                  <Text style={[styles.seasonBadgeLabel, { color: active ? colors.text : colors.textMuted }]}>
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
        {/* Note moyenne */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Avis de la communauté</Text>

          {/* Résumé note */}
          <View style={styles.ratingRow}>
            <Text style={styles.ratingAverage}>
              {rating && rating.count > 0 ? rating.average.toFixed(1) : "—"}
            </Text>
            <View>
              <StarRating rating={rating?.average ?? 0} size={18} readonly />
              <Text style={styles.ratingCount}>
                {rating?.count ?? 0} avis
              </Text>
            </View>
          </View>

          {/* Mon avis */}
          {userReview && !showReviewForm ? (
            <View style={styles.myReviewCard}>
              <View style={styles.myReviewHeader}>
                <Text style={styles.myReviewTitle}>Mon avis</Text>
                <View style={styles.myReviewActions}>
                  <TouchableOpacity onPress={() => {
                    setReviewRating(userReview.rating);
                    setReviewComment(userReview.comment ?? "");
                    setShowReviewForm(true);
                  }}>
                    <Text style={styles.editReviewText}>✏️ Modifier</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDeleteReview}>
                    <Text style={styles.deleteReviewText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <StarRating rating={userReview.rating} size={16} readonly />
              {userReview.comment && (
                <Text style={styles.myReviewComment}>{userReview.comment}</Text>
              )}
            </View>
          ) : !userReview && !showReviewForm ? (
            <TouchableOpacity
              style={styles.addReviewButton}
              onPress={() => setShowReviewForm(true)}
            >
              <Text style={styles.addReviewText}>✍️ Laisser un avis</Text>
            </TouchableOpacity>
          ) : null}

          {/* Formulaire avis */}
          {showReviewForm && (
            <View style={styles.reviewForm}>
              <Text style={styles.reviewFormTitle}>
                {userReview ? "Modifier mon avis" : "Mon avis"}
              </Text>
              <StarRating
                rating={reviewRating}
                size={32}
                onRate={setReviewRating}
              />
              <TextInput
                style={styles.reviewInput}
                placeholder="Ajouter un commentaire... (optionnel)"
                  placeholderTextColor={colors.textMuted}
                value={reviewComment}
                onChangeText={setReviewComment}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <View style={styles.reviewFormActions}>
                <TouchableOpacity
                  style={styles.cancelReviewButton}
                  onPress={() => setShowReviewForm(false)}
                >
                  <Text style={styles.cancelReviewText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitReviewButton, reviewRating === 0 && styles.submitDisabled]}
                  onPress={handleSubmitReview}
                  disabled={reviewRating === 0 || submitting}
                >
                  <Text style={styles.submitReviewText}>
                    {submitting ? "Envoi..." : "Publier"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Liste des avis */}
          {reviews.filter(r => r.user_id !== userReview?.user_id).map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewCardHeader}>
                <View style={styles.reviewAvatar}>
                  <Text style={styles.reviewAvatarText}>
                    {review.profile?.first_name?.charAt(0).toUpperCase() ?? "?"}
                  </Text>
                </View>
                <View style={styles.reviewCardInfo}>
                  <Text style={styles.reviewAuthor}>
                    {review.profile?.first_name && review.profile?.last_name
                      ? `${review.profile.first_name} ${review.profile.last_name}`
                      : "Utilisateur"}
                  </Text>
                  <StarRating rating={review.rating} size={12} readonly />
                </View>
                <Text style={styles.reviewDate}>
                  {new Date(review.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric", month: "short"
                  })}
                </Text>
              </View>
              {review.comment && (
                <Text style={styles.reviewComment}>{review.comment}</Text>
              )}
            </View>
          ))}

          {reviews.length === 0 && !userReview && (
            <Text style={styles.noReviews}>Aucun avis pour l'instant. Sois le premier !</Text>
          )}
        </View>


        {/* Action portée du jour */}
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

const makeStyles = (colors: AppTheme) => StyleSheet.create({
  // Layout
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: colors.background,
  },
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },

  // Image
  imageContainer: { 
    height: 380, 
    position: "relative", 
    backgroundColor: colors.surfaceLight 
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
    backgroundColor: colors.background,
    justifyContent: "center", 
    alignItems: "center",
    borderWidth: 1, 
    borderColor: colors.gold30,
  },
  backText: { 
    fontSize: 18, 
    color: colors.gold 
  },
  favoriteButton: {
    position: "absolute", 
    top: 52, 
    right: 20,
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6,
    backgroundColor: colors.background,
    paddingHorizontal: 14, 
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1, 
    borderColor: colors.gold,
  },
  favoriteButtonActive: {
    backgroundColor: colors.background,
    borderColor: colors.gold,
  },
  favoriteText: { 
    fontSize: 16 
  },
  favoriteLabel: { 
    fontSize: 12, 
    color: colors.textSecondary, 
    fontWeight: "600" 
  },
  favoriteLabelActive: { 
    color: colors.gold 
  },
  imageOverlayContent: {
    position: "absolute", 
    bottom: 20, 
    left: 20, 
    right: 20,
  },
  brand: { 
    fontSize: 14, 
    color: colors.text, 
    fontWeight: "600", 
    marginBottom: 4 
  },
  name: { 
    fontSize: 30, 
    fontWeight: "bold", 
    color: colors.text 
  },

  // Contenu
  content: { 
    padding: 16, 
    paddingTop: 12 
  },

  // Score météo
  weatherBadge: {
    flexDirection: "row", 
    alignItems: "center", 
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 12, 
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
    color: colors.textSecondary, 
    marginTop: 2 
  },

  // Description
  description: { 
    fontSize: 15, 
    color: colors.textSecondary, 
    lineHeight: 24, 
    marginBottom: 24 
  },

  // Intensité card
  intensityCard: {
    flexDirection: "row", 
    alignItems: "center",
    borderRadius: 12, 
    padding: 12,
    marginBottom: 24,  
    justifyContent: "space-between",
  },
  intensityEmoji: { 
    fontSize: 24 
  },
  intensityLabel: { 
    fontSize: 10, 
    color: colors.textSecondary, 
    textTransform: "uppercase", 
    letterSpacing: 0.5 
  },
  intensityValue: { 
    fontSize: 12, 
    fontWeight: "bold", 
    color: colors.text, 
    marginTop: 2,
    flexShrink: 1, 
  },
  intensityDivider: { 
    width: 1, 
    height: 30, 
    backgroundColor: colors.gold20,
      marginHorizontal: 8, 
  },

  // Sections
  section: { 
    marginBottom: 24 
  },
  sectionTitle: { 
    fontSize: 12, 
    fontWeight: "bold", 
    color: colors.gold,
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
    borderRadius: 12, 
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
    backgroundColor: colors.gold10,
    borderWidth: 1, 
    borderColor: colors.gold30,
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20 
  },
  tagText: {
    color: colors.gold, 
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
    borderColor: colors.gold20,
  },
  wornButtonActive: {
    borderColor: colors.success,
  },
  wornButtonDisabled: { 
    borderColor: colors.textMuted 
  },
  wornButtonText: { 
    fontSize: 13, 
    color: colors.textSecondary 
  },
  wornButtonTextDisabled: { 
    color: colors.textMuted 
  },

  // Erreur & infos génériques
  errorText: {
    fontSize: 16,
    color: colors.error,
    fontWeight: "600"
  },
  infoRow: {
    flexDirection: "row", 
    justifyContent: "space-between", 
    paddingVertical: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.gold10
  },
  infoLabel: {
    color: colors.textSecondary, 
    fontSize: 14 
  },
  infoValue: {
    color: colors.text, 
    fontSize: 14, 
    fontWeight: "600" 
  },

  // Rating
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gold15,
  },
  ratingAverage: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.text,
  },
  ratingCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Mon avis
  myReviewCard: {
    backgroundColor: colors.gold10,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.gold30,
    marginBottom: 12,
    gap: 8,
  },
  myReviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  myReviewTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: colors.gold,
  },
  myReviewActions: {
    flexDirection: "row",
    gap: 12,
  },
  editReviewText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  deleteReviewText: {
    fontSize: 14,
  },
  myReviewComment: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 4,
  },

  // Bouton ajouter avis
  addReviewButton: {
    borderWidth: 1,
    borderColor: colors.gold30,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  addReviewText: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: "600",
  },

  // Formulaire avis
  reviewForm: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gold20,
    marginBottom: 16,
    gap: 12,
  },
  reviewFormTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
  },
  reviewInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.gold15,
    minHeight: 80,
  },
  reviewFormActions: {
    flexDirection: "row",
    gap: 10,
  },
  cancelReviewButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.textMuted,
    alignItems: "center",
  },
  cancelReviewText: {
    color: colors.textSecondary,
    fontWeight: "600",
  },
  submitReviewButton: {
    flex: 2,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.gold,
    alignItems: "center",
  },
  submitDisabled: {
    opacity: 0.4,
  },
  submitReviewText: {
    color: colors.background,
    fontWeight: "bold",
  },

  // Cartes avis communauté
  reviewCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.gold10,
    gap: 8,
  },
  reviewCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gold,
    justifyContent: "center",
    alignItems: "center",
  },
  reviewAvatarText: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.background,
  },
  reviewCardInfo: {
    flex: 1,
    gap: 2,
  },
  reviewAuthor: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  reviewDate: {
    fontSize: 11,
    color: colors.textMuted,
  },
  reviewComment: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  noReviews: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    paddingVertical: 16,
  },
  collectionButton: {
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.gold30,
  },
  collectionButtonActive: {
    backgroundColor: colors.gold10,
    borderColor: colors.gold,
  },
  collectionButtonText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: "600",
  },
});