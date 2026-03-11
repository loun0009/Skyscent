import { Stack, Redirect, useSegments } from "expo-router";
import { FavoritesProvider } from "../src/context/FavoritesContext";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { HistoryProvider } from "../src/context/HistoryContext";
import { ReviewsProvider } from "../src/context/ReviewsContext";
import { CollectionProvider } from "../src/context/CollectionContext";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";
import { StatusBar } from "expo-status-bar";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const segments = useSegments();

  if (loading) return null;

  const inAuthScreen = segments[0] === "auth";

  if (!user && !inAuthScreen) {
    return <Redirect href="/auth" />;
  }

  if (user && inAuthScreen) {
    return <Redirect href="/(tabs)" />;
  }

  return <>{children}</>;
};

function AppNavigator() {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
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
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FavoritesProvider>
          <HistoryProvider>
            <ReviewsProvider>
              <CollectionProvider>
                <AppNavigator />
              </CollectionProvider>
            </ReviewsProvider>
          </HistoryProvider>
        </FavoritesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}