import {AssetType} from '../../../../../../../../shared-library/src/asset/interfaces-asset';
import {Scan, ScanNotification} from '../../../../../../../../shared-library/src/scan/interfaces';
import {AssetId} from '../../../../../../../../shared-library/src/datatypes/data';
import {getElementsWhichAreOnlyInFirstArray} from '../../../../../../../../shared-library/src/functions/general/array';

export function createNotificationMsg(scans: Scan[]): string {
    const messages = scans
        .map(scan => createNotificationMsgForSingleScan(scan.title, scan.notification, scan.result));
    return messages.join('\n');
}

// private

function createNotificationMsgForSingleScan<T extends AssetType>(title: string, notification: ScanNotification<T>, result: AssetId<T>[]): string {
    const added = getElementsWhichAreOnlyInFirstArray(result, notification.lastSeen);
    return `Scan "${title}" contain ${added.length} unseen assets !`;
}