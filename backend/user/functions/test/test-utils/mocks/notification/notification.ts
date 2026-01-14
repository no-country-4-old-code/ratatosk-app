import {messaging} from 'firebase-admin/lib/messaging';
import MessagingDevicesResponse = messaging.MessagingDevicesResponse;
import MessagingOptions = messaging.MessagingOptions;
import MessagingPayload = messaging.MessagingPayload;


export class NotificationMessengerMock {

    // eslint-disable-next-line unused-imports/no-unused-vars-ts, @typescript-eslint/no-unused-vars
    sendToDevice(registrationToken: string | string[], payload: MessagingPayload, options?: MessagingOptions): Promise<MessagingDevicesResponse> {
        return new Promise((resolve) => resolve());
    }
}