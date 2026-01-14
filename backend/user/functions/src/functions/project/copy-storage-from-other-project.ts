import * as admin from 'firebase-admin';
import {cloudStorageApi, getInternalBucket} from '../../helper/cloud-storage/lib/api';
import {readCoinBufferBucket, readCoinHistoryBucket} from '../../helper/cloud-storage/read';
import {getKeysAs} from '../../../../../../shared-library/src/functions/general/object';
import {writePrivate} from '../update/coin/data/write';

export async function copyStorageFromOtherProject(): Promise<void> {
    /* To access project A from project B you have give the service accout of B the role "Betrachter" for project A.
     * Go to https://console.cloud.google.com/iam-admin/iam and login with email accoring to A.
     * Add project-id-of-b@appspot.gserviceaccount.com with role "Betrachter" (and maybe also Cloud Datastore-Betrachter.. ?!).
     * After 5 minutes it should be public.
     * Remove permission after copy.
     */
    const configOldProject = {
        apiKey: 'AIzaSyD_4PVlpNmyaFeiak_LUJwBVXKiryd62f8',
        authDomain: 'playground-a8450e.firebaseapp.com',
        databaseURL: 'https://playground-a8450e.firebaseio.com',
        projectId: 'playground-a8450e',
        storageBucket: 'playground-a8450e.appspot.com',
        messagingSenderId: '1056082807893',
        appId: '1:1056082807893:web:7acc09967c11e2466058dc',
        measurementId: 'G-HMBJLDVLEG'
    };
    const api = admin.initializeApp(configOldProject, 'OldProject');
    const getOldBucket = () => api.storage().bucket(`gs://${configOldProject.projectId}.appspot.com`);
    cloudStorageApi.getBucket = getOldBucket;
    const history = await readCoinHistoryBucket();
    const buffer = await readCoinBufferBucket();
    const meta = history.meta;
    console.log('Get history and buffer from ', meta.timestampMs, getKeysAs(history.payload).length, getKeysAs(buffer.payload).length);
    cloudStorageApi.getBucket = () => getInternalBucket();
    await writePrivate(meta, history.payload, buffer.payload);
}
