import {Scan, ScanNotification} from '../../../../../../../../shared-library/src/scan/interfaces';
import {AssetType} from '../../../../../../../../shared-library/src/asset/interfaces-asset';
import {AssetId} from '../../../../../../../../shared-library/src/datatypes/data';
import {getElementsWhichAreOnlyInFirstArray} from '../../../../../../../../shared-library/src/functions/general/array';


export function getScansToNotify(scans: Scan[]): Scan[] {
    return scans
        .filter(scan => scan.notification.isEnabled)
        .filter(scan => isScanTriggeringNotification(scan.notification, scan.result));
}

// private

function isScanTriggeringNotification<T extends AssetType>(notification: ScanNotification<T>, result: AssetId<T>[]): boolean {
    const containUnseen = doesContainUnseenAssets(notification, result);
    const containUnpronunced = doesContainUnpronouncedAssets(notification, result);
    return containUnseen && containUnpronunced;
}

function doesContainUnseenAssets<T extends AssetType>(notification: ScanNotification<T>, result: AssetId<T>[]): boolean {
    const unseen = getElementsWhichAreOnlyInFirstArray(result, notification.lastSeen);
    return unseen.length > 0;
}

function doesContainUnpronouncedAssets<T extends AssetType>(notification: ScanNotification<T>, result: AssetId<T>[]): boolean {
    const added = getElementsWhichAreOnlyInFirstArray(result, notification.lastNotified);
    return added.length > 0;
}