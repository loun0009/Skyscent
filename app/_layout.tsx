import { Stack, Redirect, useSegments } from "expo-router";
import { Text } from "react-native";
import { FavoritesProvider } from "../src/context/FavoritesContext";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { theme } from "../src/theme";
import { HistoryProvider } from "../src/context/HistoryContext";
import { ReviewsProvider } from "../src/context/ReviewsContext";
import { CollectionProvider } from "../src/context/CollectionContext";

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
          <ReviewsProvider>
            <CollectionProvider>
              <AuthGuard>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="auth" />
                  <Stack.Screen name="perfume/[id]" />
                  <Stack.Screen name="history" />
                  <Stack.Screen name="favorites" />
                  <Stack.Screen name="settings" />
                  <Stack.Screen name="stats" />
                </Stack>
              </AuthGuard>
            </CollectionProvider>
          </ReviewsProvider>
        </HistoryProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}