import { Tabs } from "expo-router";
import { Text } from "react-native";
import { FavoritesProvider } from "../src/context/FavoritesContext";

export default function RootLayout() {
  return (
    <FavoritesProvider>
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
          name="settings"
          options={{
            title: "Paramètres",
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 20, color }}>⚙️</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="perfume/[id]"
          options={{ href: null }}
        />
      </Tabs>
    </FavoritesProvider>
  );
}