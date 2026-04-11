import { View, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, ScrollView, Animated, KeyboardAvoidingView, Platform, Switch } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { useRef, useState } from "react";
import { useAppTheme } from "../../src/theme";
import { useTheme } from "../../src/context/ThemeContext";
import { router } from "expo-router/build/exports";
import { useCollection } from "../../src/context/CollectionContext";
import { usePerfumes } from "../../src/hooks/usePerfumes";
import { Image, FlatList } from "react-native";

const GENDER_OPTIONS = ["homme", "femme", "autre"] as const;
const STEPS = 5;

const INTENSITY_OPTIONS = [
  { value: "légère", label: "Légère", emoji: "🌸", desc: "Discrète et fraîche" },
  { value: "modérée", label: "Modérée", emoji: "🌺", desc: "Équilibrée et polyvalente" },
  { value: "intense", label: "Intense", emoji: "🔥", desc: "Puissante et envoûtante" },
] as const;

const SEASON_OPTIONS = [
  { value: "spring", label: "Printemps", emoji: "🌱" },
  { value: "summer", label: "Été", emoji: "☀️" },
  { value: "autumn", label: "Automne", emoji: "🍂" },
  { value: "winter", label: "Hiver", emoji: "❄️" },
] as const;

export default function ProfileScreen() {
  const { user, signOut, updateUserProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [age, setAge] = useState(user?.age?.toString() ?? "");
  const [gender, setGender] = useState<"homme" | "femme" | "autre" | null>(user?.gender ?? null);
  const [step, setStep] = useState(1);
  const [intensity, setIntensity] = useState<"légère" | "modérée" | "intense" | null>(null);
  const [season, setSeason] = useState<"spring" | "summer" | "autumn" | "winter" | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { addMany } = useCollection();
  const { perfumes } = usePerfumes(null);
  const [selectedPerfumes, setSelectedPerfumes] = useState<number[]>([]);

  const colors = useAppTheme();
  const { isDark, themeMode, setThemeMode, toggleTheme } = useTheme();
  const styles = makeStyles(colors);

  const toggleSelectPerfume = (id: number) => {
    setSelectedPerfumes((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const animateStep = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -30, duration: 200, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();
  };

  const goNext = () => {
    animateStep();
    setTimeout(() => setStep((s) => s + 1), 200);
  };

  const canProceed = () => {
    if (step === 1) return firstName.trim().length > 0 && lastName.trim().length > 0;
    if (step === 2) return gender !== null;
    if (step === 3) return intensity !== null;
    if (step === 4) return season !== null;
    if (step === 5) return true;
    return false;
  };

  const handleFinish = async () => {
    setSaving(true);
    await updateUserProfile({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      gender: gender ?? undefined,
      preferred_intensity: intensity ?? undefined,
      preferred_season: season ?? undefined,
      onboarding_completed: true,
    });
    if (selectedPerfumes.length > 0) {
      await addMany(selectedPerfumes);
    }
    setSaving(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await updateUserProfile({
      first_name: firstName,
      last_name: lastName,
      age: age ? parseInt(age) : undefined,
      gender: gender ?? undefined,
    });
    setSaving(false);
    setEditing(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // ─── ONBOARDING ────────────────────────────────────────────
  if (!user?.onboarding_completed) {
    return (
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.onboardingContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Progression */}
          <View style={styles.progressContainer}>
            {Array.from({ length: STEPS }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  i + 1 <= step && styles.progressDotActive,
                  i + 1 === step && styles.progressDotCurrent,
                ]}
              />
            ))}
          </View>

          <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

            {/* Étape 1 : identité */}
            {step === 1 && (
              <View>
                <Text style={styles.emoji}>👋</Text>
                <Text style={styles.title}>Bienvenue sur SkyScent !</Text>
                <Text style={styles.subtitle}>
                  Commençons par faire connaissance. Comment t'appelles-tu ?
                </Text>
                <Text style={styles.label}>Prénom</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Ton prénom"
                  placeholderTextColor={colors.textMuted}
                  autoFocus
                />
                <Text style={styles.label}>Nom</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Ton nom"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            )}

            {/* Étape 2 : genre */}
            {step === 2 && (
              <View>
                <Text style={styles.emoji}>👤</Text>
                <Text style={styles.title}>Tu es...</Text>
                <Text style={styles.subtitle}>
                  Pour te recommander les parfums qui te correspondent.
                </Text>
                <View style={styles.genderOnboardingRow}>
                  <TouchableOpacity
                    style={[styles.genderCard, gender === "femme" && styles.genderCardActive]}
                    onPress={() => setGender("femme")}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.genderEmoji}>👩</Text>
                    <Text style={[styles.genderLabel, gender === "femme" && styles.genderLabelActive]}>
                      Femme
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.genderCard, gender === "homme" && styles.genderCardActive]}
                    onPress={() => setGender("homme")}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.genderEmoji}>👨</Text>
                    <Text style={[styles.genderLabel, gender === "homme" && styles.genderLabelActive]}>
                      Homme
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Étape 3 : intensité */}
            {step === 3 && (
              <View>
                <Text style={styles.emoji}>🌸</Text>
                <Text style={styles.title}>Ton intensité préférée</Text>
                <Text style={styles.subtitle}>
                  Quelle intensité correspond le mieux à ta personnalité ?
                </Text>
                {INTENSITY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.optionCard, intensity === option.value && styles.optionCardActive]}
                    onPress={() => setIntensity(option.value)}
                  >
                    <Text style={styles.optionEmoji}>{option.emoji}</Text>
                    <View style={styles.optionText}>
                      <Text style={[styles.optionLabel, intensity === option.value && styles.optionLabelActive]}>
                        {option.label}
                      </Text>
                      <Text style={styles.optionDesc}>{option.desc}</Text>
                    </View>
                    {intensity === option.value && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Étape 4 : saison */}
            {step === 4 && (
              <View>
                <Text style={styles.emoji}>🗓️</Text>
                <Text style={styles.title}>Ta saison préférée</Text>
                <Text style={styles.subtitle}>
                  On adaptera les recommandations à ta saison favorite.
                </Text>
                <View style={styles.seasonGrid}>
                  {SEASON_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.seasonCard, season === option.value && styles.seasonCardActive]}
                      onPress={() => setSeason(option.value)}
                    >
                      <Text style={styles.seasonEmoji}>{option.emoji}</Text>
                      <Text style={[styles.seasonLabel, season === option.value && styles.seasonLabelActive]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Étape 5 : collection */}
            {step === 5 && (
              <View>
                <Text style={styles.emoji}>💎</Text>
                <Text style={styles.title}>Ta collection</Text>
                <Text style={styles.subtitle}>
                  Sélectionne les parfums que tu possèdes déjà.{"\n"}
                  Tu pourras en ajouter d'autres plus tard.
                </Text>
                <Text style={styles.collectionCount}>
                  {selectedPerfumes.length} sélectionné{selectedPerfumes.length > 1 ? "s" : ""}
                </Text>
                <FlatList
                  data={perfumes}
                  keyExtractor={(item) => item.id.toString()}
                  numColumns={2}
                  scrollEnabled={false}
                  columnWrapperStyle={styles.collectionRow}
                  contentContainerStyle={styles.collectionGrid}
                  renderItem={({ item }) => {
                    const selected = selectedPerfumes.includes(item.id);
                    return (
                      <TouchableOpacity
                        style={[styles.collectionCard, selected && styles.collectionCardActive]}
                        onPress={() => toggleSelectPerfume(item.id)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.collectionImageContainer}>
                          <Image
                            source={{ uri: item.image_url || undefined }}
                            style={styles.collectionImage}
                            resizeMode="contain"
                          />
                          {selected && (
                            <View style={styles.collectionCheckOverlay}>
                              <Text style={styles.collectionCheck}>✓</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.collectionName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.collectionBrand} numberOfLines={1}>{item.brand}</Text>
                      </TouchableOpacity>
                    );
                  }}
                />
              </View>
            )}
          </Animated.View>

          <TouchableOpacity
            style={[styles.button, !canProceed() && styles.buttonDisabled]}
            onPress={step < STEPS ? goNext : handleFinish}
            disabled={!canProceed() || saving}
          >
            <Text style={styles.buttonText}>
              {saving ? "Enregistrement..." : step < STEPS ? "Continuer →" : "Commencer l'aventure 🚀"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ─── PROFIL ────────────────────────────────────────────────
  const displayName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.email;
  const avatarLetter =
    user?.first_name?.charAt(0).toUpperCase() ?? user?.email?.charAt(0).toUpperCase();

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.headline}>Mon profil 👤</Text>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </View>
          <Text style={styles.displayName}>{displayName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.since}>
            Membre depuis{" "}
            {new Date(user?.created_at ?? "").toLocaleDateString("fr-FR", {
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>

        {/* Raccourcis */}
        <View style={styles.shortcutsRow}>
          <TouchableOpacity style={styles.shortcutCard} onPress={() => router.push("/history")}>
            <Text style={styles.shortcutEmoji}>📖</Text>
            <Text style={styles.shortcutLabel} numberOfLines={1} adjustsFontSizeToFit>Historique</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shortcutCard} onPress={() => router.push("/favorites")}>
            <Text style={styles.shortcutEmoji}>❤️</Text>
            <Text style={styles.shortcutLabel}>Favoris</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shortcutCard} onPress={() => router.push("/stats")}>
            <Text style={styles.shortcutEmoji}>📊</Text>
            <Text style={styles.shortcutLabel}>Stats</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shortcutCard} onPress={() => router.push("/settings")}>
            <Text style={styles.shortcutEmoji}>⚙️</Text>
            <Text style={styles.shortcutLabel} numberOfLines={1} adjustsFontSizeToFit>Paramètres</Text>
          </TouchableOpacity>
        </View>

        {/* ─── APPARENCE (toggle thème) ─── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Apparence</Text>

          <View style={[styles.themeRow, { borderBottomColor: colors.borderSubtle }]}>
            <View style={styles.themeRowLeft}>
              <Text style={styles.themeIcon}>{isDark ? "🌙" : "☀️"}</Text>
              <View>
                <Text style={styles.themeLabel}>
                  Mode {isDark ? "sombre" : "clair"}
                </Text>
                <Text style={styles.themeSubLabel}>
                  {themeMode === "system" ? "Suit le système" : isDark ? "Activé manuellement" : "Désactivé manuellement"}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.borderSubtle, true: colors.gold30 }}
              thumbColor={isDark ? colors.gold : colors.textSecondary}
            />
          </View>

          <TouchableOpacity
            style={styles.themeRow}
            onPress={() => setThemeMode("system")}
          >
            <View style={styles.themeRowLeft}>
              <Text style={styles.themeIcon}>📱</Text>
              <View>
                <Text style={styles.themeLabel}>Suivre le système</Text>
                <Text style={styles.themeSubLabel}>S'adapte automatiquement à votre téléphone</Text>
              </View>
            </View>
            {themeMode === "system" && (
              <Text style={{ color: colors.gold, fontSize: 18 }}>✓</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Infos profil */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Informations personnelles</Text>
            {!editing && (
              <TouchableOpacity onPress={() => setEditing(true)}>
                <Text style={styles.editButton}>✏️ Modifier</Text>
              </TouchableOpacity>
            )}
          </View>

          {editing ? (
            <>
              <Text style={styles.label}>Prénom</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Ton prénom"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Ton nom"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={styles.label}>Âge</Text>
              <TextInput
                style={styles.input}
                value={age}
                onChangeText={setAge}
                placeholder="Ton âge"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                maxLength={3}
              />
              <Text style={styles.label}>Genre</Text>
              <View style={styles.genderRow}>
                {GENDER_OPTIONS.map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderPill, gender === g && styles.genderPillActive]}
                    onPress={() => setGender(g)}
                  >
                    <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.editActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setEditing(false)}>
                  <Text style={styles.cancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                  {saving ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Text style={styles.saveText}>Enregistrer</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Prénom</Text>
                <Text style={styles.infoValue}>{user?.first_name || "Non renseigné"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nom</Text>
                <Text style={styles.infoValue}>{user?.last_name || "Non renseigné"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Âge</Text>
                <Text style={styles.infoValue}>
                  {user?.age ? `${user.age} ans` : "Non renseigné"}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Genre</Text>
                <Text style={styles.infoValue}>
                  {user?.gender
                    ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
                    : "Non renseigné"}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Déconnexion */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Se déconnecter</Text>
        </TouchableOpacity>
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
    headline: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 24,
    },
    avatarSection: {
      alignItems: "center",
      marginBottom: 24,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.gold,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    avatarText: {
      fontSize: 32,
      fontWeight: "bold",
      color: colors.white,
    },
    displayName: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
    },
    email: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    since: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 4,
    },

    // Raccourcis
    shortcutsRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 20,
    },
    shortcutCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      alignItems: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: colors.gold15,
    },
    shortcutEmoji: {
      fontSize: 24,
    },
    shortcutLabel: {
      fontSize: 10,
      fontWeight: "600",
      color: colors.textSecondary,
    },

    // Carte
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 12,
    },
    editButton: {
      fontSize: 13,
      color: colors.gold,
      fontWeight: "600",
    },

    // Toggle thème
    themeRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSubtle,
    },
    themeRowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    themeIcon: {
      fontSize: 20,
      width: 28,
      textAlign: "center",
    },
    themeLabel: {
      fontSize: 15,
      fontWeight: "500",
      color: colors.text,
    },
    themeSubLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },

    // Infos
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSubtle,
    },
    infoLabel: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    infoValue: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },

    // Formulaire édition
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text,
      marginTop: 12,
      marginBottom: 6,
    },
    input: {
      backgroundColor: colors.surfaceLight,
      borderRadius: 10,
      padding: 12,
      fontSize: 14,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    genderRow: {
      flexDirection: "row",
      gap: 8,
      marginTop: 4,
    },
    genderPill: {
      flex: 1,
      padding: 10,
      borderRadius: 10,
      backgroundColor: colors.surfaceLight,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    genderPillActive: {
      backgroundColor: colors.gold,
      borderColor: colors.gold,
    },
    genderText: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: "500",
    },
    genderTextActive: {
      color: colors.white,
      fontWeight: "600",
    },
    editActions: {
      flexDirection: "row",
      gap: 10,
      marginTop: 20,
    },
    cancelButton: {
      flex: 1,
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      alignItems: "center",
    },
    cancelText: {
      color: colors.textSecondary,
      fontWeight: "600",
    },
    saveButton: {
      flex: 2,
      padding: 12,
      borderRadius: 10,
      backgroundColor: colors.gold,
      alignItems: "center",
    },
    saveText: {
      color: colors.white,
      fontWeight: "bold",
    },
    signOutButton: {
      backgroundColor: colors.error10,
      padding: 16,
      borderRadius: 14,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.error20,
    },
    signOutText: {
      color: colors.error,
      fontWeight: "bold",
      fontSize: 15,
    },

    // Onboarding
    onboardingContainer: {
      padding: 24,
      paddingTop: 80,
      paddingBottom: 40,
      flexGrow: 1,
    },
    progressContainer: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
      marginBottom: 48,
    },
    progressDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.textMuted,
    },
    progressDotActive: {
      backgroundColor: colors.gold,
    },
    progressDotCurrent: {
      width: 24,
      backgroundColor: colors.gold,
    },
    title: {
      fontSize: 26,
      fontWeight: "bold",
      color: colors.text,
      textAlign: "center",
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 32,
    },
    emoji: {
      fontSize: 56,
      textAlign: "center",
      marginBottom: 16,
    },
    genderOnboardingRow: {
      flexDirection: "row",
      gap: 16,
      marginTop: 8,
    },
    genderCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      alignItems: "center",
      gap: 12,
      borderWidth: 1,
      borderColor: colors.gold15,
    },
    genderCardActive: {
      backgroundColor: colors.gold10,
      borderColor: colors.gold,
    },
    genderEmoji: {
      fontSize: 48,
    },
    genderLabel: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.textSecondary,
    },
    genderLabelActive: {
      color: colors.gold,
    },
    optionCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.gold15,
      gap: 14,
    },
    optionCardActive: {
      borderColor: colors.gold,
      backgroundColor: colors.gold10,
    },
    optionEmoji: {
      fontSize: 28,
    },
    optionText: {
      flex: 1,
    },
    optionLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },
    optionLabelActive: {
      color: colors.gold,
    },
    optionDesc: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    checkmark: {
      fontSize: 18,
      color: colors.gold,
      fontWeight: "bold",
    },
    seasonGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      justifyContent: "center",
    },
    seasonCard: {
      width: "45%",
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.gold15,
      gap: 8,
    },
    seasonCardActive: {
      borderColor: colors.gold,
      backgroundColor: colors.gold10,
    },
    seasonEmoji: {
      fontSize: 36,
    },
    seasonLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },
    seasonLabelActive: {
      color: colors.gold,
    },
    button: {
      backgroundColor: colors.gold,
      padding: 16,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 32,
    },
    buttonDisabled: {
      opacity: 0.4,
    },
    buttonText: {
      color: colors.white,
      fontWeight: "bold",
      fontSize: 16,
    },

    // Collection onboarding
    collectionCount: {
      fontSize: 13,
      color: colors.gold,
      fontWeight: "600",
      textAlign: "center",
      marginBottom: 16,
    },
    collectionGrid: {
      gap: 10,
    },
    collectionRow: {
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 10,
    },
    collectionCard: {
      width: "48%",
      backgroundColor: colors.surface,
      borderRadius: 12,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.gold15,
    },
    collectionCardActive: {
      borderColor: colors.gold,
      backgroundColor: colors.gold10,
    },
    collectionImageContainer: {
      width: "100%",
      height: 100,
      backgroundColor: colors.white,
      position: "relative",
    },
    collectionImage: {
      width: "100%",
      height: 100,
    },
    collectionCheckOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.gold30,
      justifyContent: "center",
      alignItems: "center",
    },
    collectionCheck: {
      fontSize: 32,
      color: colors.white,
      fontWeight: "bold",
    },
    collectionName: {
      fontSize: 12,
      fontWeight: "bold",
      color: colors.text,
      padding: 8,
      paddingBottom: 2,
    },
    collectionBrand: {
      fontSize: 10,
      color: colors.gold,
      paddingHorizontal: 8,
      paddingBottom: 8,
    },
  });