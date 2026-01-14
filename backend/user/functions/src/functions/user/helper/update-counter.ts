import {firestore} from 'firebase-admin/lib/firestore';
import {CountNumberOfDocs} from '../../../../../../shared-backend-library/src/firestore/interfaces';

export function updateCounter(doc: any, delta: number): Promise<void> {
    const count: CountNumberOfDocs = {numberOfDocs: firestore.FieldValue.increment(delta)};
    return doc.set(count, {merge: true});
}