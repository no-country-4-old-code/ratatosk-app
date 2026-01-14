import * as admin from 'firebase-admin';
import {FirebaseProjectName} from '../../../../../shared-library/src/datatypes/firebase-projects';
import {getExternalAppApi} from './get-external-app';

export const firestoreApi = {
    // could be mocked for test purpose
    getAuth: () => admin.auth(),
    getDb: () => admin.firestore(),
    getExternalDb: getExternalFirestore,
    requestVerifiedUserId: requestVerifiedUserId,
    getCurrentTimestampMs: getCurrentTimestampMs,
    getCurrentTimestampAsFieldValue: getCurrentTimestampAsFieldValue
};

// private

function getExternalFirestore(projectName: FirebaseProjectName): any {
    // ! If PROJECT A wants to read from bucket in PROJECT B we have to give the gservice account of PROJECT A the role
    // "Betrachter" in PROJECT B.
    // If PROJECT B is "schedule-user" and PROJECT A is playground-a8450e this means that
    // "playground-a8450e@appspot.gserviceaccount.com" with role "Cloud Datastore-Betrachter" is listed under
    // https://console.cloud.google.com/iam-admin/iam?folder=&hl=de&organizationId=&project=schedule-user
    const api = getExternalAppApi(projectName);
    return api.firestore(api);
}

function requestVerifiedUserId(idToken: string): Promise<string> {
    return admin.auth().verifyIdToken(idToken).then((decodedToken: admin.auth.DecodedIdToken) => decodedToken.uid);
}

function getCurrentTimestampMs(): number {
    return admin.firestore.Timestamp.now().toMillis();
}

function getCurrentTimestampAsFieldValue(): admin.firestore.FieldValue {
    return admin.firestore.FieldValue.serverTimestamp();
}
