import { View, Text, Switch, TouchableOpacity, StyleSheet, Modal, ScrollView } from "react-native";
import { useState } from "react";
import { Perfume } from "../types";
import { AppTheme, useAppTheme } from "../theme";

interface Props {
  enabled: boolean;
  hour: number;
  minute: number;
  isScheduled: boolean;
  topPerfumes: Perfume | null;
  onEnable: (hour: number, minute: number, perfume: Perfume) => void;
  onDisable: () => void;
  onUpdateTime: (hour: number, minute: number, perfume: Perfume) => void;
}

export const NotificationSettings = ({
  enabled,
  hour,
  minute,
  isScheduled,
  topPerfumes,
  onEnable,
  onDisable,
  onUpdateTime,
}: Props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState(hour);
  const [selectedMinute, setSelectedMinute] = useState(minute);
  const colors = useAppTheme();
  const styles = makeStyles(colors);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleToggle = async (value: boolean) => {
    if (!topPerfumes) return;
    if (value) {
      await onEnable(selectedHour, selectedMinute, topPerfumes);
    } else {
      await onDisable();
    }
  };

  const formatTime = (h: number, m: number) => `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

  const handleSaveTime = async () => {
    if (!topPerfumes) return;
    await onUpdateTime(selectedHour, selectedMinute, topPerfumes);
    setModalVisible(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.title}>Parfum du jour 🔔</Text>
          <Text style={styles.subtitle}>
            {isScheduled ? `Notification à ${formatTime(hour, minute)}` : "Notifications désactivées"}
          </Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={handleToggle}
          trackColor={{ false: colors.textSecondary, true: colors.goldDark }}
          thumbColor={enabled ? colors.gold : colors.card}
        />
      </View>

      {enabled && (
        <TouchableOpacity style={styles.timeButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.timeButtonText}>⏰ Changer l'heure - {formatTime(hour, minute)}</Text>
        </TouchableOpacity>
      )}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choisir l'heure</Text>

            <View style={styles.pickerRow}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Heure</Text>
                <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                  {hours.map((h) => (
                    <TouchableOpacity
                      key={h}
                      style={[styles.pickerItem, selectedHour === h && styles.pickerItemActive]}
                      onPress={() => setSelectedHour(h)}
                    >
                      <Text style={[styles.pickerItemText, selectedHour === h && styles.pickerItemTextActive]}>
                        {String(h).padStart(2, "0")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <Text style={styles.separator}>:</Text>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Minute</Text>
                <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                  {minutes.map((m) => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.pickerItem, selectedMinute === m && styles.pickerItemActive]}
                      onPress={() => setSelectedMinute(m)}
                    >
                      <Text style={[styles.pickerItemText, selectedMinute === m && styles.pickerItemTextActive]}>
                        {String(m).padStart(2, "0")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveTime}>
              <Text style={styles.saveButtonText}>Confirmer - {formatTime(selectedHour, selectedMinute)}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const makeStyles = (colors: AppTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text,
    },
    subtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    timeButton: {
      marginTop: 12,
      backgroundColor: colors.gold10,
      padding: 10,
      borderRadius: 10,
      alignItems: "center",
    },
    timeButtonText: {
      color: colors.gold,
      fontWeight: "600",
      fontSize: 14,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      paddingBottom: 40,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 24,
      textAlign: "center",
    },
    pickerRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
    },
    pickerColumn: {
      alignItems: "center",
    },
    pickerLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    picker: {
      height: 180,
      width: 80,
    },
    pickerItem: {
      padding: 12,
      alignItems: "center",
      borderRadius: 10,
      marginBottom: 4,
    },
    pickerItemActive: {
      backgroundColor: colors.gold10,
    },
    pickerItemText: {
      fontSize: 18,
      color: colors.text,
    },
    pickerItemTextActive: {
      color: colors.gold,
      fontWeight: "bold",
    },
    separator: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.text,
      marginHorizontal: 16,
    },
    saveButton: {
      backgroundColor: colors.gold,
      padding: 16,
      borderRadius: 14,
      alignItems: "center",
      marginBottom: 12,
    },
    saveButtonText: {
      color: colors.card,
      fontWeight: "bold",
      fontSize: 16,
    },
    cancelButton: {
      alignItems: "center",
      padding: 12,
    },
    cancelButtonText: {
      color: colors.textSecondary,
      fontSize: 15,
    },
  });
