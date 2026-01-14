import {useFirestoreMock} from '../../../../../shared-backend-library/src/test-utils/firestore-mock/use-firestore-mock';
import {getMockDatabaseStates, lookupIdsDatabaseState, lookupSetDatabaseState} from '../../test-utils/database-states';
import {disableGeckoTimeSleep} from '../../test-utils/mocks/gecko/spy-on-gecko';

import {useCloudStorageMock} from '../../test-utils/mocks/cloud-storage/use-cloud-storage-mock';
import {UserData} from '../../../../../../shared-library/src/datatypes/user';
import {
    createDummyConditionAlwaysFalse,
    createDummyConditionAlwaysTrue,
    createDummyConditionSpecific
} from '../../../../../../shared-library/src/functions/test-utils/dummy-data/condition';
import {writeUser} from '../../../src/helper/firestore/write';
import {createDummyUserData} from '../../../../../../shared-library/src/functions/test-utils/dummy-data/user';
import {ScopeInMin} from '../../../../../../shared-library/src/scan/indicator-functions/params/interfaces-params';
import {runAsyncScan} from '../../../src/functions/scan/run-async-scan';
import {readUser} from '../../../src/helper/firestore/read';
import {firestoreApi} from '../../../../../shared-backend-library/src/firestore/lib/api';
import {
    mapMsToTimestamp,
    mapTimestampToMs
} from '../../../../../../shared-library/src/functions/time/firestore-timestamp';
import {firestore} from 'firebase-admin/lib/firestore';
import {demoUID} from '../../../../../../shared-library/src/settings/firebase-projects';
import Timestamp = firestore.Timestamp;


describe('Test e2e async scan calculation for different database states', function () {
    let demo: UserData;

    function createDummyConditionAverageAlwaysTrue() {
        const params1 = {factor: 0.5, scope: 60 as ScopeInMin};
        const params2 = {factor: 1, scope: 60 as ScopeInMin};
        return createDummyConditionSpecific('average', params1, '<=', 'average', params2);
    }

    beforeEach(async function () {
        //disableConsoleLog();
        disableGeckoTimeSleep();
        useFirestoreMock();
        useCloudStorageMock();
        spyOn(firestoreApi, 'getCurrentTimestampMs').and.callFake(() => Date.now());
        spyOn(firestoreApi, 'getCurrentTimestampAsFieldValue').and.callFake(() => mapMsToTimestamp(Date.now()) as any);
        demo = createDummyUserData(3);
        demo.scans[0].conditions = [createDummyConditionAlwaysFalse()];
        demo.scans[1].conditions = [createDummyConditionAlwaysTrue()];
        demo.scans[2].conditions = [createDummyConditionAverageAlwaysTrue()];
        demo.lastUserActivity = mapMsToTimestamp(0);
        await writeUser(demoUID, demo);
    });

    describe('Search calculation should work with different database states', function () {

        getMockDatabaseStates().forEach(state => {
            const setUpDatabase = lookupSetDatabaseState[state];

            describe(`Test storage contain ${state} history`, function () {

                it('should update timestamps for scan calculation and last user activity in user data', async function () {
                    const timestamp = Math.random() * 10000;
                    await setUpDatabase(timestamp);
                    const userDataBefore = await readUser(demoUID);
                    const timestampBeforeInMs = mapTimestampToMs(userDataBefore.lastUserActivity as Timestamp);
                    await runAsyncScan(demoUID, true);
                    const userDataAfter = await readUser(demoUID);
                    const timestampAfterInMs = mapTimestampToMs(userDataAfter.lastUserActivity as Timestamp);
                    expect(timestampAfterInMs).toBeLessThanOrEqual(Date.now());
                    expect(timestampAfterInMs).toBeGreaterThanOrEqual(Date.now() - 1000);
                    expect(timestampAfterInMs).not.toEqual(timestampBeforeInMs);
                    userDataAfter.scans.forEach(scan => expect(scan.timestampResultData).toEqual(timestamp));
                    userDataAfter.scans.forEach((scan, idx) => expect(scan.timestampResultData).not.toEqual(userDataBefore.scans[idx].timestampResultData));
                });

                it('should calculate the correct ids for each scan', async function () {
                    const expectedIds = [[], lookupIdsDatabaseState[state], lookupIdsDatabaseState[state]];
                    if (state === 'two-with-nan') {
                        // in case of NaN the condition for the last coin is not full filled
                        const ids = lookupIdsDatabaseState[state].slice(0, lookupIdsDatabaseState[state].length - 1);
                        expectedIds[1] = ids;
                        expectedIds[2] = ids;
                    }
                    await setUpDatabase();
                    await runAsyncScan(demoUID, true);
                    const userData = await readUser(demoUID);
                    const ids = userData.scans.map(scan => scan.result);
                    expect(ids).toEqual([...expectedIds]);
                });
            });
        });
    });
});



