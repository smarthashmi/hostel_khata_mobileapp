import { useState, useEffect } from 'react';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Platform, Alert } from 'react-native';
import apiMethods from '../services/apiMethods';

export const usePushNotifications = () => {
    const [fcmToken, setFcmToken] = useState<string | undefined>('');
    const [notification, setNotification] = useState<FirebaseMessagingTypes.RemoteMessage | undefined>(undefined);

    const requestUserPermission = async () => {
        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            console.log('Authorization status:', authStatus);
            getFcmToken();
        } else {
            console.log('Push notification permission denied');
        }
    };

    const getFcmToken = async () => {
        try {
            const token = await messaging().getToken();
            if (token) {
                console.log('FCM Push Token:', token);
                setFcmToken(token);
                // Send token to backend
                apiMethods.notification.registerPushToken(token)
                    .then(() => console.log('FCM token registered with backend'))
                    .catch(err => {
                        console.log('Backend FCM token registration failed:', err.message);
                    });
            } else {
                console.log('Failed to get FCM token');
            }
        } catch (error) {
            console.log('Error fetching FCM token', error);
        }

        // Listen to whether the token changes
        return messaging().onTokenRefresh(token => {
            console.log('FCM Token Refreshed:', token);
            setFcmToken(token);
            apiMethods.notification.registerPushToken(token).catch(e => console.log(e));
        });
    };

    useEffect(() => {
        requestUserPermission();

        // Handle notifications when the app is in the foreground
        const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
            console.log('A new FCM message arrived (foreground)!', JSON.stringify(remoteMessage));
            setNotification(remoteMessage);
            // Optionally show local alert
            // Alert.alert(remoteMessage.notification?.title || '', remoteMessage.notification?.body || '');
        });

        // Handle notifications when the app is running in the background but opened by clicking on the notification
        const unsubscribeOnNotificationOpenedApp = messaging().onNotificationOpenedApp(remoteMessage => {
            console.log('Notification caused app to open from background state:', remoteMessage.notification);
            // Handle navigation
        });

        // Handle notifications when the app is opened from a quit state
        messaging()
            .getInitialNotification()
            .then(remoteMessage => {
                if (remoteMessage) {
                    console.log('Notification caused app to open from quit state:', remoteMessage.notification);
                    // Handle navigation
                }
            });

        return () => {
            unsubscribeOnMessage();
            unsubscribeOnNotificationOpenedApp();
        };
    }, []);

    return {
        expoPushToken: fcmToken, // Keep the same exported variable name to avoid breaking other components
        notification,
    };
};
