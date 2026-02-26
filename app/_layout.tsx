import { Tabs, useRouter, useSegments } from "expo-router";
import { Text } from "react-native";
import { useEffect } from "react";
import { FavoritesProvider } from "../src/context/FavoritesContext";
import { AuthProvider, useAuth } from "../src/context/AuthContext";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthScreen = segments[0] === "auth";

    if (!user && !inAuthScreen) {
      router.replace("/auth");
    } else if (user && inAuthScreen) {
      router.replace("/");
    }
  }, [user, loading, segments]);
//
  return <>{children}</>;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <AuthGuard>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: "#fff",
              borderTopColor: "#eee",
              height: 60,
              paddingBottom: 8,
            },
            tabBarActiveTintColor: "#6B4EFF",
            tabBarInactiveTintColor: "#aaa",
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
      </FavoritesProvider>
    </AuthProvider>
  );
}