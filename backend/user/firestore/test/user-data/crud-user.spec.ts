import * as firebase from '@firebase/testing';
import {aliceUid, bobUid, createDocUser, deleteDocUser, readDocUser, updateDocUser} from '../requestes';
import {authedApp, createDummyRuleUserData, projectId, rules, setupDb} from '../simulated-db';

import {UserData} from '../../../../../shared-library/src/datatypes/user';
import {mapMsToTimestamp} from '../../../../../shared-library/src/functions/time/firestore-timestamp';
import {demoUID} from '../../../../../shared-library/src/settings/firebase-projects';


describe('User document crud-operations from authenticated user', () => {

    beforeAll(async () => {
        await firebase.loadFirestoreRules({projectId, rules});
    });

    beforeEach(async () => {
        // Clear the database between tests
        await firebase.clearFirestoreData({projectId});
        await setupDb();
    });

    afterAll(async () => {
        await Promise.all(firebase.apps().map(app => app.delete()));
    });

    describe('Create', function () {
        it('should not allow new user to create user data', async () => {
            const db = authedApp({uid: 'newUser'});
            await firebase.assertFails(createDocUser(db, 'newUser'));
        });

        it('should not allow any user to create user data for other user', async () => {
            const db = authedApp({uid: aliceUid});
            await firebase.assertFails(createDocUser(db, bobUid));
            await firebase.assertFails(createDocUser(db, demoUID));
        });
    });

    describe('Read', function () {

        it('should only allow users to read own user data (alice)', async () => {
            const db = authedApp({uid: aliceUid});
            await firebase.assertSucceeds(readDocUser(db, aliceUid));
            await firebase.assertFails(readDocUser(db, bobUid));
            await firebase.assertFails(readDocUser(db, demoUID));
        });

        it('should only allow users to read own user data (bob)', async () => {
            const db = authedApp({uid: bobUid});
            await firebase.assertFails(readDocUser(db, aliceUid));
            await firebase.assertSucceeds(readDocUser(db, bobUid));
            await firebase.assertFails(readDocUser(db, demoUID));
        });

        it('should only allow users to read own user data (demo)', async () => {
            const db = authedApp({uid: demoUID});
            await firebase.assertFails(readDocUser(db, aliceUid));
            await firebase.assertFails(readDocUser(db, bobUid));
            await firebase.assertSucceeds(readDocUser(db, demoUID));
        });
    });

    describe('Update', function () {

        it('should only allow users to update their own user data (alice)', async () => {
            const db = authedApp({uid: aliceUid});
            await firebase.assertSucceeds(updateDocUser(db, aliceUid));
            await firebase.assertFails(updateDocUser(db, bobUid));
            await firebase.assertFails(updateDocUser(db, demoUID));
        });

        it('should only allow users to update their own user data (bob)', async () => {
            const db = authedApp({uid: bobUid});
            await firebase.assertFails(updateDocUser(db, aliceUid));
            await firebase.assertSucceeds(updateDocUser(db, bobUid));
            await firebase.assertFails(updateDocUser(db, demoUID));
        });

        it('should only allow users to update their own user data (demo)', async () => {
            const db = authedApp({uid: demoUID});
            await firebase.assertFails(updateDocUser(db, aliceUid));
            await firebase.assertFails(updateDocUser(db, bobUid));
            await firebase.assertSucceeds(updateDocUser(db, demoUID));
        });

        it('should allow users to do a partial update', async () => {
            const db = authedApp({uid: aliceUid});
            const user: Partial<UserData> = {lastUserActivity: mapMsToTimestamp(123),};
            await firebase.assertSucceeds(updateDocUser(db, aliceUid, user));
        });

        // TODO: Enable if we have optional attributes which are not readonly
        xdescribe('optional attributes', function () {

            it('should allow users to update wihtout optional attributes', async () => {
                const db = authedApp({uid: bobUid});
                const doc: UserData = await readDocUser(db, bobUid).then(d => d.data());
                expect(doc.feedback).toBeUndefined(); // other wise an update without "optional attirbutes" would just be an partial update
                await firebase.assertSucceeds(updateDocUser(db, bobUid, createDummyRuleUserData(false)));
            });

            it('should allow users to update optional attributes first time', async () => {
                const db = authedApp({uid: bobUid});
                const doc: UserData = await readDocUser(db, bobUid).then(d => d.data());
                expect(doc.feedback).toBeUndefined();
                await firebase.assertSucceeds(updateDocUser(db, bobUid, createDummyRuleUserData(true)));
            });

            it('should allow users to overwrite optional attributes', async () => {
                const db = authedApp({uid: aliceUid});
                const doc: UserData = await readDocUser(db, aliceUid).then(d => d.data());
                doc.feedback += 42;
                expect(doc.feedback).toBeDefined();
                await firebase.assertSucceeds(updateDocUser(db, aliceUid,  {...doc}));
            });
        });

    });

    describe('Delete', function () {

        it('should not let any user delete any user data', async () => {
            const db = authedApp({uid: aliceUid});
            await firebase.assertFails(deleteDocUser(db, aliceUid));
            await firebase.assertFails(deleteDocUser(db, bobUid));
            await firebase.assertFails(deleteDocUser(db, demoUID));
        });
    });

});






