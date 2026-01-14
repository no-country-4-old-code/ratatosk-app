import {firestore} from 'firebase-admin/lib/firestore';
import {firestoreApi} from '../../../../../shared-backend-library/src/firestore/lib/api';
import {
    getCollectionNumberOfUsersDebounceDecrement,
    getCollectionNumberOfUsersDebounceIncrement
} from '../../helper/firestore/documents';
import {CountDebounceDoc} from './helper/interfaces';
import {updateCounter} from './helper/update-counter';
import {getDocNumberOfUsers} from '../../../../../shared-backend-library/src/firestore/documents';
import GrpcStatus = firestore.GrpcStatus;


export async function updateNumberOfUsers(eventId: string, delta: number) {
    const db = firestoreApi.getDb();
    try {
        const collectionDebounce = getDebounceCollection(db, delta);
        await createDebounceDoc(collectionDebounce, eventId);
        await updateCountOfUserDocuments(db, delta);
        await triggerCleanupOnRandom(db, collectionDebounce);
    } catch (error) {
        handleError(error);
    }
}

// private

function getDebounceCollection(db: any, delta: number): any {
    if (delta > 0) {
        return getCollectionNumberOfUsersDebounceIncrement(db);
    } else {
        return getCollectionNumberOfUsersDebounceDecrement(db);
    }
}

function updateCountOfUserDocuments(db: any, delta: number): Promise<void> {
    const doc = getDocNumberOfUsers(db);
    return updateCounter(doc, delta);
}

async function triggerCleanupOnRandom(db: any, collectionDebounce: any): Promise<void> {
    const probability = 1.0 / 200;
    if (Math.random() < probability) {
        await cleanup(db, collectionDebounce);
    }
}

function createDebounceDoc(collection: any, eventId: string): Promise<void> {
    // This will throw error GrpcStatus.ALREADY_EXISTS if document already exist
    // This count events are needed because firestore document triggers could fire multiple times.
    // We need this ugly counter document workaround to debounce the increase / decrease of the counter.
    const doc: CountDebounceDoc = {createdAt: firestore.FieldValue.serverTimestamp()};
    return collection.doc(eventId).create(doc);
}

function handleError(error: any): void {
    if (error.code === GrpcStatus.ALREADY_EXISTS) {
        console.log('Duplicated event trigger!');
    } else {
        throw error;
    }
}

function cleanup(db: any, collectionDebounce: any): Promise<void> {
    const maxNumberOfDocs = 400;
    const expireDate = new Date(Date.now() - 1000 * 60 * 10);
    const batch = db.batch();

    const pastEvents = collectionDebounce
        .orderBy('createdAt', 'asc')
        .where('createdAt', '<', expireDate)
        .limit(maxNumberOfDocs)
        .get();

    pastEvents.forEach((event: any) => batch.delete(event.ref));

    return batch.commit();
}
