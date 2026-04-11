# 🌸 SkyScent

> Recommendations de parfums basées sur la météo en temps réel.

---

## 📱 Aperçu

SkyScent analyse les conditions climatiques de ta ville pour te suggérer les parfums les plus adaptés à ta journée. Fini les parfums trop lourds en pleine canicule ou trop légers par temps de pluie.

---

## ✨ Fonctionnalités

- **🌤️ Recommandations météo** — Suggestions personnalisées selon la température, l'humidité et la condition du jour
- **🌸 Catalogue** — 400+ parfums avec notes olfactives, intensité, saisons idéales et températures recommandées
- **❤️ Favoris** — Sauvegarde tes parfums préférés
- **💎 Collection** — Gère les parfums que tu possèdes déjà
- **📖 Historique** — Retrouve tous les parfums que tu as portés avec la météo du jour
- **📊 Statistiques** — Analyse tes habitudes (parfum le plus porté, marque favorite, saison la plus active…)
- **🗺️ Carte** — Trouve les parfumeries à proximité de ta position
- **⭐ Avis** — Note et commente les parfums, consulte les avis de la communauté
- **🌙 Dark / Light mode** — Thème sombre ou clair, avec suivi automatique du système

---

## 🛠️ Stack technique

| Technologie | Usage |
|---|---|
| React Native | Framework mobile |
| Expo Router | Navigation (Stack + Tabs) |
| TypeScript | Typage statique |
| Supabase | Base de données, Auth, Storage |
| OpenWeatherMap API | Données météo en temps réel |
| Google Places API | Parfumeries à proximité |
| AsyncStorage | Persistance locale (thème) |
| expo-linear-gradient | Dégradés visuels |
| react-native-maps | Carte interactive |

---

## 🗂️ Structure du projet

```
skyscent/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx        # Accueil & recommandations
│   │   ├── catalog.tsx      # Catalogue complet
│   │   ├── map.tsx          # Carte des parfumeries
│   │   └── profile.tsx      # Profil utilisateur
│   ├── auth.tsx             # Authentification
│   ├── perfume/[id].tsx     # Détail d'un parfum
│   ├── history.tsx          # Historique de port
│   ├── favorites.tsx        # Favoris
│   ├── stats.tsx            # Statistiques
│   └── settings.tsx         # Paramètres
├── src/
│   ├── components/          # Composants réutilisables
│   ├── context/             # Contextes React (Auth, Favorites, History…)
│   ├── hooks/               # Hooks personnalisés (useWeather, usePerfumes…)
│   ├── services/            # Appels API (Supabase, météo, places)
│   ├── types/               # Types TypeScript
│   └── theme.ts             # Système de thème (dark/light)
```

---

## 🚀 Installation

### Prérequis

- Node.js 18+
- Expo CLI
- Compte Supabase
- Clé API OpenWeatherMap
- Clé API Google Places

### Étapes

```bash
# Cloner le repo
git clone https://github.com/ton-username/skyscent.git
cd skyscent

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
```

Remplir le fichier `.env` :

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_WEATHER_API_KEY=your_openweathermap_key
EXPO_PUBLIC_WEATHER_BASE_URL=https://api.openweathermap.org/data/2.5
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_key
```

```bash
# Lancer l'application
npx expo start
```

---

## 🗃️ Base de données (Supabase)

| Table | Description |
|---|---|
| `perfumes` | Catalogue des parfums (400+ entrées) |
| `profiles` | Profil utilisateur et préférences |
| `favorites` | Parfums favoris par utilisateur |
| `perfume_history` | Historique de port avec météo |
| `collection` | Collection personnelle |
| `reviews` | Avis et notes communautaires |

---

## 🔐 Variables d'environnement

Copie `.env.example` en `.env` et renseigne tes clés. Ne commite jamais le fichier `.env`.

---
