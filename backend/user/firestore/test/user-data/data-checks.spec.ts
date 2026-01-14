import * as firebase from '@firebase/testing';
import {authedApp, createDummyRuleUserData, projectId, rules, setupDb} from '../simulated-db';
import {aliceUid, bobUid, createDocUser, readDocUser, updateDocUser} from '../requestes';
import {createDummyScans} from '../../../../../shared-library/src/functions/test-utils/dummy-data/scan';
import {maxNumberOfScansForPro} from '../../../../../shared-library/src/scan/settings';
import {maxNumberOfPushIds} from '../../../../../shared-library/src/settings/user';
import {createArray} from '../../../../../shared-library/src/functions/general/array';
import {Timestamp, UserData} from '../../../../../shared-library/src/datatypes/user';
import {mapMsToTimestamp} from '../../../../../shared-library/src/functions/time/firestore-timestamp';

function aliceUpdateOwnUserData(userData: UserData): Promise<any> {
    const db = authedApp({uid: 'alice'});
    return createDocUser(db, 'alice', userData, {merge: false});
}

describe('Test check of content of user data', () => {

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

    describe('Timestamp', function () {

        it('should not update with timestamp different then now server timestamp (date)', async () => {
            const userData = createDummyRuleUserData();
            userData.lastUserActivity = new Date() as any as Timestamp;
            await firebase.assertFails(aliceUpdateOwnUserData(userData));
        });

        it('should not update with timestamp different then now server timestamp (timestamp)', async () => {
            const userData = createDummyRuleUserData();
            userData.lastUserActivity = mapMsToTimestamp(Date.now());
            await firebase.assertFails(aliceUpdateOwnUserData(userData));
        });
    });

    describe('Pro Version', function () {

        it('should allow user to write in pro attribute as long as no changes are made', async () => {
            const db = authedApp({uid: aliceUid});
            const user = createDummyRuleUserData();
            await firebase.assertSucceeds(updateDocUser(db, aliceUid, user));
        });

        it('should not allow user to write any changes in pro attribute (increase pro version)', async () => {
            const db = authedApp({uid: aliceUid});
            const user = createDummyRuleUserData();
            user.pro.useProVersionUntil += 1;
            await firebase.assertFails(updateDocUser(db, aliceUid, user));
        });

        it('should not allow user to write any changes in pro attribute (delete pro.hasCanceledProVersion)', async () => {
            const db = authedApp({uid: aliceUid});
            const user = createDummyRuleUserData();
            delete user.pro.hasCanceledProVersion;
            await firebase.assertFails(updateDocUser(db, aliceUid, user));
        });
    });

    describe('Feedback', function () {

        it('should allow user to read feedback attribute', async () => {
            const db = authedApp({uid: aliceUid});
            const doc: UserData = await readDocUser(db, aliceUid).then(d => d.data());
            expect(doc.feedback).toBeDefined();
        });

        it('should not allow user to write any changes in feedback attribute', async () => {
            const db = authedApp({uid: aliceUid});
            const user = createDummyRuleUserData();
            user.feedback += 1;
            await firebase.assertFails(updateDocUser(db, aliceUid, user));
        });

        it('should not allow user to create feedback attribute first time', async () => {
            const db = authedApp({uid: bobUid});
            const doc: UserData = await readDocUser(db, bobUid).then(d => d.data());
            expect(doc.feedback).toBeUndefined(); // other wise an update without "optional attirbutes" would just be an partial update
            doc.feedback = 42;
            await firebase.assertFails(updateDocUser(db, bobUid, doc));
        });
    });

    describe('Push Ids', function () {

        it(`should allow a maximal number of push ids of ${maxNumberOfPushIds}`, async () => {
            const userData = createDummyRuleUserData();
            userData.pushIds = createArray(maxNumberOfPushIds).map(() => 'miau');
            await firebase.assertSucceeds(aliceUpdateOwnUserData(userData));
        });

        it(`should not allow a number of push ids greater ${maxNumberOfPushIds}`, async () => {
            const userData = createDummyRuleUserData();
            userData.pushIds = createArray(maxNumberOfPushIds + 1).map(() => 'miau');
            await firebase.assertFails(aliceUpdateOwnUserData(userData));
        });
    });

    describe('Scans', function () {

        it(`should allow a maximal number of scans of ${maxNumberOfScansForPro}`, async () => {
            const userData = createDummyRuleUserData();
            userData.scans = createDummyScans(maxNumberOfScansForPro);
            await firebase.assertSucceeds(aliceUpdateOwnUserData(userData));
        });

        it(`should not allow a number of scans greater ${maxNumberOfScansForPro}`, async () => {
            const userData = createDummyRuleUserData();
            userData.scans = createDummyScans(maxNumberOfScansForPro + 1);
            await firebase.assertFails(aliceUpdateOwnUserData(userData));
        });
    });

    describe('Supported attributes', function () {

        it('should not allow user to create an entry with extra attributes', async () => {
            const userData = createDummyRuleUserData();
            (userData as any).someWeirdProp = 123;
            await firebase.assertFails(aliceUpdateOwnUserData(userData));
        });

        it('should not allow user to create an entry with attribute missing', async () => {
            const userData = createDummyRuleUserData();
            delete userData.scans;
            await firebase.assertFails(aliceUpdateOwnUserData(userData));
        });
    });
});





