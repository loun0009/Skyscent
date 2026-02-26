import { View, Text, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, ScrollView } from "react-native";
import { useAuth } from "../src/context/AuthContext";
import { useState } from "react";
import { theme } from "../src/theme";

const GENDER_OPTIONS  = ["homme", "femme", "autre"] as const;

export default function ProfileScreen() {
    const { user, signOut, updateUserProfile } = useAuth();
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [firstName, setFirstName] = useState(user?.first_name ?? "");
    const [lastName, setLastName] = useState(user?.last_name ?? "");
    const [age, setAge] = useState(user?.age?.toString() ?? "");
    const [gender, setGender] = useState<"homme" | "femme" | "autre" | null>( user?.gender ?? null );

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

    const displayName = user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.email;
    const avatarLetter = user?.first_name?.charAt(0).toUpperCase() ?? user?.email?.charAt(0).toUpperCase(); 

    return (
        <View style={styles.wrapper}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
  card: {
    backgroundColor: theme.colors.card, 
    borderRadius: 16, 
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000", 
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
    borderBottomColor: "#f0f0f0",
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
});