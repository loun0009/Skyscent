import { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchPerfumeById } from "../../src/services/perfumesApi";
import { Perfume } from "../../src/types";

export default function PerfumeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchPerfumeById(Number(id));
      setPerfume(data);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6B4EFF" />
      </View>
    );
  }

  if (!perfume) {
    return (
      <View style={styles.center}>
        <Text>Parfum introuvable.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Retour</Text>
      </TouchableOpacity>

      <Image source={{ uri: perfume.image_url }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.name}>{perfume.name}</Text>
        <Text style={styles.brand}>{perfume.brand}</Text>
        <Text style={styles.description}>{perfume.description}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes olfactives</Text>
          <View style={styles.tags}>
            {perfume.notes.map((note) => (
              <View key={note} style={styles.tag}>
                <Text style={styles.tagText}>{note}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Intensité</Text>
            <Text style={styles.infoValue}>{perfume.intensity}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Genre</Text>
            <Text style={styles.infoValue}>{perfume.gender}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Saisons</Text>
            <Text style={styles.infoValue}>{perfume.season.join(", ")}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Température idéale</Text>
            <Text style={styles.infoValue}>{perfume.temp_min}°C → {perfume.temp_max}°C</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
},
  container: { 
    flex: 1, 
    backgroundColor: "#f8f8fc" 
},
  backButton: { 
    padding: 20, 
    paddingTop: 60 
},
  backText: { 
    fontSize: 16, 
    color: "#6B4EFF", 
    fontWeight: "600" 
},
  image: { 
    width: "100%", 
    height: 280, 
    resizeMode: "cover" 
},
  content: { 
    padding: 20 
},
  name: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: "#1a1a2e" 
},
  brand: { 
    fontSize: 16, 
    color: "#6B4EFF", 
    marginTop: 4, 
    marginBottom: 16 
},
  description: { 
    fontSize: 15, 
    color: "#555", 
    lineHeight: 24, 
    marginBottom: 24 
},
  section: { 
    marginBottom: 24 
},
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#1a1a2e", 
    marginBottom: 12 
},
  tags: {
    flexDirection: "row", 
    flexWrap: "wrap", 
    gap: 8 
    },
  tag: { 
    backgroundColor: "#ede9ff", 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20 
},
  tagText: {
    color: "#6B4EFF", 
    fontSize: 13, 
    fontWeight: "500" 
    },
  infoRow: {
    flexDirection: "row", 
    justifyContent: "space-between", 
    paddingVertical: 10, 
    borderBottomWidth: 1, 
    borderBottomColor: "#eee" 
    },
  infoLabel: {
    color: "#999", 
    fontSize: 14 
},
  infoValue: {
    color: "#1a1a2e", 
    fontSize: 14, 
    fontWeight: "600" 
},
  errorText: {
    fontSize: 16,
    color: "#1a1a2e",
    fontWeight: "600"
  },
});