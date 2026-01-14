import {firestoreApi} from './lib/api';
import {getDocAssignedFirebaseProject} from '../../../../shared-library/src/backend-interface/firestore/documents';
import {FirebaseUserProjectName} from '../../../../shared-library/src/datatypes/firebase-projects';
import {getDocNumberOfProUsers, getDocNumberOfUsers} from './documents';
import {CountNumberOfDocs} from './interfaces';

export function readAssignedFirebaseProject(hash: string): Promise<FirebaseUserProjectName> {
    const db = firestoreApi.getExternalDb('SCHEDULE');
    return readDoc(getDocAssignedFirebaseProject(db, hash)).then(container => container.project);
}

export function readNumberOfUsers(projectName: FirebaseUserProjectName): Promise<number> {
    const db = firestoreApi.getExternalDb(projectName);
    return readDoc(getDocNumberOfUsers(db)).then((counter: CountNumberOfDocs) => counter.numberOfDocs as number);
}

export function readNumberOfProUsers(projectName: FirebaseUserProjectName): Promise<number> {
    const db = firestoreApi.getExternalDb(projectName);
    return readDoc(getDocNumberOfProUsers(db)).then((counter: CountNumberOfDocs) => counter.numberOfDocs as number);
}

export function readDoc(doc: any): Promise<any> {
    // DocumentReference seems to be a mess as type
    return doc.get().then((data: any) => {
        return data.data();
    });
}
