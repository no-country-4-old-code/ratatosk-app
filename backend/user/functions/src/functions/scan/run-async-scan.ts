import {RequestRunAsyncScan} from '../../../../../../shared-library/src/backend-interface/cloud-functions/interfaces';
import {runScans} from './helper/run-scans';
import {AssetDatabase} from './helper/interfaces';
import {readUserDataByToken} from './helper/read/user/read-user-data';
import {readDatabase} from './helper/read/database/read-database';
import {UserData} from '../../../../../../shared-library/src/datatypes/user';
import {MetaData} from '../../../../../../shared-library/src/datatypes/meta';
import {Request} from 'firebase-functions/lib/providers/https';
import {Scan} from '../../../../../../shared-library/src/scan/interfaces';
import {AssetId} from '../../../../../../shared-library/src/datatypes/data';
import {updateUser} from '../../helper/firestore/update';
import {firestoreApi} from '../../../../../shared-backend-library/src/firestore/lib/api';

interface Database {
    uid: string;
    user: UserData;
    meta: MetaData;
    database: AssetDatabase;
}

export async function runAsyncScan(idToken: string, isDemo: boolean): Promise<void> {
    const data = await readDataForAsyncScan(idToken, isDemo);
    const uncompressedIds = runScans(data.user.scans, data.database);
    return updateScansAndActivityOfUser(data.uid, data.user.scans, uncompressedIds, data.meta.timestampMs);
}

export function parseAsyncScanRequest(req: Request): RequestRunAsyncScan {
    return {token: req.query.token as string};
}

// private

export function readDataForAsyncScan(idToken: string, isDemo: boolean): Promise<Database> {
    return readUserDataByToken(idToken, isDemo).then(userInfo => {
        return readDatabase(userInfo.user.scans).then(database => {
            return {uid: userInfo.uid, user: userInfo.user, meta: database.coin.meta, database};
        });
    });
}

function updateScansAndActivityOfUser(uid: string, scans: Scan[], results: AssetId<any>[][], timestampDbInMs: number): Promise<void> {
    const updatedScans = scans.map((scan, idx) => {
        scan.result = results[idx];
        scan.timestampResultData = timestampDbInMs;
        return scan;
    });
    const payload: Partial<UserData> = {
        scans: updatedScans,
        lastUserActivity: firestoreApi.getCurrentTimestampAsFieldValue() // bootload -> next calculations are done via sync scan calculation
    };
    return updateUser(uid, payload);
}