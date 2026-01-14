import {sendNotifications} from '../../../../helper/notification/send';
import {messaging} from 'firebase-admin/lib/messaging';
import {firestoreApi} from '../../../../../../../shared-backend-library/src/firestore/lib/api';
import {firebaseAppUrl} from '../../../../../../../../shared-library/src/settings/firebase-projects';
import MessagingPayload = messaging.MessagingPayload;

export function sendScanResultNotifications(notificationMsg: string, pushIds: string[], tag = 'ratatosk'): Promise<void> {
    // ! do not use the "notification"-category here because otherwise firebase sw worker won't receive it
    const payload: MessagingPayload = {
        data: {
            tag,
            body: notificationMsg,
            timestamp: `${firestoreApi.getCurrentTimestampMs()}`,
            url: firebaseAppUrl
        },
    };
    return sendNotifications(pushIds, payload);
}
