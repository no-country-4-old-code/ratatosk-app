import {FirebaseProjectName} from '../../../../../shared-library/src/datatypes/firebase-projects';
import * as admin from 'firebase-admin';
import {firebaseConfigurations} from '../../../../../shared-library/src/settings/firebase-projects';


export function getExternalAppApi(projectName: FirebaseProjectName) {
    const projectConfig = firebaseConfigurations[projectName];
    let api: any;
    try {
        api = admin.app(projectName);
    } catch (e) {
        api = admin.initializeApp(projectConfig, projectName);
    }
    return api;
}