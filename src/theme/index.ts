// ============================================================
// DARK THEME (existant)
// ============================================================
export const darkTheme = {
  // Fonds
  background: '#0a0a0a',
  surface: '#1a1a1a',
  surfaceLight: '#242424',
  card: '#1e1e1e',
  cardBorder: '#2a2a2a',

  // Textes
  text: '#ffffff',
  textSecondary: '#a0a0a0',
  textMuted: '#808080',

  // Or / Accent
  gold: '#c9a84c',
  gold05: '#C9A84C0D',
  gold10: '#C9A84C1A',
  gold15: '#C9A84C26',
  gold20: '#C9A84C33',
  gold30: '#C9A84C4D',
  gold40: '#C9A84C66',

  // Statuts
  error: '#e74c3c',
  error10: '#E74C3C1A',
  error20: '#E74C3C33',
  success: '#2ecc71',
  success20: '#2ECC7133',

  // Météo
  weatherSnow: '#b0c4de',
  weatherRain: '#4682b4',
  weatherStorm: '#2c3e50',
  weatherClouds: '#7f8c8d',
  weatherClear: '#f39c12',
  weatherDefault: '#95a5a6',
  overlayDark: '#00000099',

  // Saisons
  seasonSpring: '#27ae60',
  seasonSummer: '#f39c12',
  seasonAutumn: '#e67e22',
  seasonWinter: '#3498db',

  // Intensité
  intensityLightBg: '#2ECC7126',
  intensityMediumBg: '#F39C1226',
  intensityStrongBg: '#E74C3C26',
  intensityLightDot: '#2ecc71',
  intensityMediumDot: '#f39c12',
  intensityStrongDot: '#e74c3c',

  // Maps
  mapWater: '#a8d5e2',
  mapPark: '#b8e0b0',

  // Utilitaires
  white: '#ffffff',
  black: '#000000',
  placeholder: '#505050',
  inputBorder: '#333333',
  borderSubtle: '#2a2a2a',

  // Overlay / Gradients
  overlay: '#00000080',
  gradientStart: '#0A0A0A00',
  gradientEnd: '#0A0A0AFF',
};

// ============================================================
// LIGHT THEME
// ============================================================
export const lightTheme = {
  // Fonds
  background: '#f5f5f0',
  surface: '#ffffff',
  surfaceLight: '#f0ede6',
  card: '#ffffff',
  cardBorder: '#e0ddd6',

  // Textes
  text: '#1a1a1a',
  textSecondary: '#555555',
  textMuted: '#777777',

  // Or / Accent
  gold: '#b8903a',
  gold05: '#B8903A0D',
  gold10: '#B8903A1A',
  gold15: '#B8903A26',
  gold20: '#B8903A33',
  gold30: '#B8903A4D',
  gold40: '#B8903A66',

  // Statuts
  error: '#c0392b',
  error10: '#C0392B1A',
  error20: '#C0392B33',
  success: '#27ae60',
  success20: '#27AE6033',

  // Météo
  weatherSnow: '#6ea3c8',
  weatherRain: '#2e6da0',
  weatherStorm: '#1a252f',
  weatherClouds: '#5d6d7e',
  weatherClear: '#d68910',
  weatherDefault: '#707b7c',
  overlayDark: '#00000066',

  // Saisons
  seasonSpring: '#1e8449',
  seasonSummer: '#d68910',
  seasonAutumn: '#ca6f1e',
  seasonWinter: '#2980b9',

  // Intensité
  intensityLightBg: '#27AE601F',
  intensityMediumBg: '#D689101F',
  intensityStrongBg: '#C0392B1F',
  intensityLightDot: '#27ae60',
  intensityMediumDot: '#d68910',
  intensityStrongDot: '#c0392b',

  // Maps
  mapWater: '#7ec8e3',
  mapPark: '#90c97a',

  // Utilitaires
  white: '#ffffff',
  black: '#000000',
  placeholder: '#aaaaaa',
  inputBorder: '#d0cdc6',
  borderSubtle: '#e8e5de',

  // Overlay / Gradients
  overlay: '#0000004D',
  gradientStart: '#F5F5F000',
  gradientEnd: '#F5F5F0FF',
};

// Type partagé
export type AppTheme = typeof darkTheme;

// Hook utilitaire — à importer dans les composants
// Usage : const colors = useAppTheme();
import { useTheme } from '../context/ThemeContext';

export function useAppTheme(): AppTheme {
  const { isDark } = useTheme();
  return isDark ? darkTheme : lightTheme;
}