import {useFirestoreMock} from '../../../../shared-backend-library/src/test-utils/firestore-mock/use-firestore-mock';
import {
    getMockDatabaseStates,
    lookupIdsDatabaseState,
    lookupSetDatabaseState,
    MockDatabaseState
} from '../test-utils/database-states';
import {updateCoinDb} from '../../src/functions/update/coin/update-db';
import {
    disableGeckoTimeSleep,
    spyOnGeckoCoinAndReturnError,
    spyOnGeckoCoinAndReturnResponse,
    spyOnGeckoMarketsAndReturnError,
    spyOnGeckoMarketsAndReturnForIds,
    spyOnGeckoRangeAndReturnError,
    spyOnGeckoRangeAndReturnResponse
} from '../test-utils/mocks/gecko/spy-on-gecko';
import {disableConsoleLog} from '../test-utils/disable-console-log';
import {createInitialUserData} from '../../src/functions/user/helper/create-user';
import {useCloudStorageMock} from '../test-utils/mocks/cloud-storage/use-cloud-storage-mock';
import {writeUpdateTimestamp} from '../../src/helper/cloud-storage/write';
import {runAsyncScan} from '../../src/functions/scan/run-async-scan';
import {usePubSubMock} from '../test-utils/mocks/pub-sub/use-pub-sub-mock';
import {readUser} from '../../src/helper/firestore/read';
import {demoUID} from '../../../../../shared-library/src/settings/firebase-projects';

describe('Test e2e that scan calculation handle db-update results', function () {
    const numberOfScans = 0;

    beforeEach(async function () {
        disableConsoleLog();
        disableGeckoTimeSleep();
        useFirestoreMock();
        useCloudStorageMock();
        usePubSubMock();
        await writeUpdateTimestamp({timestampMs: 0, timestampMsRedundant: -1}); // invalid -> trigger update
        await createInitialUserData(demoUID);
    });

    getMockDatabaseStates().forEach((state: MockDatabaseState) => {
        const startIds = lookupIdsDatabaseState[state];
        const reducedIds = startIds.slice(0, startIds.length - 1);

        describe(`start with ${state} firestore and expect scan calculation not to fail`, function () {

            async function act(): Promise<void> {
                await lookupSetDatabaseState[state]();
                await updateCoinDb();
                await runAsyncScan('42', true);
                const userData = await readUser(demoUID);
                const ids = userData.scans.map(scan => scan.result);
                expect(ids.length).toEqual(numberOfScans);
            }

            it('should work if all gecko responses are valid', async function () {
                spyOnGeckoCoinAndReturnResponse();
                spyOnGeckoMarketsAndReturnForIds();
                spyOnGeckoRangeAndReturnResponse();
                await act();
            });

            it('should work if all gecko requests failed but not add the new id', async function () {
                spyOnGeckoCoinAndReturnError();
                spyOnGeckoMarketsAndReturnError();
                spyOnGeckoRangeAndReturnError();
                await act();
            });

            it('should work if gecko fetch market only contains some ids', async function () {
                spyOnGeckoCoinAndReturnResponse();
                spyOnGeckoMarketsAndReturnForIds(reducedIds);
                spyOnGeckoRangeAndReturnResponse();
                await act();
            });
        });
    });
});
