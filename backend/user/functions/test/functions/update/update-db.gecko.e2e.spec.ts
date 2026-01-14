import {useFirestoreMock} from '../../../../../shared-backend-library/src/test-utils/firestore-mock/use-firestore-mock';


import {
    getMockDatabaseStates,
    lookupIdsDatabaseState,
    lookupSetDatabaseState,
    MockDatabaseState
} from '../../test-utils/database-states';
import {useCloudStorageMock} from '../../test-utils/mocks/cloud-storage/use-cloud-storage-mock';
import {readCoinBufferBucket, readCoinHistoryBucket} from '../../../src/helper/cloud-storage/read';
import {readStorageAllCoins, readStorageCoinHistory} from '../../test-utils/read-firestore';
import {updateCoinDb} from '../../../src/functions/update/coin/update-db';
import {
    disableGeckoTimeSleep,
    spyOnGeckoCoinAndReturnError,
    spyOnGeckoCoinAndReturnResponse,
    spyOnGeckoMarketsAndReturnError,
    spyOnGeckoMarketsAndReturnForIds,
    spyOnGeckoRangeAndReturnError,
    spyOnGeckoRangeAndReturnResponse
} from '../../test-utils/mocks/gecko/spy-on-gecko';

import {FirestoreMock} from '../../../../../shared-backend-library/src/test-utils/firestore-mock/firestore';
import {writeUpdateTimestamp} from '../../../src/helper/cloud-storage/write';
import {assetCoin} from '../../../../../../shared-library/src/asset/lookup-asset-factory';
import {AssetIdCoin} from '../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {usePubSubMock} from '../../test-utils/mocks/pub-sub/use-pub-sub-mock';

describe('Test e2e update database with different gecko responses', function () {
    type LookupExpectationAfterUpdate = { [state in MockDatabaseState]: AssetIdCoin[] }
    let spyC: jasmine.Spy, spyM: jasmine.Spy, spyR: jasmine.Spy;
    let mock: FirestoreMock;

    const lookupCoinIdsInFirestoreAfterRun: LookupExpectationAfterUpdate = {
        'empty': assetCoin.getIds().slice(0, 1),
        'one': assetCoin.getIds().slice(0, 2),
        'two-with-nan': assetCoin.getIds().slice(0, 3),
        'missing-attr': assetCoin.getIds().slice(0, 3),
        'one-missing': assetCoin.getIds(),
        'full': assetCoin.getIds()
    };

    beforeEach(async function () {
        mock = useFirestoreMock();
        useCloudStorageMock();
        await writeUpdateTimestamp({timestampMs: 0, timestampMsRedundant: -1}); // invalid -> trigger update
        disableGeckoTimeSleep();
        usePubSubMock();
        //disableConsoleLog();
    });

    async function expectToContainIds(ids: AssetIdCoin[], read: () => any): Promise<void> {
        const storage = await read();
        expect(Object.keys(storage.payload)).toEqual(ids);
    }

    async function expectStoragesToContainIds(ids: AssetIdCoin[]): Promise<void> {
        // id should be in all storages or in none
        await expectToContainIds(ids, readCoinHistoryBucket);
        await expectToContainIds(ids, readCoinBufferBucket);
        await expectToContainIds(ids, readStorageAllCoins);
        for (const id of ids) {
            const updatedCoinHistory = await readStorageCoinHistory(id);
            expect(updatedCoinHistory.payload.price['1Y'].length).toBeGreaterThan(0);
        }
        if (ids.length > 0) {
            const idsWithHistory = Object.keys(mock.db['public']['history']['coin']);
            expect(idsWithHistory).toEqual(ids);
        }
    }

    function expectToNotExceedGeckoCallLimit(): void {
        const numberOfGeckoCalls = spyC.calls.count() + spyM.calls.count() + spyR.calls.count();
        const maxCallsPerUpdate = 80; // real limit lays by 100 / minute
        expect(numberOfGeckoCalls).toBeLessThanOrEqual(maxCallsPerUpdate, `Too many gecko calls: ${numberOfGeckoCalls}`);
    }

    getMockDatabaseStates().forEach(state => {
        const startIds = lookupIdsDatabaseState[state];
        const reducedIds = startIds.slice(0, startIds.length - 1);
        const expectedIds = lookupCoinIdsInFirestoreAfterRun[state];

        describe(`start with ${state} firestore and expect storage to hold ${expectedIds.length} ids after run`, function () {

            async function act(ids = expectedIds) {
                await lookupSetDatabaseState[state]();
                await updateCoinDb();
                await expectStoragesToContainIds(ids);
                expectToNotExceedGeckoCallLimit();
            }

            it('should work if all gecko responses are valid', async function () {
                spyC = spyOnGeckoCoinAndReturnResponse();
                spyM = spyOnGeckoMarketsAndReturnForIds();
                spyR = spyOnGeckoRangeAndReturnResponse();
                await act();
            });

            it('should work if gecko fetch coin failed', async function () {
                spyC = spyOnGeckoCoinAndReturnError();
                spyM = spyOnGeckoMarketsAndReturnForIds();
                spyR = spyOnGeckoRangeAndReturnResponse();
                await act();
            });

            it('should work if gecko fetch market failed', async function () {
                spyC = spyOnGeckoCoinAndReturnResponse();
                spyM = spyOnGeckoMarketsAndReturnError();
                spyR = spyOnGeckoRangeAndReturnResponse();
                await act();
            });

            it('should work if gecko fetch range failed but not add the new id', async function () {
                spyC = spyOnGeckoCoinAndReturnResponse();
                spyM = spyOnGeckoMarketsAndReturnForIds();
                spyR = spyOnGeckoRangeAndReturnError();
                await act(startIds);
            });

            it('should work if all gecko requests failed but not add the new id', async function () {
                spyC = spyOnGeckoCoinAndReturnError();
                spyM = spyOnGeckoMarketsAndReturnError();
                spyR = spyOnGeckoRangeAndReturnError();
                await act(startIds);
            });

            it('should work if gecko fetch market only contains some ids', async function () {
                spyC = spyOnGeckoCoinAndReturnResponse();
                spyM = spyOnGeckoMarketsAndReturnForIds(reducedIds);
                spyR = spyOnGeckoRangeAndReturnResponse();
                await act();
            });

            it('should work if all gecko requests (except reduced market fetch) fails but not add new id', async function () {
                spyC = spyOnGeckoCoinAndReturnError();
                spyM = spyOnGeckoMarketsAndReturnForIds(reducedIds);
                spyR = spyOnGeckoRangeAndReturnError();
                await act(startIds);
            });
        });
    });
});
