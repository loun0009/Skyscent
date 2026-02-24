import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Perfume } from '../types';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});


export const requestNotificationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: "Parfum du jour",
            importance: Notifications.AndroidImportance.DEFAULT,
            vibrationPattern: [0, 250, 250, 250],
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus === 'granted') {
        return true;
    }
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
};

export const scheduleNotification = async (
    hour: number,
    minute: number,
    perfume: Perfume
): Promise<string | null> => {
    try {
        await cancelDailyNotification();
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: "🌸 Votre parfum du jour",
                body: `${perfume.name} par ${perfume.brand} - ${perfume.description}`,
                data: { perfumeId: perfume.id },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,   
                hour,
                minute,
            },
        });
        return id;
    } catch (error) {
        console.error("Erreur lors de la planification de la notification :", error);
        return null;
    }
};

export const cancelDailyNotification = async (): Promise<void> => {
    await Notifications.cancelAllScheduledNotificationsAsync();
};

export const getScheduledNotifications = async () => {
    return await Notifications.getAllScheduledNotificationsAsync();
};

