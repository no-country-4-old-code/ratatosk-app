import {useFirestoreMock} from '../../../../../shared-backend-library/src/test-utils/firestore-mock/use-firestore-mock';
import {readCoinHistoryBucket} from '../../../src/helper/cloud-storage/read';
import {writeCoinSnapshots, writeUser} from '../../../src/helper/firestore/write';
import {mapToPromise} from '../../../../../../shared-library/src/functions/map-to-promise';
import {readUser} from '../../../src/helper/firestore/read';
import {createCoinHistoryStorageSeed} from '../../test-utils/dummy-data/asset-specific/coin';
import {firestoreApi} from '../../../../../shared-backend-library/src/firestore/lib/api';
import {createDummyMetaData} from '../../../../../../shared-library/src/functions/test-utils/dummy-data/meta';
import {deleteUser} from '../../../src/helper/firestore/delete';
import {createDummyUserData} from '../../../../../../shared-library/src/functions/test-utils/dummy-data/user';
import {assetCoin} from '../../../../../../shared-library/src/asset/lookup-asset-factory';
import {haveAsyncFunctionThrownError} from '../../../../../../shared-library/src/functions/test-utils/expect-async';

describe('Test firestore operations with fake database', function () {
    const meta = createDummyMetaData();

    beforeEach(function () {
        useFirestoreMock();
    });

    it('should read/write user', async function () {
        const user = createDummyUserData();
        await writeUser('1234', user);
        const respUser = await readUser('1234');
        expect(respUser).toEqual(user);
    });

    it('should delete user', async function () {
        const user = createDummyUserData();
        await writeUser('1234', user);
        await deleteUser('1234');
        const hasThrownError = await haveAsyncFunctionThrownError(() => readUser('1234'));
        expect(hasThrownError).toBeTruthy();
    });

    xit('should read/write history compact and snapshots', async function () {
        const history = createCoinHistoryStorageSeed(['miau'], 123);
        const coins = assetCoin.createDummyStorageSnapshot(['miau', 'wuff'], 0);
        await writeCoinSnapshots(meta, history, coins);
        const respHistory = await readCoinHistoryBucket();
        expect(respHistory.payload).toEqual(history);
    });

    it('should verify user id', async function () {
        spyOn(firestoreApi, 'requestVerifiedUserId').and.returnValue(mapToPromise('test2727'));
        const id = await firestoreApi.requestVerifiedUserId('1234');
        expect(id).toEqual('test2727');
    });

    it('should return timestamp', async function () {
        spyOn(firestoreApi, 'getCurrentTimestampMs').and.returnValue(145933);
        const time = firestoreApi.getCurrentTimestampMs();
        expect(time).toEqual(145933);
    });
});
