import {firestoreApi} from '../../firestore/lib/api';
import {FirestoreMock} from './firestore';
import * as admin from 'firebase-admin';
import Firestore = admin.firestore.Firestore;

export function useFirestoreMock(): FirestoreMock {
    const mock = new FirestoreMock();
    spyOn(firestoreApi, 'getDb').and.returnValue(mock as any as Firestore);
    return mock;
}

export function useFirestoreMockExternalDb(): FirestoreMock {
    const mock = new FirestoreMock();
    spyOn(firestoreApi, 'getExternalDb').and.returnValue(mock as any as Firestore);
    return mock;
}
