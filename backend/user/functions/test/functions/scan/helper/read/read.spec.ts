import {
    useFirestoreMock
} from '../../../../../../../shared-backend-library/src/test-utils/firestore-mock/use-firestore-mock';
import {lookupSetDatabaseState} from '../../../../test-utils/database-states';
import {writeUser} from '../../../../../src/helper/firestore/write';
import {createDummyUserData} from '../../../../../../../../shared-library/src/functions/test-utils/dummy-data/user';
import {spyOnGeckoRequestVerifiedUserId} from '../../../../test-utils/mocks/gecko/spy-on-gecko';
import {useCloudStorageMock} from '../../../../test-utils/mocks/cloud-storage/use-cloud-storage-mock';
import {disableConsoleLog} from '../../../../test-utils/disable-console-log';
import {readDataForAsyncScan} from '../../../../../src/functions/scan/run-async-scan';
import {readUserDataByIds} from '../../../../../src/functions/scan/helper/read/user/read-user-data';
import {demoUID} from '../../../../../../../../shared-library/src/settings/firebase-projects';

describe('Test read of user data for scan calculation', function () {
    const validToken = 'validToken';
    const invalidUID = 'invalid';
    const aliceUID = 'alice';
    const bobUID = 'bob';
    const aliceUser = createDummyUserData(6);
    const bobUser = createDummyUserData(3);
    const demoUser = createDummyUserData(1);


    beforeEach(async function () {
        disableConsoleLog();
        useFirestoreMock();
        useCloudStorageMock();
        await lookupSetDatabaseState['full']();
        await writeUser(demoUID, demoUser);
        await writeUser(aliceUID, aliceUser);
        await writeUser(bobUID, bobUser);
    });

    describe('Test read data for requested scan', function () {

        it('should return data for demo user if demo is set true without id check', async function () {
            const spy = spyOnGeckoRequestVerifiedUserId(invalidUID);
            const result = await readDataForAsyncScan(validToken, true);
            expect(result.user).toEqual(demoUser);
            expect(spy).toHaveBeenCalledTimes(0);
        });

        it('should return data for user if demo is set false and uid test passed', async function () {
            const spy = spyOnGeckoRequestVerifiedUserId(aliceUID);
            const result = await readDataForAsyncScan(validToken, false);
            expect(result.user).toEqual(aliceUser);
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should return data for demo if demo is set false and uid test passed', async function () {
            const spy = spyOnGeckoRequestVerifiedUserId(demoUID);
            const result = await readDataForAsyncScan(validToken, false);
            expect(result.user).toEqual(demoUser);
            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('should abort if uid test failed', async function () {
            const spy = spyOnGeckoRequestVerifiedUserId(invalidUID);
            let errCount = 0;
            await readDataForAsyncScan(validToken, false).then().catch(() => {
                errCount++;
            });
            expect(errCount).toEqual(1);
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('Test read data of multiple users', function () {

        it('should return empty array if no uid is given', async function () {
            const result = await readUserDataByIds([]);
            expect(result).toEqual([]);
        });

        it('should return user data if uids found', async function () {
            const result = await readUserDataByIds([aliceUID, bobUID]);
            expect(result).toEqual([aliceUser, bobUser]);
        });

        it('should handle not valid uids by simply skipping them', async function () {
            const result = await readUserDataByIds([aliceUID, invalidUID, bobUID]);
            expect(result).toEqual([aliceUser, bobUser]);
        });
    });
});
