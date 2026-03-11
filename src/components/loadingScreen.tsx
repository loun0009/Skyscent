import { View, Text, ActivityIndicator, StyleSheet, Animated } from "react-native";
import { useEffect, useRef } from "react";
import { AppTheme, useAppTheme } from "../theme";


interface Props {
  message?: string;
}

export const LoadingScreen = ({ message = "Chargement..." }: Props) => {
  const colors = useAppTheme();
  const styles = makeStyles(colors);
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
      <ActivityIndicator size="large" color={colors.gold} style={styles.spinner} />
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
};

const makeStyles = (colors: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  emoji: { 
    fontSize: 48, 
    marginBottom: 16 
  },
  spinner: { 
    marginBottom: 12
  },
  message: { fontSize: 15, 
    color: colors.textSecondary 
  },
});