import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Perfume } from "../types";

interface Props {
    perfume: Perfume;
    onPress: (perfume: Perfume) => void;
}

const intensityColors = {
    "light": "#a8e6cf",
    "moderate": "#ffd3a5",
    "strong": "#fd9853"
};

export const PerfumeCard= ({ perfume, onPress }: Props) => {
    return (
        <TouchableOpacity style={styles.card} onPress={() => onPress(perfume)}>
            <Image source={{ uri: perfume.image_url }} style={styles.image} />
            <View style={styles.content}>
                <View style={styles.header}>
                    <View style={styles.titleBlock}>
                        <Text style={styles.name} numberOfLines={1}>{perfume.name}</Text>
                        <Text style={styles.brand}>{perfume.brand}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: intensityColors[perfume.intensity] }]}>
                        <Text style={styles.badgeText}>{perfume.intensity}</Text>
                    </View>
                </View>
                <Text style={styles.description} numberOfLines={2}>
                    {perfume.description}
                </Text>
                <Text style={styles.notes} numberOfLines={1}>
                    Notes : {perfume.notes.join(". ")}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: 100,
    height: 100,
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
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  brand: {
    fontSize: 12,
    color: "#6B4EFF",
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },
  description: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },
  notes: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },
});