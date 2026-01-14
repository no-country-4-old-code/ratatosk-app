import {firebaseConfigurations, isFirebaseUserProject} from '../../settings/firebase-projects';
import {getKeysAs} from '../general/object';
import {FirebaseProjectName, FirebaseUserProjectName} from '../../datatypes/firebase-projects';

export function getFirebaseProjects(): FirebaseProjectName[] {
    return getKeysAs<FirebaseProjectName>(firebaseConfigurations);
}

export function getFirebaseUserProjects(): FirebaseUserProjectName[] {
    return getFirebaseProjects().filter(isFirebaseUserProject) as FirebaseUserProjectName[];
}