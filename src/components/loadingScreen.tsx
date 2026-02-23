import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

interface Props {
  message?: string;
}

export const LoadingScreen = ({ message = "Chargement en cours..." }: Props) => {
    return (
        <View style={styles.container}>
            <Text style={styles.emoji}>⏳</Text>
            <ActivityIndicator size="large" color="#6B4EFF"  style={styles.spinner} />
            <Text style={styles.message}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  emoji: { fontSize: 48, marginBottom: 16 },
  spinner: { marginBottom: 12 },
  message: { fontSize: 15, color: "#667" },
});