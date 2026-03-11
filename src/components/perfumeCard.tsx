import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Perfume } from "../types";
import { useEffect, useRef, useState } from "react";
import { AppTheme, useAppTheme } from "../theme";

interface Props {
  perfume: Perfume;
  onPress: (perfume: Perfume) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => void;
  index?: number;
  rating?: { average: number; count: number };
}

export const PerfumeCard = ({ perfume, onPress, isFavorite = false, onToggleFavorite, index = 0, rating }: Props) => {
  const colors = useAppTheme();
  const styles = makeStyles(colors);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [imageError, setImageError] = useState(false);

  const intensityConfig: Record<string, { color: string; dot: string }> = {
    "légère": { color: colors.intensityLightBg, dot: colors.intensityLightDot },
    "modérée": { color: colors.intensityMediumBg, dot: colors.intensityMediumDot },
    "intense": { color: colors.intensityStrongBg, dot: colors.intensityStrongDot },
  };

  const intensity = intensityConfig[perfume.intensity] ?? {
    color: colors.surfaceLight,
    dot: colors.gold,
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
      <TouchableOpacity style={styles.card} onPress={() => onPress(perfume)} activeOpacity={0.8}>
        <View style={styles.imageContainer}>
          <Image
            source={imageError || !perfume.image_url ? require("../../assets/adaptative_logo.png") : { uri: perfume.image_url }}
            style={styles.image}
            resizeMode="contain"
            onError={() => setImageError(true)}
          />
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <Text style={styles.name} numberOfLines={1}>{perfume.name}</Text>
              <Text style={styles.brand}>{perfume.brand}</Text>
              {rating && rating.count > 0 && (
                <Text style={styles.rating}>⭐ {rating.average.toFixed(1)} ({rating.count})</Text>
              )}
            </View>
            <View style={styles.actions}>
              <View style={[styles.badge, { backgroundColor: intensity.color }]}>
                <View style={[styles.dot, { backgroundColor: intensity.dot }]} />
                <Text style={styles.badgeText}>{perfume.intensity}</Text>
              </View>
              {onToggleFavorite && (
                <TouchableOpacity style={styles.heartButton} onPress={() => onToggleFavorite(perfume.id)}>
                  <Text style={styles.heart}>{isFavorite ? "❤️" : "🤍"}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <Text style={styles.description} numberOfLines={2}>{perfume.description}</Text>

          <View style={styles.notesRow}>
            {perfume.notes.slice(0, 3).map((note) => (
              <View key={note} style={styles.noteTag}>
                <Text style={styles.noteText}>{note}</Text>
              </View>
            ))}
            {perfume.notes.length > 3 && <Text style={styles.moreNotes}>+{perfume.notes.length - 3}</Text>}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const makeStyles = (colors: AppTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      marginBottom: 12,
      flexDirection: "row",
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.gold15,
      minHeight: 120,
    },
    imageContainer: {
      width: 120,
      height: 120,
      backgroundColor: colors.white,
      justifyContent: "center",
      alignItems: "center",
    },
    image: {
      width: 110,
      height: 110,
      resizeMode: "contain",
    },
    content: {
      flex: 1,
      padding: 12,
      justifyContent: "space-between",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    titleBlock: {
      flex: 1,
      marginRight: 8,
    },
    name: {
      fontSize: 15,
      fontWeight: "bold",
      color: colors.text,
    },
    brand: {
      fontSize: 12,
      color: colors.gold,
      marginTop: 2,
    },
    actions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 20,
      gap: 4,
    },
    dot: {
      width: 5,
      height: 5,
      borderRadius: 3,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: "600",
      color: colors.text,
    },
    heartButton: {
      padding: 4,
    },
    heart: {
      fontSize: 16,
    },
    description: {
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 18,
      marginVertical: 6,
    },
    notesRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 4,
    },
    noteTag: {
      backgroundColor: colors.gold10,
      borderWidth: 1,
      borderColor: colors.gold20,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 20,
    },
    noteText: {
      fontSize: 10,
      color: colors.textMuted,
    },
    moreNotes: {
      fontSize: 10,
      color: colors.textMuted,
      alignSelf: "center",
    },
    rating: {
      fontSize: 11,
      color: colors.gold,
      marginTop: 2,
    },
  });
