import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { getUserStats, UserStats } from "../src/services/statsService";
import { useAppTheme } from "../src/theme";

const SEASON_LABEL: Record<string, string> = {
  spring: "🌱 Printemps",
  summer: "☀️ Été",
  autumn: "🍂 Automne",
  winter: "❄️ Hiver",
};

const INTENSITY_LABEL: Record<string, string> = {
  "légère": "🌸 Légère",
  "modérée": "🌺 Modérée",
  "intense": "🔥 Intense",
};

const StatCard = ({
  emoji, title, value, subtitle, styles,
}: {
  emoji: string;
  title: string;
  value: string;
  subtitle?: string;
  styles: ReturnType<typeof makeStyles>;
}) => (
  <View style={styles.statCard}>
    <Text style={styles.statEmoji}>{emoji}</Text>
    <View style={styles.statContent}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  </View>
);

export default function StatsScreen() {
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const colors = useAppTheme();
  const styles = makeStyles(colors);

  useEffect(() => {
    const load = async () => {
      const data = await getUserStats();
      setStats(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headline}>Mes statistiques 📊</Text>
          <View style={{ width: 36 }} />
        </View>

        {loading ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: 40 }} />
        ) : !stats || stats.totalWorn === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>Pas encore de statistiques</Text>
            <Text style={styles.emptySubtitle}>
              Commence à marquer des parfums comme portés pour voir tes stats !
            </Text>
          </View>
        ) : (
          <>
            {/* Chiffres clés */}
            <Text style={styles.sectionTitle}>Chiffres clés</Text>
            <View style={styles.keyStatsRow}>
              <View style={styles.keyStatCard}>
                <Text style={styles.keyStatValue}>{stats.totalWorn}</Text>
                <Text style={styles.keyStatLabel}>Portés</Text>
              </View>
              <View style={styles.keyStatCard}>
                <Text style={styles.keyStatValue}>{stats.uniquePerfumes}</Text>
                <Text style={styles.keyStatLabel}>Uniques</Text>
              </View>
              <View style={styles.keyStatCard}>
                <Text style={styles.keyStatValue}>{stats.currentStreak}</Text>
                <Text style={styles.keyStatLabel}>Jours 🔥</Text>
              </View>
              {stats.averageTemperature !== null && (
                <View style={styles.keyStatCard}>
                  <Text style={styles.keyStatValue}>{stats.averageTemperature}°</Text>
                  <Text style={styles.keyStatLabel}>Moy. temp.</Text>
                </View>
              )}
            </View>

            {/* Favoris */}
            <Text style={styles.sectionTitle}>Tes préférences réelles</Text>

            {stats.favoritePerfume && (
              <StatCard
                styles={styles}
                emoji="🏆"
                title="Parfum le plus porté"
                value={stats.favoritePerfume.name}
                subtitle={`${stats.favoritePerfume.brand} · ${stats.favoritePerfume.count} fois`}
              />
            )}

            {stats.favoriteBrand && (
              <StatCard
                styles={styles}
                emoji="🏅"
                title="Marque favorite"
                value={stats.favoriteBrand.name}
                subtitle={`${stats.favoriteBrand.count} utilisations`}
              />
            )}

            {stats.favoriteIntensity && (
              <StatCard
                styles={styles}
                emoji="💪"
                title="Intensité favorite"
                value={INTENSITY_LABEL[stats.favoriteIntensity.value] ?? stats.favoriteIntensity.value}
                subtitle={`${stats.favoriteIntensity.count} fois`}
              />
            )}

            {stats.favoriteSeason && (
              <StatCard
                styles={styles}
                emoji="🗓️"
                title="Saison la plus active"
                value={SEASON_LABEL[stats.favoriteSeason.value] ?? stats.favoriteSeason.value}
                subtitle={`${stats.favoriteSeason.count} jours`}
              />
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
    wrapper: { 
      flex: 1, 
      backgroundColor: colors.background 
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
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gold20,
  },
  backText: { 
    fontSize: 18, 
    color: colors.gold 
  },
  headline: { 
    fontSize: 22, 
    fontWeight: "bold", 
    color: colors.text 
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.gold,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
  },

  // Chiffres clés
  keyStatsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
    flexWrap: "wrap",
  },
  keyStatCard: {
    flex: 1,
    minWidth: "22%",
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gold15,
    gap: 4,
  },
  keyStatValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.gold,
  },
  keyStatLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: "center",
  },

  // Stat cards
  statCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.gold15,
    gap: 14,
  },
  statEmoji: { 
    fontSize: 32 
  },
  statContent: { 
    flex: 1 
  },
  statTitle: {
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  statSubtitle: {
    fontSize: 12,
    color: colors.gold,
    marginTop: 2,
  },

  // Vide
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
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
});