import {firestoreApi} from '../../../../../shared-backend-library/src/firestore/lib/api';
import {
    getDocAssignedFirebaseProject
} from '../../../../../../shared-library/src/backend-interface/firestore/documents';
import {FirebaseUserProjectName} from '../../../../../../shared-library/src/datatypes/firebase-projects';

export function writeAssignedFirebaseProject(hash: string, project: FirebaseUserProjectName): Promise<any> {
    const db = firestoreApi.getExternalDb('SCHEDULE');
    const doc = getDocAssignedFirebaseProject(db, hash);
    return doc.set({project});
}
