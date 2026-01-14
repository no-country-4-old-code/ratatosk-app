import {firestoreApi} from './lib/api';
import {getDocAssignedFirebaseProject} from '../../../../shared-library/src/backend-interface/firestore/documents';

export function existsDocAssignedFirebaseProject(hash: string): Promise<boolean> {
    const db = firestoreApi.getExternalDb('SCHEDULE');
    return existsDoc(getDocAssignedFirebaseProject(db, hash));
}


// private

function existsDoc(doc: any): Promise<boolean> {
    // DocumentReference seems to be a mess as type
    return doc.get().then((data: any) => {
        return data.exists;
    });
}
