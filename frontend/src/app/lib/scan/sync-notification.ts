import {Scan, ScanNotification} from "@shared_library/scan/interfaces";
import {AssetType} from "@shared_library/asset/interfaces-asset";
import {AssetId} from "@shared_library/datatypes/data";
import {getElementsWhichAreOnlyInFirstArray} from "@shared_library/functions/general/array";

export function syncScansWithoutUnseenAssets<T extends Scan>(scans: T[]): T[] {
    /*
    We need to syncronize lastSeen and lastNotified to get new push notifications.
    Otherwise it stucks.
    (!) Scans which have "unseen" assets should not be syncronized.
     */
    scans.forEach(scan => {
        if (! doesContainUnseenAssets(scan.notification, scan.result)) {
            syncNotificationWithResult(scan);
        }
    });
    return scans;
}

export function syncNotificationWithResult(scan: Scan): Scan {
    scan.notification.lastSeen = scan.result;
    scan.notification.lastNotified = scan.result;
    return scan;
}

// private

function doesContainUnseenAssets<T extends AssetType>(notification: ScanNotification<T>, result: AssetId<T>[]): boolean {
    const unseen = getElementsWhichAreOnlyInFirstArray(result, notification.lastSeen);
    return unseen.length > 0;
}
