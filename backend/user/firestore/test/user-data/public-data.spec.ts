import * as firebase from '@firebase/testing';
import {
    aliceUid,
    createDocHistory,
    createDocSnapshots,
    deleteDocHistory,
    deleteDocSnapshots,
    readDocHistory,
    readDocSnapshots,
    updateDocHistory
} from '../requestes';
import {authedApp, projectId, rules, setupDb} from '../simulated-db';
import {lookupAssetFactory} from '../../../../../shared-library/src/asset/lookup-asset-factory';
import {demoUID} from '../../../../../shared-library/src/settings/firebase-projects';


describe('Access to public data', () => {

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

    describe('Read', function () {

        it('should allow anyone to read public data (not auth)', async () => {
            const db = authedApp(null);
            await firebase.assertSucceeds(readDocSnapshots(db));
            await firebase.assertSucceeds(readDocHistory(db, 'bitcoin'));
        });

        it('should allow anyone to read public data (demo)', async () => {
            const db = authedApp({uid: demoUID});
            await firebase.assertSucceeds(readDocSnapshots(db));
            await firebase.assertSucceeds(readDocHistory(db, 'bitcoin'));
        });

        it('should allow anyone to read public data (authenticated)', async () => {
            const db = authedApp({uid: aliceUid});
            await firebase.assertSucceeds(readDocSnapshots(db));
            await firebase.assertSucceeds(readDocHistory(db, 'bitcoin'));
        });
    });

    describe('Create, Update, Delete', function () {
        const assetCoin = lookupAssetFactory['coin'];

        function createDummyCoinStorage() {
            return assetCoin.createDummyStorageSnapshot(assetCoin.getIds(), 0);
        }

        it('should allow no one to create, update nor delete public data (not auth)', async () => {
            const db = authedApp(null);
            await firebase.assertFails(createDocSnapshots(db, createDummyCoinStorage()));
            //await firebase.assertFails(updateDocSnapshots(db, createDummyCoinStorage())); // TODO: Why ??? Fix and uncomment
            await firebase.assertFails(deleteDocSnapshots(db));
            await firebase.assertFails(deleteDocHistory(db, 'bitcoin'));
        });

        it('should allow no one to create, update nor delete public data (demo)', async () => {
            const db = authedApp({uid: demoUID});
            await firebase.assertFails(createDocSnapshots(db, createDummyCoinStorage()));
            //await firebase.assertFails(updateDocSnapshots(db, createDummyCoinStorage())); // TODO: Why ??? Fix and uncomment
            await firebase.assertFails(deleteDocSnapshots(db));
            await firebase.assertFails(deleteDocHistory(db, 'bitcoin'));
        });

        it('should allow no one to create, update nor delete public data (auth)', async () => {
            const db = authedApp({uid: aliceUid});
            await firebase.assertFails(createDocSnapshots(db, createDummyCoinStorage()));
            await firebase.assertFails(createDocHistory(db, assetCoin.getIds()[0], assetCoin.createDummyHistory(42)));
            //await firebase.assertFails(updateDocSnapshots(db, createDummyCoinStorage())); // TODO: Why ??? Fix and uncomment
            await firebase.assertFails(updateDocHistory(db, assetCoin.getIds()[0], assetCoin.createDummyHistory(42)));
            await firebase.assertFails(deleteDocSnapshots(db));
            await firebase.assertFails(deleteDocHistory(db, 'bitcoin'));
        });
    });
});






