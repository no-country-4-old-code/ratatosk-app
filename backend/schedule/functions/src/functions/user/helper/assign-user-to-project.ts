import {FirebaseUserProjectName} from '../../../../../../../shared-library/src/datatypes/firebase-projects';
import {ResponseAddNewUser} from '../../../../../../../shared-library/src/backend-interface/cloud-functions/interfaces';
import {hashFnv32a} from '../../../../../../../shared-library/src/functions/hash';
import {existsDocAssignedFirebaseProject} from '../../../../../../shared-backend-library/src/firestore/exists';
import {readAssignedFirebaseProject} from '../../../../../../shared-backend-library/src/firestore/read';
import {writeAssignedFirebaseProject} from '../../../helper/firestore/write';

export function assignUserToFirebaseProject(email: string, projectId: FirebaseUserProjectName): Promise<ResponseAddNewUser> {
    const hash = hashFnv32a(email);
    return isHashAlreadyAssigned(hash).then(isHashAssigned => {
            if (isHashAssigned) {
                return getProjectForHash(hash);
            } else {
                return assignHashToProject(hash, projectId);
            }})
        .then((database: FirebaseUserProjectName): ResponseAddNewUser => {
            return {success: true, project: database};
        });
}

function isHashAlreadyAssigned(hash: string): Promise<boolean> {
    return existsDocAssignedFirebaseProject(hash);
}

function getProjectForHash(hash: string): Promise<FirebaseUserProjectName> {
    return readAssignedFirebaseProject(hash);
}

function assignHashToProject(hash: string, projectId: FirebaseUserProjectName): Promise<FirebaseUserProjectName> {
    return writeAssignedFirebaseProject(hash, projectId).then(() => projectId);
}