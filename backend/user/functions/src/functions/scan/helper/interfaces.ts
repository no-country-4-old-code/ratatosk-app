import {AssetType} from '../../../../../../../shared-library/src/asset/interfaces-asset';
import {HistoryWithId} from '../../../../../../../shared-library/src/datatypes/data';
import {Meta} from '../../../../../../../shared-library/src/datatypes/meta';
import {UserData} from '../../../../../../../shared-library/src/datatypes/user';
import {Scan} from '../../../../../../../shared-library/src/scan/interfaces';

export type AssetDatabase = { [asset in AssetType]: Meta<HistoryWithId<asset>[]> };

export interface UserDataWithId {
    user: UserData;
    uid: string;
}

export interface NotificationProcessData {
    scans: Scan[]; // all scans even if not updated
    sendNotificationPromise: Promise<void>;
}
