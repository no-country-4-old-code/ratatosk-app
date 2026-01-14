import {hashFnv32a} from '../../../../../../shared-library/src/functions/hash';
import {
    FirebaseProjectName,
    FirebaseUserProjectName
} from '../../../../../../shared-library/src/datatypes/firebase-projects';
import {existsDocAssignedFirebaseProject} from '../../../../../shared-backend-library/src/firestore/exists';
import {readAssignedFirebaseProject} from '../../../../../shared-backend-library/src/firestore/read';
import {createInitialUserData} from './helper/create-user';
import {createInitialPortfolio} from './portfolio/create-portfolio';
import {mapToPromise} from '../../../../../../shared-library/src/functions/map-to-promise';
import {getKeysAs} from '../../../../../../shared-library/src/functions/general/object';
import {firebaseConfigurations} from '../../../../../../shared-library/src/settings/firebase-projects';
import {firestoreApi} from '../../../../../shared-backend-library/src/firestore/lib/api';

export async function handleUserAfterAuth(uid: string, email: string | undefined): Promise<void> {
    return isUserRegistered(email).then((isRegistered: boolean) => {
        if (isRegistered) {
            return initUser(uid);
        } else {
            console.warn('Delete hacky authenticated user with email ', email, 'and id ', uid);
            return deleteUser(uid);
        }
    });
}


// private

function isUserRegistered(email: string| undefined): Promise<boolean> {
    if (email !== undefined) {
        return checkIfUserIsRegistered(email);
    } else {
        return mapToPromise(false);
    }
}

function checkIfUserIsRegistered(email: string): Promise<boolean> {
    const ownProjectName = getOwnProjectName();
    const hash = hashFnv32a(email);
    return getUserProjectName(hash).then(userProjectName => userProjectName === ownProjectName && ownProjectName !== undefined);
}

function initUser(uid: string): Promise<void> {
    return createInitialUserData(uid)
        .then(() => createInitialPortfolio(uid));
}

function deleteUser(uid: string): Promise<void> {
    return firestoreApi.getAuth().deleteUser(uid);
}

function getOwnProjectName(): FirebaseProjectName | undefined {
    const projectId = process.env.GCLOUD_PROJECT;
    const supportedNames = getKeysAs<FirebaseProjectName>(firebaseConfigurations);
    const projectName = supportedNames.find(name => firebaseConfigurations[name].projectId === projectId);
    return projectName;
}

function getUserProjectName(hash: string): Promise<FirebaseUserProjectName | undefined> {
    return isRegisteredForApp(hash).then(isRegistered => {
        if (isRegistered) {
            return readAssignedFirebaseProject(hash);
        } else {
            return undefined;
        }
    });

}

function isRegisteredForApp(hash: string): Promise<boolean> {
    return existsDocAssignedFirebaseProject(hash);
}