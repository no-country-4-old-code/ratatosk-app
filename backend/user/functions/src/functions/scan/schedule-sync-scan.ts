import {cluster2Groups} from '../../../../../../shared-library/src/functions/general/cluster-to-groups';
import {sleep} from '../../helper/gecko/lib/helper';
import {getCollectionUser} from '../../../../../../shared-library/src/backend-interface/firestore/documents';
import {firestoreApi} from '../../../../../shared-backend-library/src/firestore/lib/api';
import firebase from 'firebase/app';
import 'firebase/firestore';
import {triggerRunPeriodicScan} from '../../helper/pub-sub/send';
import {lastUserActivityExpireTimeInSec} from '../../../../../../shared-library/src/settings/user';
import QuerySnapshot = firebase.firestore.QuerySnapshot;


export async function scheduleSyncScan(groupSize: number, sleepTimeAfterEachTriggerMs = 10): Promise<void> {
    // TODO: If number of users > 2000 --> we need a new mechanism.  ?!? <-- is this still actuall ?
    //  E.g. start each run peridic with range parameters and it takes
    //  getCollectionUser(db).where('pro.useProVersionUntil', '>', timestamp).skipFirst(x).takeOnly(y)
    // max. 10MB per second , UserData Size ~ 10kB --> 1000 writes per second.
    const ids = await getUserIds();
    console.log('Get ids', ids, ' for ', Date.now());
    const groups = cluster2Groups(ids, groupSize); 	// optimize to prevent a "million" cloud functions
    for (const userIds of groups) {
        await triggerRunPeriodicScan(userIds).then(() => sleep(sleepTimeAfterEachTriggerMs));
    }
}

// private

function getUserIds(): Promise<string[]> {
    const promises: Promise<string[]>[] = [];
    promises.push(getProUserIds());
    promises.push(getActiveUserIds());
    return Promise.all(promises)
        .then(idsArray => idsArray.flatMap(array => array))
        .then(ids => ids); // TODO: Filter to contain only unique ids
}

function getProUserIds(): Promise<string[]> {
    const db = firestoreApi.getDb();
    const timestampMs = getCurrentTimestampInMs();
    const query = getCollectionUser(db)
        .where('pro.useProVersionUntil', '>', timestampMs);
    return query.get().then((snapshot: QuerySnapshot) => {
        return snapshot.docs.map(doc => doc.id);
    });
}

function getActiveUserIds(): Promise<string[]> {
    const db = firestoreApi.getDb();
    const timestampInSec = getCurrentTimestampInSeconds();
    const timestampThresholdInMs = (timestampInSec - lastUserActivityExpireTimeInSec) * 1000;
    // Does not allow multiple where -.- --> This lead to overlap between active and pro users which should be filter in sync rountine.
    // Do not add equal-where statements here which relay on dynamically data like timestamp or result !
    // TODO: Add filter of scan calculation in async routine (skip calculation is timestamp is already equal to db) +
    // TODO: Run PROs first and afterwards (or at least with 5 sec delay) all the active user stuff. (Dynamic based on pro / user relations)
    const query = getCollectionUser(db)
        .where('lastUserActivity', '>', new Date(timestampThresholdInMs));
    return query.get().then((snapshot: QuerySnapshot) => {
        return snapshot.docs.map(doc => doc.id);
    });
}

function getCurrentTimestampInSeconds() {
    return getCurrentTimestampInMs() / 1000;
}

function getCurrentTimestampInMs() {
    return firestoreApi.getCurrentTimestampMs();
}
