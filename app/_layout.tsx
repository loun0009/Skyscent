import { Tabs, Redirect, useSegments } from "expo-router";
import { Text } from "react-native";
import { FavoritesProvider } from "../src/context/FavoritesContext";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { theme } from "../src/theme";
import { HistoryProvider } from "../src/context/HistoryContext";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const segments = useSegments();

  if (loading) return null;

  const inAuthScreen = segments[0] === "auth";

  if (!user && !inAuthScreen) {
    return <Redirect href="/auth" />;
  }

  if (user && inAuthScreen) {
    return <Redirect href="/" />;
  }

  return <>{children}</>;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <HistoryProvider>
        <AuthGuard>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: theme.colors.surface,
              borderTopColor: "#c9a84c26",
              height: 60,
              paddingBottom: 8,
            },
            tabBarActiveTintColor: theme.colors.gold,
            tabBarInactiveTintColor: theme.colors.textMuted,
            tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Accueil",
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 20, color }}>🏠</Text>
              ),
            }}
          />
          <Tabs.Screen
            name="favorites"
            options={{
              title: "Favoris",
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 20, color }}>❤️</Text>
              ),
            }}
          />
          <Tabs.Screen
            name="history"
            options={{
              title: "Historique",
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 20, color }}>📖</Text>
            ),
          }}
          />
          <Tabs.Screen
            name="map"
            options={{
              title: "Carte",
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 20, color }}>🗺️</Text>
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profil",
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 20, color }}>👤</Text>
              ),
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: "Paramètres",
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 20, color }}>⚙️</Text>
              ),
            }}
          />
          <Tabs.Screen
            name="auth"
            options={{ href: null}}
          />
          <Tabs.Screen
            name="perfume/[id]"
            options={{ href: null }}
          />
        </Tabs>
        </AuthGuard>
        </HistoryProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}