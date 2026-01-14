import * as firebase from '@firebase/testing';
import * as fs from 'fs';
import {aliceUid, bobUid, createDocUser} from './requestes';
import {UserData} from '../../../../shared-library/src/datatypes/user';
import {
    createDummyScanAlwaysFalse,
    createDummyScanAlwaysTrue
} from '../../../../shared-library/src/functions/test-utils/dummy-data/scan';
import {createDummyUserData} from '../../../../shared-library/src/functions/test-utils/dummy-data/user';
import {demoUID} from '../../../../shared-library/src/settings/firebase-projects';


export type Firestore = firebase.firestore.Firestore;

export const projectId = 'firestore-emulator-example';

export const rules = fs.readFileSync('src/firestore.rules', 'utf8');

export function authedApp(auth): Firestore {
    return firebase.initializeTestApp({projectId: projectId, auth: auth}).firestore();
}

export function createDummyRuleUserData(withOptionalData=true): UserData {
    const user = createDummyUserData(3, Math.random(), withOptionalData);
    return {
        ...user,
        pro: {hasCanceledProVersion: true, useProVersionUntil: 0},
        settings: {currency: 'usd'},
        scans: [createDummyScanAlwaysTrue(), createDummyScanAlwaysFalse(), createDummyScanAlwaysTrue()],
        lastUserActivity: firebase.firestore.FieldValue.serverTimestamp(),
        pushIds: []
    };
}

export async function setupDb(): Promise<any> {
    const adminDb = getAdminApp();
    await createDocUser(adminDb, aliceUid, createDummyRuleUserData());
    await createDocUser(adminDb, bobUid, createDummyRuleUserData(false));
    await createDocUser(adminDb, demoUID, createDummyRuleUserData());
}

export function getAdminApp(): Firestore {
    return firebase.initializeAdminApp({projectId: projectId}).firestore();
}

