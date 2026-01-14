import * as admin from 'firebase-admin';

export const notificationMessengerApi = {
    getNotificationMessenger: () => admin.messaging()
};