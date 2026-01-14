import {UserData} from '../../../../../../shared-library/src/datatypes/user';
import {AssetDatabase} from './helper/interfaces';
import {readDatabase} from './helper/read/database/read-database';
import {Scan} from '../../../../../../shared-library/src/scan/interfaces';
import {readUserDataByIds} from './helper/read/user/read-user-data';
import {updateScans} from './helper/run-scans';
import {updateUser} from '../../helper/firestore/update';
import {processNotifications} from './helper/notification/handle-notifications';
import {firestoreApi} from '../../../../../shared-backend-library/src/firestore/lib/api';
import {firestore} from 'firebase-admin/lib/firestore';
import {mapTimestampToMs} from '../../../../../../shared-library/src/functions/time/firestore-timestamp';
import {isPro} from '../../../../../../shared-library/src/functions/is-pro';
import Timestamp = firestore.Timestamp;

export function runSyncScan(userIds: string[]): Promise<void> {
    // TODO: Read complete database and then split into multiple runScan-Promises
    // every promise should read user data, run scan, update user data (last point differs from async scan)
    // Add test first to check if function with where and orderBy works
    return readUserDataByIds(userIds).then(users => {
        const scans: Scan[] = users.flatMap(user => user.scans).filter(scan => scan !== undefined);
        return readDatabase(scans).then(db => {
            return runForAllUser(users, userIds, db);
        });
    });
}


// private

function runForAllUser(users: UserData[], uids: string[], db: AssetDatabase): Promise<void> {
    const promises = users
        .map((user, idx): [UserData, string] => [user, uids[idx]])
        .filter(([user]) => !areScansAlreadyCalculated(user.scans, db.coin.meta.timestampMs))
        .map(([user, uid]) => securedCallOfRunForSingleUser(user, uid, db));
    return Promise.all(promises).then();
}

function areScansAlreadyCalculated(scans: Scan[], timestamp: number): boolean {
    return scans.every(scan => scan.timestampResultData === timestamp);
}

function securedCallOfRunForSingleUser(user: UserData, uid: string, db: AssetDatabase) {
    // ensure that no broken user could harm other users
    let promise = new Promise((resolve) => resolve());
    try {
        promise = runPeriodicScanForSingleUser(user, uid, db).then().catch((reason => logError(uid, reason)));
    } catch (e) {
        logError(uid, e);
    }
    return promise;
}

export function runPeriodicScanForSingleUser(user: UserData, uid: string, db: AssetDatabase): Promise<void> {
    const promises: Promise<void>[] = [];
    const update: Partial<UserData> = {};

    update.scans = updateScans(user.scans, db);

    if (isTimestampOfLastUserActivityTooBig(user.lastUserActivity as Timestamp)) {
        update.lastUserActivity = firestoreApi.getCurrentTimestampAsFieldValue();
    }

    if (isPro(user)) {
        const data = processNotifications(update.scans, user.pushIds);
        update.scans = data.scans;
        promises.push(data.sendNotificationPromise);
    }

    promises.push(updateUser(uid, update));
    return Promise.all(promises).then();
}

function isTimestampOfLastUserActivityTooBig(lastUserActivity: Timestamp): boolean {
    const timestampMs = firestoreApi.getCurrentTimestampMs();
    const timestampMsLastUserActivity = mapTimestampToMs(lastUserActivity);
    return timestampMsLastUserActivity > timestampMs;
}

function logError(uid: string, reason: string): void {
    console.error(`Periodic scan failed for user with uid "${uid}" with reason: ${reason}`);
}