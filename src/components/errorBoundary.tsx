import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface Props {
    message: string;
    onRetry: () => void;
}

export const ErrorMessage = ({ message, onRetry }: Props) => {
    return (
        <View style={styles.container}>
            <Text style={styles.emoji}>⚠️</Text>
            <Text style={styles.message}>{message}</Text>
            <TouchableOpacity style={styles.button} onPress={onRetry}>
                <Text style={styles.buttonText}>Réessayer</Text>
            </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#f8f8fc",
  },
  emoji: { fontSize: 48, marginBottom: 16 },
  message: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#6B4EFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: { 
    color: "#fff", 
    fontWeight: "600", 
    fontSize: 15 
},
});