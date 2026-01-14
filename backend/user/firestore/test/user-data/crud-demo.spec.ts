import * as firebase from '@firebase/testing';
import {aliceUid, createDocUser, deleteDocUser, readDocUser, updateDocUser} from '../requestes';
import {authedApp, projectId, rules, setupDb} from '../simulated-db';
import {demoUID} from '../../../../../shared-library/src/settings/firebase-projects';

describe('User document crud-operations from non-authenticated user', () => {
    let db;

    beforeAll(async () => {
        await firebase.loadFirestoreRules({projectId, rules});
    });

    beforeEach(async () => {
        // Clear the database between tests
        await firebase.clearFirestoreData({projectId});
        await setupDb();
        db = authedApp(null);

    });

    afterAll(async () => {
        await Promise.all(firebase.apps().map(app => app.delete()));
    });

    describe('Create', function () {

        it('should not allow to create user data', async () => {
            await firebase.assertFails(createDocUser(db, 'xyz'));
            await firebase.assertFails(createDocUser(db, aliceUid));
            await firebase.assertFails(createDocUser(db, demoUID));
        });
    });

    describe('Read', function () {

        it('should only allow to read demo data', async () => {
            await firebase.assertFails(readDocUser(db, aliceUid));
            await firebase.assertSucceeds(readDocUser(db, demoUID));
        });

    });

    describe('Update', function () {

        it('should not be allowed to update/ write any data', async () => {
            await firebase.assertFails(updateDocUser(db, 'xyz'));
            await firebase.assertFails(updateDocUser(db, aliceUid));
            await firebase.assertFails(updateDocUser(db, demoUID));
        });
    });

    describe('Delete', function () {

        it('should not be allowed to delete any data', async () => {
            await firebase.assertFails(deleteDocUser(db, 'xyz'));
            await firebase.assertFails(deleteDocUser(db, aliceUid));
            await firebase.assertFails(deleteDocUser(db, demoUID));
        });
    });
});





