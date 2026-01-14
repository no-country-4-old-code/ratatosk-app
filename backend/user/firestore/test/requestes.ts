import {createDummyRuleUserData, Firestore} from './simulated-db';
import {
    getDocHistory,
    getDocSnapshots,
    getDocUser
} from '../../../../shared-library/src/backend-interface/firestore/documents';
import {AssetType} from '../../../../shared-library/src/asset/interfaces-asset';
import {AssetId, History, Storage} from '../../../../shared-library/src/datatypes/data';
import {UserData} from '../../../../shared-library/src/datatypes/user';
import * as firebase from '@firebase/testing';
import {compressUser, decompressUser} from '../../../../shared-library/src/functions/compress/compress-user';

export const aliceUid = 'alice';
export const bobUid = 'bob';


export function createDocUser(db: Firestore, uid: string, data = createDummyRuleUserData(), options?: any): Promise<any> {
    const compressed = compressUser(data);
    return getDocUser(db, uid).set(compressed, options);
}

export function readDocUser(db: Firestore, uid: string): Promise<any> {
    return getDocUser(db, uid).get().then(doc => ({data: () => decompressUser(doc.data())}));
}

export function updateDocUser(db: Firestore, uid: string, data: Partial<UserData> = createDummyRuleUserData(false)): Promise<any> {
    const compressed = compressUser(data);
    return getDocUser(db, uid).update({...compressed, lastUserActivity: firebase.firestore.FieldValue.serverTimestamp()});
}

export function deleteDocUser(db: Firestore, uid: string): Promise<any> {
    return getDocUser(db, uid).delete();
}

// snapshots

export function createDocSnapshots(db: Firestore, storage: Storage<AssetType, 'SNAPSHOT'>): Promise<any> {
    return getDocSnapshots(db).set(storage);
}

export function readDocSnapshots(db: Firestore): Promise<Storage<AssetType, 'SNAPSHOT'>> {
    return getDocSnapshots(db).get();
}

export function updateDocSnapshots(db: Firestore, storage: Storage<AssetType, 'SNAPSHOT'>): Promise<any> {
    return getDocSnapshots(db).update(storage);
}

export function deleteDocSnapshots(db: Firestore): Promise<any> {
    return getDocSnapshots(db).delete();
}


// history

export function createDocHistory(db: Firestore, id: AssetId<'coin'>, storage: History<'coin'>): Promise<any> {
    return getDocHistory(db, id).set(storage);
}

export function readDocHistory(db: Firestore, id: AssetId<'coin'>): Promise<any> {
    return getDocHistory(db, id).get();
}

export function updateDocHistory(db: Firestore, id: AssetId<'coin'>, storage: History<'coin'>): Promise<any> {
    return getDocHistory(db, id).update(storage);
}

export function deleteDocHistory(db: Firestore, id: AssetId<'coin'>): Promise<any> {
    return getDocHistory(db, id).delete();
}
