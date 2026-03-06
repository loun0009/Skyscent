import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Linking, Platform } from "react-native";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import { useState } from "react";
import { useNearbyStores } from "../../src/hooks/useNearByStores";
import { PerfumeStore } from "../../src/services/placesServices";
import { theme } from "../../src/theme";

const RADIUS_OPTIONS = [
  { label: "500m", value: 500 },
  { label: "1km", value: 1000 },
  { label: "3km", value: 3000 },
  { label: "5km", value: 5000 },
];

const openInMaps = (store: PerfumeStore) => {
    // Ouvre l'application de cartographie native avec les directions vers la parfumerie
  const url = Platform.select({
    ios: `maps://app?daddr=${store.latitude},${store.longitude}`,
    android: `google.navigation:q=${store.latitude},${store.longitude}`,
  });
  if (url) Linking.openURL(url);
};

export default function MapScreen() {
    // Utilise le hook personnalisé pour obtenir les parfumeries à proximité et la localisation de l'utilisateur
  const { stores, loading, error, userLocation, refresh, radius, setRadius } =
    useNearbyStores();
    // Stocke la parfumerie sélectionnée pour afficher ses détails
  const [selectedStore, setSelectedStore] = useState<PerfumeStore | null>(null);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.gold} />
        <Text style={styles.loadingText}>Recherche des parfumeries...</Text>
      </View>
    );
  }

  if (error || !userLocation) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorEmoji}>📍</Text>
        <Text style={styles.errorText}>
          {error ?? "Impossible de récupérer votre position."}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {/* Carte */}
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        customMapStyle={darkMapStyle}
      >
        {/* Position utilisateur */}
        <Marker
          coordinate={userLocation}
          title="Vous êtes ici"
          pinColor={theme.colors.gold}
        />

        {/* Cercle de rayon */}
        <Circle
          center={userLocation}
          radius={radius}
          strokeColor="#c9a84c66"
          fillColor="#c9a84c0d"
        />

        {/* Marqueurs parfumeries */}
        {stores.map((store) => (
          <Marker
            key={store.id}
            coordinate={{
              latitude: store.latitude,
              longitude: store.longitude,
            }}
            title={store.name}
            description={store.address}
            pinColor={
              selectedStore?.id === store.id ? "#FF6B6B" : "#C9A84C"
            }
            onPress={() => setSelectedStore(store)}
          />
        ))}
      </MapView>

      {/* Header flottant */}
      <View style={styles.header}>
        <Text style={styles.headline}>Parfumeries 🗺️</Text>
        <Text style={styles.count}>
          {stores.length} trouvée{stores.length > 1 ? "s" : ""}
        </Text>
      </View>

      {/* Sélecteur de rayon */}
      <View style={styles.radiusContainer}>
        {RADIUS_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.radiusPill,
              radius === option.value && styles.radiusPillActive,
            ]}
            onPress={() => setRadius(option.value)}
          >
            <Text
              style={[
                styles.radiusText,
                radius === option.value && styles.radiusTextActive,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Carte du magasin sélectionné */}
      {selectedStore && (
        <View style={styles.storeCard}>
          <View style={styles.storeInfo}>
            <View style={styles.storeHeader}>
              <Text style={styles.storeName} numberOfLines={1}>
                {selectedStore.name}
              </Text>
              {selectedStore.isOpen !== null && (
                <View
                  style={[
                    styles.openBadge,
                    {
                      backgroundColor: selectedStore.isOpen
                        ? "#4caf5033"
                        : "#ff6b6b33",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.openText,
                      {
                        color: selectedStore.isOpen
                          ? theme.colors.success
                          : theme.colors.error,
                      },
                    ]}
                  >
                    {selectedStore.isOpen ? "Ouvert" : "Fermé"}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.storeAddress} numberOfLines={1}>
              📍 {selectedStore.address}
            </Text>
            {selectedStore.rating && (
              <Text style={styles.storeRating}>
                ⭐ {selectedStore.rating.toFixed(1)}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.directionsButton}
            onPress={() => openInMaps(selectedStore)}
          >
            <Text style={styles.directionsText}>Y aller</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Liste des magasins si aucun sélectionné */}
      {!selectedStore && stores.length > 0 && (
        <ScrollView
          style={styles.storeList}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storeListContent}
        >
          {stores.map((store) => (
            <TouchableOpacity
              key={store.id}
              style={styles.storeListItem}
              onPress={() => setSelectedStore(store)}
            >
              <Text style={styles.storeListName} numberOfLines={1}>
                {store.name}
              </Text>
              <Text style={styles.storeListAddress} numberOfLines={1}>
                {store.address}
              </Text>
              {store.rating && (
                <Text style={styles.storeListRating}>
                  ⭐ {store.rating.toFixed(1)}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// Style sombre pour Google Maps
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0A0A0F" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9A8F82" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0A0A0F" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1A1A26" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#12121A" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#22222F" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#050510" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#0A1A0A" }] },
];

const styles = StyleSheet.create({
  wrapper: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
},
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    padding: 24,
  },
  map: { 
    flex: 1 
},
  loadingText: {
    color: theme.colors.textSecondary,
    marginTop: 12,
    fontSize: 14,
  },
  errorEmoji: { 
    fontSize: 48, 
    marginBottom: 16 
},
  errorText: {
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: "#c9a84c1a",
    borderWidth: 1,
    borderColor: theme.colors.gold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: { 
    color: theme.colors.gold, 
    fontWeight: "600" 
  },
  header: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0A0A0F",
    padding: 14,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: "#c9a84c33",
  },
  headline: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
  },
  count: { 
    fontSize: 13, 
    color: theme.colors.gold 
  },
  radiusContainer: {
    position: "absolute",
    top: 120,
    left: 20,
    right: 20,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  radiusPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#0A0A0F",
    borderWidth: 1,
    borderColor: "#c9a84c33",
  },
  radiusPillActive: {
    backgroundColor: theme.colors.gold,
    borderColor: theme.colors.gold,
  },
  radiusText: { 
    color: theme.colors.textSecondary, 
    fontSize: 13, 
    fontWeight: "600" 
  },
  radiusTextActive: { 
    color: theme.colors.background 
},
  storeCard: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#c9a84c33",
    gap: 12,
  },
  storeInfo: { 
    flex: 1 
},
  storeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    flex: 1,
  },
  openBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  openText: { 
    fontSize: 11, 
    fontWeight: "600" 
  },
  storeAddress: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  storeRating: { 
    fontSize: 12, 
    color: theme.colors.gold 
  },
  directionsButton: {
    backgroundColor: theme.colors.gold,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  directionsText: {
    color: theme.colors.background,
    fontWeight: "bold",
    fontSize: 14,
  },
  storeList: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
  },
  storeListContent: { 
    paddingHorizontal: 20, 
    gap: 10 
  },
  storeListItem: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: 12,
    width: 180,
    borderWidth: 1,
    borderColor: "#c9a84c26",
  },
  storeListName: {
    fontSize: 13,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  storeListAddress: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  storeListRating: { 
    fontSize: 11, 
    color: theme.colors.gold 
  },
});