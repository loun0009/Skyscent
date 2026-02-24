import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useNotifications } from "../src/hooks/useNotifications";
import { usePerfumes } from "../src/hooks/usePerfumes";
import { useWeather } from "../src/hooks/useWeather";
import { NotificationSettings } from "../src/components/NotificationSettings";

export default function SettingsScreen() {
    const { weather } = useWeather();
    const { recommendations } = usePerfumes(weather);
    const { settings, isScheduled, enableNotifications, disableNotifications, updateTime } = useNotifications();
    const topPerfume = recommendations.length > 0 ? recommendations[0] : null;

    return (
        <View style={styles.wrapper}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.headline}>Paramètres ⚙️</Text>
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

const styles = StyleSheet.create({
  wrapper: { 
    flex: 1, 
    backgroundColor: "#f8f8fc" 
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
    color: "#1a1a2e", 
    marginBottom: 24 
},
  infoCard: {
    backgroundColor: "#ede9ff",
    borderRadius: 16,
    padding: 16,
  },
  infoTitle: { 
    fontSize: 15, 
    fontWeight: "bold", 
    color: "#6B4EFF", 
    marginBottom: 8 
},
  infoText: { 
    fontSize: 13, 
    color: "#555", 
    lineHeight: 20 
},
});