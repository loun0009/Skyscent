import { View, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, ScrollView, Animated, KeyboardAvoidingView, Platform } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { useRef, useState } from "react";
import { theme } from "../../src/theme";
import { router } from "expo-router/build/exports";
import { useCollection } from "../../src/context/CollectionContext";
import { usePerfumes } from "../../src/hooks/usePerfumes";
import { Image, FlatList } from "react-native";

const GENDER_OPTIONS  = ["homme", "femme", "autre"] as const;
const STEPS = 4;

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
  const [gender, setGender] = useState<"homme" | "femme" | "autre" | null>( user?.gender ?? null );
  const [step, setStep] = useState(1);
  const [intensity, setIntensity] = useState<"légère" | "modérée" | "intense" | null>(null);
  const [season, setSeason] = useState<"spring" | "summer" | "autumn" | "winter" | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { addMany } = useCollection();
  const { perfumes } = usePerfumes(null);
  const [selectedPerfumes, setSelectedPerfumes] = useState<number[]>([]);

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
    if (step === 2) return intensity !== null;
    if (step === 3) return season !== null;
    if (step === 4) return true; // Pas de condition, c'est juste pour ajouter des parfums à la collection (optionnel)
    return false;
  };

  const handleFinish = async () => {
  setSaving(true);
  await updateUserProfile({
    first_name: firstName.trim(),
    last_name: lastName.trim(),
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
      gender: gender ?? undefined
    });
    setSaving(false);
    setEditing(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

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
          {/* Progression onboarding */}
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

          <Animated.View
            style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            {/* Étape 1: identité */}
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
                  placeholderTextColor={theme.colors.textMuted}
                  autoFocus
                />
                <Text style={styles.label}>Nom</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Ton nom"
                  placeholderTextColor={theme.colors.textMuted}
                />
              </View>
            )}

            {/* Étape 2: intensité */}
            {step === 2 && (
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
                    {intensity === option.value && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Étape 3: saison */}
            {step === 3 && (
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
            {/* Étape 4: collection */}
            {step === 4 && (
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
                          source={{ uri: item.image_url }}
                          style={styles.collectionImage}
                          resizeMode="contain"
                        />
                        {selected && (
                          <View style={styles.collectionCheckOverlay}>
                            <Text style={styles.collectionCheck}>✓</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.collectionName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.collectionBrand} numberOfLines={1}>
                        {item.brand}
                      </Text>
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

  const displayName = user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.email;
  const avatarLetter = user?.first_name?.charAt(0).toUpperCase() ?? user?.email?.charAt(0).toUpperCase(); 

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
              <TouchableOpacity
                style={styles.shortcutCard}
                onPress={() => router.push("/history")}
              >
                <Text style={styles.shortcutEmoji}>📖</Text>
                <Text style={styles.shortcutLabel}>Historique</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shortcutCard}
                onPress={() => router.push("/favorites")}
              >
                <Text style={styles.shortcutEmoji}>❤️</Text>
                <Text style={styles.shortcutLabel}>Favoris</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shortcutCard}
                onPress={() => router.push("/stats")}
              >
                <Text style={styles.shortcutEmoji}>📊</Text>
                <Text style={styles.shortcutLabel}>Stats</Text>
              </TouchableOpacity>

                            <TouchableOpacity
                style={styles.shortcutCard}
                onPress={() => router.push("/settings")}
              >
                <Text style={styles.shortcutEmoji}>⚙️</Text>
                <Text style={styles.shortcutLabel}>Paramètres</Text>
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
                      placeholderTextColor={theme.colors.textSecondary}
                    />

                  <Text style={styles.label}>Nom</Text>
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Ton nom"
                    placeholderTextColor={theme.colors.textSecondary}
                  />

                  <Text style={styles.label}>Âge</Text>
                  <TextInput
                    style={styles.input}
                    value={age}
                    onChangeText={setAge}
                    placeholder="Ton âge"
                    placeholderTextColor={theme.colors.textSecondary}
                    keyboardType="numeric"
                    maxLength={3}
                  />

                  <Text style={styles.label}>Genre</Text>
                  <View style={styles.genderRow}>
                    {GENDER_OPTIONS.map((g) => (
                      <TouchableOpacity key={g} style={[styles.genderPill,gender === g && styles.genderPillActive]} onPress={() => setGender(g)}>
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
                      {saving ? (<ActivityIndicator color={theme.colors.card} size="small" />
                      ) : (<Text style={styles.saveText}>Enregistrer</Text>)}
                    </TouchableOpacity>
                  </View>
                </>
                ) : (
                <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Prénom</Text>
                  <Text style={styles.infoValue}>
                    {user?.first_name || "Non renseigné"}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Nom</Text>
                  <Text style={styles.infoValue}>
                    {user?.last_name || "Non renseigné"}
                  </Text>
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
    padding: 20, 
    paddingTop: 60, 
    paddingBottom: 40 
},

  // Header & identité
  headline: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: theme.colors.textPrimary, 
    marginBottom: 24 
},
  avatarSection: { 
    alignItems: "center", 
    marginBottom: 24 
},
  avatar: {
    width: 80, 
    height: 80, 
    borderRadius: 40,
    backgroundColor: theme.colors.gold,
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 12,
  },
  avatarText: { 
    fontSize: 32, 
    fontWeight: "bold", 
    color: theme.colors.card 
},
  displayName: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: theme.colors.textPrimary 
},
  email: { 
    fontSize: 14, 
    color: theme.colors.textSecondary, 
    marginTop: 4 
},
  since: { 
    fontSize: 12, 
    color: theme.colors.textMuted, 
    marginTop: 4 
},

  // Carte infos personnelles
  card: {
    backgroundColor: theme.colors.card, 
    borderRadius: 16, 
    padding: 16,
    marginBottom: 16,
    shadowColor: theme.colors.black, 
    shadowOffset: { 
        width: 0, 
        height: 2 
    },
    shadowOpacity: 0.08, 
    shadowRadius: 8, 
    elevation: 3,
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
    color: theme.colors.textPrimary 
},
  editButton: { 
    fontSize: 13, 
    color: theme.colors.gold, 
    fontWeight: "600" 
},
  infoRow: {
    flexDirection: "row", 
    justifyContent: "space-between",
    paddingVertical: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: theme.colors.borderSubtle,
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
  label: { 
    fontSize: 13, 
    fontWeight: "600", 
    color: theme.colors.textPrimary, 
    marginTop: 12, 
    marginBottom: 6 },
  input: {
    backgroundColor: theme.colors.background, 
    borderRadius: 10, 
    padding: 12,
    fontSize: 14, 
    color: theme.colors.textPrimary, 
    borderWidth: 1, 
    borderColor: theme.colors.textSecondary,
  },
  genderRow: { 
    flexDirection: "row", 
    gap: 8, 
    marginTop: 4 
},
  genderPill: {
    flex: 1, 
    padding: 10, 
    borderRadius: 10,
    backgroundColor: theme.colors.background, 
    alignItems: "center",
  },
  genderPillActive: { 
    backgroundColor: theme.colors.gold 
},
  genderText: { 
    fontSize: 13, 
    color: theme.colors.textSecondary, 
    fontWeight: "500" 
},
  genderTextActive: { 
    color: theme.colors.card, 
    fontWeight: "600" 
},
  editActions: { 
    flexDirection: "row", 
    gap: 10, 
    marginTop: 20 
},
  cancelButton: {
    flex: 1, 
    padding: 12, 
    borderRadius: 10,
    borderWidth: 1, 
    borderColor: theme.colors.textSecondary, 
    alignItems: "center",
  },
  cancelText: { 
    color: theme.colors.textSecondary, 
    fontWeight: "600" 
},
  saveButton: {
    flex: 2, 
    padding: 12, 
    borderRadius: 10,
    backgroundColor: theme.colors.gold, 
    alignItems: "center",
  },
  saveText: { 
    color: theme.colors.card, 
    fontWeight: "bold" 
},
  signOutButton: {
    backgroundColor: theme.colors.background, 
    padding: 16,
    borderRadius: 14, 
    alignItems: "center",
  },
  signOutText: { 
    color: theme.colors.error, 
    fontWeight: "bold", 
    fontSize: 15 
},

  // Onboarding
  onboardingContainer: { 
    padding: 24, 
    paddingTop: 80, 
    paddingBottom: 40, 
    flexGrow: 1 
},
  progressContainer: { 
    flexDirection: "row", 
    justifyContent: "center", 
    gap: 8, 
    marginBottom: 48 
  },
  progressDot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: theme.colors.textMuted 
  },
  progressDotActive: { 
    backgroundColor: theme.colors.gold 
  },
  progressDotCurrent: { 
    width: 24, 
    backgroundColor: theme.colors.gold 
  },
  title: { 
    fontSize: 26, 
    fontWeight: "bold", 
    color: theme.colors.textPrimary, 
    textAlign: "center", 
    marginBottom: 10 
  },
  subtitle: { 
    fontSize: 14, 
    color: theme.colors.textSecondary, 
    textAlign: "center", 
    lineHeight: 22, 
    marginBottom: 32 
  },
  emoji: { 
    fontSize: 56, 
    textAlign: "center", 
    marginBottom: 16 
  },
  optionCard: { 
    backgroundColor: theme.colors.card, 
    borderRadius: theme.radius.md, 
    padding: 16, 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: theme.colors.gold15, 
    gap: 14 
  },
  optionCardActive: { 
    borderColor: theme.colors.gold, 
    backgroundColor: theme.colors.gold08 
  },
  optionEmoji: { 
    fontSize: 28 
  },
  optionText: { 
    flex: 1 
  },
  optionLabel: { 
    fontSize: 15, 
    fontWeight: "600", 
    color: theme.colors.textPrimary 
  },
  optionLabelActive: { 
    color: theme.colors.gold 
  },
  optionDesc: { 
    fontSize: 12, 
    color: theme.colors.textSecondary, 
    marginTop: 2 
  },
  checkmark: { 
    fontSize: 18, 
    color: theme.colors.gold, 
    fontWeight: "bold" 
  },
  seasonGrid: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: 12, 
    justifyContent: "center" 
  },
  seasonCard: { 
    width: "45%", 
    backgroundColor: theme.colors.card, 
    borderRadius: theme.radius.lg, 
    padding: 24, 
    alignItems: "center", 
    borderWidth: 1, 
    borderColor: theme.colors.gold15, 
    gap: 8 
  },
  seasonCardActive: { 
    borderColor: theme.colors.gold, 
    backgroundColor: theme.colors.gold08 
  },
  seasonEmoji: { 
    fontSize: 36 
  },
  seasonLabel: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: theme.colors.textPrimary 
  },
  seasonLabelActive: { 
    color: theme.colors.gold 
  },
  button: { 
    backgroundColor: theme.colors.gold, 
    padding: 16, 
    borderRadius: theme.radius.md, 
    alignItems: "center", 
    marginTop: 32 
  },
  buttonDisabled: { 
    opacity: 0.4 
  },
  buttonText: { 
    color: theme.colors.background, 
    fontWeight: "bold", 
    fontSize: 16 
  },

  // Raccourcis
  shortcutsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  shortcutCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: theme.colors.gold15,
  },
  shortcutEmoji: {
    fontSize: 24,
  },
  shortcutLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },

  // Collection onboarding
  collectionCount: {
    fontSize: 13,
    color: theme.colors.gold,
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
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.gold15,
  },
  collectionCardActive: {
    borderColor: theme.colors.gold,
    backgroundColor: theme.colors.gold08,
  },
  collectionImageContainer: {
    width: "100%",
    height: 100,
    backgroundColor: theme.colors.white,
    position: "relative",
  },
  collectionImage: {
    width: "100%",
    height: 100,
  },
  collectionCheckOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.gold30,
    justifyContent: "center",
    alignItems: "center",
  },
  collectionCheck: {
    fontSize: 32,
    color: theme.colors.white,
    fontWeight: "bold",
  },
  collectionName: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    padding: 8,
    paddingBottom: 2,
  },
  collectionBrand: {
    fontSize: 10,
    color: theme.colors.gold,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
});