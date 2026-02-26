import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Button } from 'react-native'
import { useState } from 'react'
import { Filters, Perfume } from '../types'
import { theme } from '../theme';

interface Props {
    filters: Filters;
    perfumes: Perfume[];
    activeCount: number;
    onGenderChange: (gender: Filters['gender']) => void;
    onIntensityChange: (intensity: Filters['intensity']) => void;
    onBrandChange: (brand: string) => void;
    onReset: () => void;
}

const  FilterPill = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
    <TouchableOpacity
        style={[styles.pill, active && styles.pillActive]}
        onPress={onPress}
    >
        <Text style={[styles.pillText, active && styles.pillTextActive]}>{label}</Text>
    </TouchableOpacity>
);

export const FilterBar = ({ filters, perfumes, activeCount, onGenderChange, onIntensityChange, onBrandChange, onReset }: Props) => {
    const [modalVisible, setModalVisible] = useState(false);
    const brands = Array.from(new Set(perfumes.map(p => p.brand))).sort();

    return (
        <View style={styles.container}>
            <TouchableOpacity style={[styles.filterButton, activeCount > 0 && styles.filterButtonActive]} onPress={() => setModalVisible(true)}>
                <Text style={[styles.filterButtonText, activeCount > 0 && styles.filterButtonTextActive]}>
                    Filtre {activeCount > 0 ? `(${activeCount})` : ''}
                </Text>
            </TouchableOpacity>

            {activeCount > 0 && (
                <Button title="x" color={theme.colors.textSecondary} onPress={onReset} />
            )}

            <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Filtres</Text>
                            <Button title="x" color={theme.colors.textSecondary} onPress={() => setModalVisible(false)} />
                        </View>

                        <Text style={styles.filterLabel}>Genre</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
                            {(['tous', 'masculin', 'féminin', 'mixte'] as Filters['gender'][]).map((g) => (
                                <FilterPill
                                    key={g}
                                    label={ g.charAt(0).toUpperCase() + g.slice(1)}
                                    active={filters.gender === g}
                                    onPress={() => onGenderChange(g)}
                                />
                            ))}
                        </ScrollView>

                        <Text style={styles.filterLabel}>Intensité</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
                            {(['tous', 'légère', 'modérée', 'intense'] as Filters['intensity'][]).map((i) => (
                                <FilterPill
                                    key={i}
                                    label={ i.charAt(0).toUpperCase() + i.slice(1)}
                                    active={filters.intensity === i}
                                    onPress={() => onIntensityChange(i)}
                                />
                            ))}
                        </ScrollView>

                        <Text style={styles.filterLabel}>Marque</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
                            {brands.map((b) => (
                                <FilterPill
                                    key={b}
                                    label={b}
                                    active={filters.brand === b}
                                    onPress={() => onBrandChange(b)}
                                />
                            ))}
                        </ScrollView>

                        <TouchableOpacity style={styles.applyButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.applyButtonText}>Appliquer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    backgroundColor: "#c9a84c1a",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.gold,
  },
  filterButtonText: {
    color: theme.colors.gold,
    fontWeight: "600",
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: theme.colors.card,
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
  },
  resetText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.textPrimary,
  },
  closeButton: {
    fontSize: 18,
    color: theme.colors.textSecondary,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textPrimary,
    marginBottom: 10,
  },
  pillRow: {
    marginBottom: 20,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: theme.colors.gold,
  },
  pillText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  pillTextActive: {
    color: theme.colors.card,
    fontWeight: "600",
  },
  applyButton: {
    backgroundColor: theme.colors.gold,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  applyButtonText: {
    color: theme.colors.card,
    fontWeight: "bold",
    fontSize: 16,
  },
});