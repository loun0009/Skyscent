import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useNotifications } from "../src/hooks/useNotifications";
import { usePerfumes } from "../src/hooks/usePerfumes";
import { useWeather } from "../src/hooks/useWeather";
import { NotificationSettings } from "../src/components/NotificationSettings";
import { useAppTheme } from "../src/theme";
import { router } from "expo-router/build/exports";

export default function SettingsScreen() {
    const { weather } = useWeather();
    const { recommendations } = usePerfumes(weather);
    const { settings, isScheduled, enableNotifications, disableNotifications, updateTime } = useNotifications();
    const topPerfume = recommendations.length > 0 ? recommendations[0] : null;
    const colors = useAppTheme();
    const styles = makeStyles(colors);

    return (
        <View style={styles.wrapper}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                  <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headline}>Paramètres ⚙️</Text>
                <View style={{ width: 36 }} />
              </View>

              {/* Réglages notifications */}
                <NotificationSettings
                    enabled={settings.enabled}
                    hour={settings.hour}
                    minute={settings.minute}
                    isScheduled={isScheduled}
                    topPerfumes={topPerfume}
                    onEnable={enableNotifications}
                    onDisable={disableNotifications}
                    onUpdateTime={updateTime}
                />

                  {/* Carte d'explication */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>Comment ça fonctionne ?</Text>
                    <Text style={styles.infoText}>
                        Chaque matin, nous analysons les conditions météorologiques de votre ville pour vous recommander le parfum idéal du jour. En activant les notifications, vous recevrez une alerte quotidienne à l'heure de votre choix avec notre suggestion parfumée basée sur la météo du jour.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const makeStyles = (colors: any) =>
  StyleSheet.create({
  // Layout
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

  // Header
  headline: { 
    fontSize: 22, 
    fontWeight: "bold", 
    color: colors.textPrimary, 
},

  // Carte info
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
  },
  infoTitle: { 
    fontSize: 15, 
    fontWeight: "bold", 
    color: colors.textPrimary, 
    marginBottom: 8 
},
  infoText: { 
    fontSize: 13, 
    color: colors.textSecondary, 
    lineHeight: 20 
},

  // Navigation
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
    color: colors.gold,
  },
   header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
});