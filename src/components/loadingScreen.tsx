import { View, Text, ActivityIndicator, StyleSheet, Animated } from "react-native";
import { useEffect, useRef } from "react";
import { theme } from "../theme";


interface Props {
  message?: string;
}

export const LoadingScreen = ({ message = "Chargement..." }: Props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.emoji}>🌸</Text>
      <ActivityIndicator size="large" color={theme.colors.gold} style={styles.spinner} />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  emoji: { 
    fontSize: 48, 
    marginBottom: 16 
  },
  spinner: { 
    marginBottom: 12
  },
  message: { fontSize: 15, 
    color: theme.colors.textSecondary 
  },
});