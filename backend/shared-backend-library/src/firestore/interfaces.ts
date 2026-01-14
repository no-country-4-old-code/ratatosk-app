import * as admin from 'firebase-admin';

export interface CountNumberOfDocs {
    numberOfDocs: admin.firestore.FieldValue | number;
}