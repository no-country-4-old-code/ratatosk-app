import {maxGeckoCoinPageSize} from '../../../../src/functions/update/coin/data/sample-coins';
import {disableConsoleLog} from '../../../test-utils/disable-console-log';
import {createDummyCoinSamples} from '../../../test-utils/dummy-data/samples';
import {useCloudStorageMock} from '../../../test-utils/mocks/cloud-storage/use-cloud-storage-mock';
import {lookupCoinInfo} from '../../../../../../../shared-library/src/asset/assets/coin/helper/lookup-coin-info-basic';
import {writeToStorage} from '../../../../src/functions/update/coin/data/write';

import {createCoinHistoryStorageSeed} from '../../../test-utils/dummy-data/asset-specific/coin';
import {
    createFakeLookupCoinInfo,
    setUpLookupCoinInfoMock
} from '../../../../../../../shared-library/src/functions/test-utils/lookup-coin-info-mocker/lookup-coin-info-mocker';
import {
    useFirestoreMock
} from '../../../../../../shared-backend-library/src/test-utils/firestore-mock/use-firestore-mock';
import {deepCopy} from '../../../../../../../shared-library/src/functions/general/object';
import {createDummyMetaData} from '../../../../../../../shared-library/src/functions/test-utils/dummy-data/meta';
import {readGeckoCoinPageIndex} from '../../../../src/helper/cloud-storage/read';
import {writeGeckoCoinPageIndex} from '../../../../src/helper/cloud-storage/write';
import {assetCoin} from '../../../../../../../shared-library/src/asset/lookup-asset-factory';

describe('Test write of database update for coins', function () {
    const backup = deepCopy(lookupCoinInfo);
    let numberOfSupportedCoins: number;

    beforeEach(function () {
        numberOfSupportedCoins = 3 * maxGeckoCoinPageSize;
        useFirestoreMock();
        useCloudStorageMock();
        disableConsoleLog();
    });

    afterEach(function () {
        setUpLookupCoinInfoMock(backup);
    });

    async function act(expectedPageIdx: number) {
        const fakeLookupCoinInfo = createFakeLookupCoinInfo(numberOfSupportedCoins);
        const ids = assetCoin.getIds();
        setUpLookupCoinInfoMock(fakeLookupCoinInfo);
        await writeToStorage(
            createDummyMetaData(),
            createCoinHistoryStorageSeed(ids),
            createDummyCoinSamples(ids),
            createCoinHistoryStorageSeed(ids));
        const storagePageIdx = await readGeckoCoinPageIndex();
        expect(storagePageIdx).toEqual(expectedPageIdx);
    }

    it('should increment page index (0 -> 1)', async function () {
        await writeGeckoCoinPageIndex(0);
        await act(1);
    });

    it('should increment page index (1 -> 2)', async function () {
        await writeGeckoCoinPageIndex(1);
        await act(2);
    });

    it('should protect index incrementation with modulo (2 -> 0)', async function () {
        await writeGeckoCoinPageIndex(2);
        await act(0);
    });

    it('should increment page index if additional page needed (2 -> 3)', async function () {
        numberOfSupportedCoins++;
        await writeGeckoCoinPageIndex(2);
        await act(3);
    });

    it('should leave page index zero if number if coins <= maxGeckoCoinPageSize (0 -> 0)', async function () {
        numberOfSupportedCoins = maxGeckoCoinPageSize;
        await writeGeckoCoinPageIndex(0);
        await act(0);
    });
});
