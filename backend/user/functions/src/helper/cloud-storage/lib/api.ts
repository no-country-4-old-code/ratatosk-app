import * as admin from 'firebase-admin';
import {Bucket} from '@google-cloud/storage';
import {FirebaseProjectName} from '../../../../../../../shared-library/src/datatypes/firebase-projects';
import {getExternalAppApi} from '../../../../../../shared-backend-library/src/firestore/lib/get-external-app';
import {firebaseConfigurations} from '../../../../../../../shared-library/src/settings/firebase-projects';

export const cloudStorageApi = {
    getBucket: getInternalBucket,
    getExternalBucket: getExternalBucket
};

// private

// TODO: Rmv export
export function getInternalBucket(): Bucket {
    const projectId = process.env.GCLOUD_PROJECT;
    return admin.storage().bucket(`gs://${projectId}.appspot.com`);
}

function getExternalBucket(projectName: FirebaseProjectName): Bucket {
    // ! If PROJECT A wants to read from bucket in PROJECT B we have to give the gservice account of PROJECT A the role
    // "Betrachter" in PROJECT B.
    // If PROJECT B is "schedule-user" and PROJECT A is playground-a8450e this means that
    // "playground-a8450e@appspot.gserviceaccount.com" with role "Cloud Datastore-Betrachter" is listed under
    // https://console.cloud.google.com/iam-admin/iam?folder=&hl=de&organizationId=&project=schedule-user
    const config = firebaseConfigurations[projectName];
    const api = getExternalAppApi(projectName);
    return api.storage(api).bucket(`gs://${config.projectId}.appspot.com`);
}