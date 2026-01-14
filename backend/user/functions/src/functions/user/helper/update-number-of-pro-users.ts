import {firestoreApi} from '../../../../../../shared-backend-library/src/firestore/lib/api';
import {updateCounter} from './update-counter';
import {getDocNumberOfProUsers} from '../../../../../../shared-backend-library/src/firestore/documents';

export function updateNumberOfProUsers(delta: number): Promise<void> {
    const db = firestoreApi.getDb();
    const doc = getDocNumberOfProUsers(db);
    return updateCounter(doc, delta);
}
