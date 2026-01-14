import {UserData} from '../../../../../../../../../shared-library/src/datatypes/user';
import {readUser} from '../../../../../helper/firestore/read';
import {firestoreApi} from '../../../../../../../../shared-backend-library/src/firestore/lib/api';
import {UserDataWithId} from '../../interfaces';
import {demoUID} from '../../../../../../../../../shared-library/src/settings/firebase-projects';

export function readUserDataByToken(idToken: string, isDemo: boolean): Promise<UserDataWithId> {
    return resolveUserId(idToken, isDemo).then(uid => {
        return readUser(uid).then(user => ({user, uid}));
    });
}

export function readUserDataByIds(userIds: string[]): Promise<UserData[]> {
    const promises = userIds.flatMap(securedReadUser);
    return Promise.all(promises).then(data => data.flatMap(d => d));
}

// private

function resolveUserId(idToken: string, isDemo: boolean): Promise<string> {
    if (isDemo) {
        return new Promise((resolve) => resolve(demoUID));
    } else {
        return firestoreApi.requestVerifiedUserId(idToken);
    }
}

function securedReadUser(uid: string): Promise<UserData[]> {
    // ensure that no broken uid could harm read of other users
    let promise: Promise<UserData[]> = new Promise((resolve) => resolve([]));
    try {
        promise = readUserById(uid);
    } catch (e) {
        logError(uid, e);
    }
    return promise;
}

function readUserById(uid: string): Promise<UserData[]> {
    return readUser(uid)
        .then(user => [user])
        .catch(reason => {
            logError(uid, reason);
            return [];
        });
}

function logError(uid: string, reason: string): void {
    console.log(`Could not read user data of id ${uid} because of ${reason}`);
}