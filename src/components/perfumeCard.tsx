import { View, Text, Image, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Perfume } from "../types";
import { useEffect, useRef } from "react";
import { theme } from "../theme";


interface Props {
    perfume: Perfume;
    onPress: (perfume: Perfume) => void;
    isFavorite?: boolean;
    onToggleFavorite?: (id: number) => void;
    index?: number;
}

const intensityConfig = {
  "légère": { color: theme.colors.intensityLight, dot: "#4CAF50" },
  "modérée": { color: theme.colors.intensityMedium, dot: "#FF9800" },
  "intense": { color: theme.colors.intensityStrong, dot: "#F44336" },
};

export const PerfumeCard= ({ perfume, onPress, isFavorite = false, onToggleFavorite, index = 0 }: Props) => {

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const intensity = intensityConfig[perfume.intensity];

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
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateX: slideAnim }],}}>
      <TouchableOpacity style={styles.card} onPress={() => onPress(perfume)} activeOpacity={0.8}>
        <Image source={{ uri: perfume.image_url }} style={styles.image} />
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleBlock}>
              <Text style={styles.name} numberOfLines={1}>{perfume.name}</Text>
              <Text style={styles.brand}>{perfume.brand}</Text>
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

          <Text style={styles.description} numberOfLines={2}>
            {perfume.description}
          </Text>

          <View style={styles.notesRow}>
            {perfume.notes.slice(0, 3).map((note) => (
              <View key={note} style={styles.noteTag}>
                <Text style={styles.noteText}>{note}</Text>
              </View>
            ))}
            {perfume.notes.length > 3 && (
              <Text style={styles.moreNotes}>+{perfume.notes.length - 3}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    marginBottom: 12,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#c9a84c26",
  },
  image: { 
    width: 110, 
    height: 110 
  },
  content: { 
    flex: 1, 
    padding: 12, 
    justifyContent: "space-between" 
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleBlock: { 
    flex: 1, 
    marginRight: 8 
  },
  name: { 
    fontSize: 15, 
    fontWeight: "bold",
    color: theme.colors.textPrimary 
  },
  brand: { 
    fontSize: 12,
    color: theme.colors.gold, 
    marginTop: 2 
  },
  actions: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 6 
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
    borderRadius: 3 
  },
  badgeText: { 
    fontSize: 10, 
    fontWeight: "600", 
    color: theme.colors.textPrimary 
  },
  heartButton: { 
    padding: 4 
  },
  heart: { 
    fontSize: 16 
  },
  description: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginVertical: 6,
  },
  notesRow: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: 4 
  },
  noteTag: {
    backgroundColor: "#c9a84c1a",
    borderWidth: 1,
    borderColor: "#c9a84c33",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  noteText: { 
    fontSize: 10, 
    color: theme.colors.textMuted },
  moreNotes: { 
    fontSize: 10, 
    color: theme.colors.textMuted, 
    alignSelf: "center" 
  },
});