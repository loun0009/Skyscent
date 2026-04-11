import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Linking, Platform } from "react-native";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import { useState } from "react";
import { useNearbyStores } from "../../src/hooks/useNearByStores";
import { PerfumeStore } from "../../src/services/placesServices";
import { useAppTheme } from "../../src/theme";
import { useTheme } from "../../src/context/ThemeContext";

const RADIUS_OPTIONS = [
  { label: "500m", value: 500 },
  { label: "1km", value: 1000 },
  { label: "5km", value: 5000 },
  { label: "10km", value: 10000 },
];

const openInMaps = (store: PerfumeStore) => {
  const url = Platform.select({
    ios: `maps://app?daddr=${store.latitude},${store.longitude}`,
    android: `google.navigation:q=${store.latitude},${store.longitude}`,
  });
  if (url) Linking.openURL(url);
};

const getMapStyle = (colors: ReturnType<typeof useAppTheme>, isDark: boolean) => {
  if (!isDark) return []; // En light mode, on utilise le style Google Maps par défaut
  return [
    { elementType: "geometry", stylers: [{ color: colors.background }] },
    { elementType: "labels.text.fill", stylers: [{ color: colors.textSecondary }] },
    { elementType: "labels.text.stroke", stylers: [{ color: colors.background }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: colors.surface }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: colors.surfaceLight }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: colors.card }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: colors.mapWater }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: colors.mapPark }] },
  ];
};

export default function MapScreen() {
  const { stores, loading, error, userLocation, refresh, radius, setRadius } =
    useNearbyStores();
  const [selectedStore, setSelectedStore] = useState<PerfumeStore | null>(null);

  const colors = useAppTheme();
  const { isDark } = useTheme();
  const styles = makeStyles(colors);
  const mapStyle = getMapStyle(colors, isDark);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.gold} />
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
        customMapStyle={mapStyle}
      >
        {/* Position utilisateur */}
        <Marker
          coordinate={userLocation}
          title="Vous êtes ici"
          pinColor={colors.gold}
        />

        {/* Cercle de rayon */}
        <Circle
          center={userLocation}
          radius={radius}
          strokeColor={colors.gold40}
          fillColor={colors.gold05}
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
            pinColor={selectedStore?.id === store.id ? colors.error : colors.gold}
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
                        ? colors.success20
                        : colors.error20,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.openText,
                      {
                        color: selectedStore.isOpen
                          ? colors.success
                          : colors.error,
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

const makeStyles = (colors: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      backgroundColor: colors.background,
    },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
      padding: 24,
    },
    map: {
      flex: 1,
    },
    loadingText: {
      color: colors.textSecondary,
      marginTop: 12,
      fontSize: 14,
    },
    errorEmoji: {
      fontSize: 48,
      marginBottom: 16,
    },
    errorText: {
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 20,
      fontSize: 14,
    },
    retryButton: {
      backgroundColor: colors.gold10,
      borderWidth: 1,
      borderColor: colors.gold,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    retryText: {
      color: colors.gold,
      fontWeight: "600",
    },
    header: {
      position: "absolute",
      top: 60,
      left: 20,
      right: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.surface,
      padding: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.gold20,
    },
    headline: {
      fontSize: 18,
      fontWeight: "bold",
      color: colors.text,
    },
    count: {
      fontSize: 13,
      color: colors.gold,
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
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.gold20,
    },
    radiusPillActive: {
      backgroundColor: colors.gold,
      borderColor: colors.gold,
    },
    radiusText: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: "600",
    },
    radiusTextActive: {
      color: colors.white,
    },
    storeCard: {
      position: "absolute",
      bottom: 20,
      left: 20,
      right: 20,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.gold20,
      gap: 12,
    },
    storeInfo: {
      flex: 1,
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
      color: colors.text,
      flex: 1,
    },
    openBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
    },
    openText: {
      fontSize: 11,
      fontWeight: "600",
    },
    storeAddress: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    storeRating: {
      fontSize: 12,
      color: colors.gold,
    },
    directionsButton: {
      backgroundColor: colors.gold,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
    },
    directionsText: {
      color: colors.white,
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
      gap: 10,
    },
    storeListItem: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 12,
      width: 180,
      borderWidth: 1,
      borderColor: colors.gold15,
    },
    storeListName: {
      fontSize: 13,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 4,
    },
    storeListAddress: {
      fontSize: 11,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    storeListRating: {
      fontSize: 11,
      color: colors.gold,
    },
  });