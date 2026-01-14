import {messaging} from 'firebase-admin/lib/messaging';
import {notificationMessengerApi} from './api';
import MessagingPayload = messaging.MessagingPayload;

export function sendNotifications(pushIds: string[], payload: MessagingPayload): Promise<void> {
    const messenger = notificationMessengerApi.getNotificationMessenger();
    const promises = pushIds.map(id => {
        return messenger.sendToDevice(id, payload);
    });
    return Promise.all(promises).then();
}