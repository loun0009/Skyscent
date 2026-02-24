import { useState, useEffect, use } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { requestNotificationPermission, scheduleNotification, cancelDailyNotification, getScheduledNotifications } from "../services/notificationsService";
import { Perfume } from "../types";

const NOTIFICATION_KEY = "DAILY_PERFUME_NOTIFICATION";

interface NotificationSettings {
    enabled: boolean;
    hour: number;
    minute: number;
}

interface UseNotificationsReturn {
    settings: NotificationSettings;
    isScheduled: boolean;
    loading: boolean;
    enableNotifications: (hour: number, minute: number, perfume: Perfume) => Promise<void>;
    disableNotifications: () => Promise<void>;
    updateTime: (hour: number, minute: number, perfume: Perfume) => Promise<void>;
}

const defaultSettings: NotificationSettings = {
    enabled: false,
    hour: 8,
    minute: 0,
};

export const useNotifications = (): UseNotificationsReturn => {
    const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
    const [isScheduled, setIsScheduled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const data = await AsyncStorage.getItem(NOTIFICATION_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                setSettings(parsed);
                const scheduled = await getScheduledNotifications();
                setIsScheduled(scheduled.length > 0);
            }
        } catch (error) {
            console.error("Failed to load notification settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async (newSettings: NotificationSettings) => {
        setSettings(newSettings);
        await AsyncStorage.setItem(NOTIFICATION_KEY, JSON.stringify(newSettings));
    };

    const enableNotifications = async (hour: number, minute: number, perfume: Perfume) => {
        const granted = await requestNotificationPermission();
        if (!granted) {
            alert("Permission refusée pour les notifications.");
            return;
        }
        await scheduleNotification(hour, minute, perfume);
        await saveSettings({ enabled: true, hour, minute });
        setIsScheduled(true);
    };

    const disableNotifications = async () => {
        await cancelDailyNotification();
        await saveSettings({ ...settings, enabled: false });
        setIsScheduled(false);
    }

    const updateTime = async (hour: number, minute: number, perfume: Perfume) => {
        await scheduleNotification(hour, minute, perfume);
        await saveSettings({ ...settings, hour, minute, enabled: true });
    };

    return {
        settings,
        isScheduled,
        loading,
        enableNotifications,
        disableNotifications,
        updateTime,
    };
}