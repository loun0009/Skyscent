import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../theme";

interface Props {
    message: string;
    onRetry: () => void;
}

export const ErrorMessage = ({ message, onRetry }: Props) => {
    return (
        <View style={styles.container}>
      {/* Contenu erreur */}
            <Text style={styles.emoji}>⚠️</Text>
            <Text style={styles.message}>{message}</Text>
            <TouchableOpacity style={styles.button} onPress={onRetry}>
                <Text style={styles.buttonText}>Réessayer</Text>
            </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: theme.colors.background,
  },
  emoji: { fontSize: 48, marginBottom: 16 },
  message: {
    fontSize: 16,
    color: theme.colors.textDim,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },

  // Action
  button: {
    backgroundColor: theme.colors.primaryAction,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: { 
    color: theme.colors.white, 
    fontWeight: "600", 
    fontSize: 15 
},
});