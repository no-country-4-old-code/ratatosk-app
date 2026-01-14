import {NotificationMessengerMock} from './notification';
import {notificationMessengerApi} from '../../../../src/helper/notification/api';
import {messaging} from 'firebase-admin/lib/messaging';

export function useNotificationMock(): NotificationMessengerMock {
    const mock = new NotificationMessengerMock();
    spyOn(notificationMessengerApi, 'getNotificationMessenger').and.returnValue(mock as any as messaging.Messaging);
    return mock;
}
