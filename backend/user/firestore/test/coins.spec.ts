import * as firebase from '@firebase/testing';
import {authedApp, projectId, rules} from './simulated-db';
import {getDocHistory, getDocSnapshots} from '../../../../shared-library/src/backend-interface/firestore/documents';


describe('Cloud Functions', () => {

    beforeAll(async () => {
        await firebase.loadFirestoreRules({projectId, rules});
    });

    beforeEach(async () => {
        // Clear the database between tests
        await firebase.clearFirestoreData({projectId});
    });

    afterAll(async () => {
        await Promise.all(firebase.apps().map(app => app.delete()));
    });

    describe('Coin history data should be readable for everyone but no one should modify it', function () {
        const coinId = '42';

        it('should allow everyone to read data', async () => {
            const db = authedApp(null);
            await firebase.assertSucceeds(getDocHistory(db, coinId).get());
        });

        it('should not allow anyone to write data', async () => {
            const db = authedApp({uid: 'alice'});
            await firebase.assertFails(getDocHistory(db, coinId).set({}));
        });

        it('should not allow anyone to delete data', async () => {
            const db = authedApp({uid: 'alice'});
            await firebase.assertFails(getDocHistory(db, coinId).delete());
        });
    });

    describe('Coin data should be readable for everyone but no one should modify it', function () {

        it('should allow everyone to read data', async () => {
            const db = authedApp(null);
            await firebase.assertSucceeds(getDocSnapshots(db).get());
        });

        it('should not allow anyone to write data', async () => {
            const db = authedApp({uid: 'alice'});
            await firebase.assertFails(getDocSnapshots(db).set({}));
        });

        it('should not allow anyone to delete data', async () => {
            const db = authedApp({uid: 'alice'});
            await firebase.assertFails(getDocSnapshots(db).delete());
        });
    });

});





