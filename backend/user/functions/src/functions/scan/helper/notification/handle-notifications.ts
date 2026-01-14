import {NotificationProcessData} from '../interfaces';
import {createNotificationMsg} from './create-notification-msg';
import {sendScanResultNotifications} from './send-notifications';
import {getScansToNotify} from './get-scans-to-notify';
import {Scan} from '../../../../../../../../shared-library/src/scan/interfaces';

export function processNotifications(scans: Scan[], pushIds: string[]): NotificationProcessData {
    const data = createInitialProcessData(scans);
    const scansToBeNotified = getScansToNotify(data.scans);

    if (scansToBeNotified.length > 0 && pushIds.length > 0) {
        const notificationMsg = createNotificationMsg(scansToBeNotified);
        data.sendNotificationPromise = sendScanResultNotifications(notificationMsg, pushIds);
        updateScansLastNotified(scansToBeNotified);  // done via evil reference
    }

    return data;
}


// private


function createInitialProcessData(scans: Scan[]): NotificationProcessData {
    return {
        scans: [...scans],
        sendNotificationPromise: new Promise((resolve) => resolve())
    };
}

function updateScansLastNotified(scans: Scan[]): Scan[] {
    return scans.map(scan => {
        const copy = {...scan};
        copy.notification.lastNotified = copy.result;
        return copy;
    });
}