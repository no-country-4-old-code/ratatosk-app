import {Scan, ScanNotification} from '../scan/interfaces';
import {UserData} from './user';

/*
Phantom-attributes are never set / used but they trigger a typescript compiler error if simply used as "normal" string etc.
This way it is ensured that special guard functions like compress/decompress are used.
 */


export type CompressedObj<T> = { [key in string]: T } | { __phantom__compressed_obj__: never };

export type CompressedAssetIds = string & { __phantom__compressed_asset_ids__: never };

export interface CompressedUserData extends Omit<UserData, 'scans'> {
    __phantom__compressed_user_data__: never;
    scans: CompressedScans;
}

export interface CompressedScan extends Omit<Scan, 'result' | 'notification' | 'preSelection'> {
    __phantom__compressed_scan__: never;
    result: CompressedAssetIds;
    notification: CompressedScanNotification;
    preSelection: CompressedPreSelectionBlueprint;
}

export type CompressedScans = { [id in string]: CompressedScan};

export type CompressedPreSelectionBlueprint =
    { [key in string]: any }
    | { __phantom__compressed_pre_selection__: never };

interface CompressedScanNotification extends Omit<ScanNotification<any>, 'lastNotified' | 'lastSeen'> {
    __phantom__compressed_scan_notification__: never;
    lastNotified: CompressedAssetIds;
    lastSeen: CompressedAssetIds;
}

export type CompressedHistory = CompressedObj<CompressedObj<number[]>> | { __phantom__compressed_history__: never };
export type CompressedSnapshot =
    CompressedObj<number | number[] | string>
    | { __phantom__compressed_snapshot__: never };
export type CompressedStorageSnapshot =
    CompressedObj<CompressedSnapshot>
    | { __phantom__compressed_storage_snapshot__: never };
