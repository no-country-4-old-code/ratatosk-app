import {Meta} from '../../../../../../shared-library/src/datatypes/meta';

import {createCoinHistoryStorageSeed} from '../../test-utils/dummy-data/asset-specific/coin';
import {CoinHistoryStorage, UpdateTimestamp} from '../../../src/helper/interfaces';
import {createDummyMetaData} from '../../../../../../shared-library/src/functions/test-utils/dummy-data/meta';
import {
    readCoinBufferBucket,
    readCoinHistoryBucket,
    readGeckoCoinPageIndex,
    readUpdateTimestamp
} from '../../../src/helper/cloud-storage/read';
import {
    writeCoinBuffer,
    writeCoinHistoryCompact,
    writeGeckoCoinPageIndex,
    writeUpdateTimestamp
} from '../../../src/helper/cloud-storage/write';
import {useCloudStorageMock} from '../../test-utils/mocks/cloud-storage/use-cloud-storage-mock';
import {Bucket} from '../../../../../../shared-library/src/datatypes/data';
import {createBucket} from '../../../../../../shared-library/src/functions/general/types';
import {assetCoin} from '../../../../../../shared-library/src/asset/lookup-asset-factory';
import {AssetIdCoin} from '../../../../../../shared-library/src/asset/assets/coin/interfaces';

type BucketTest = Bucket<'coin', 'HISTORY'>;

describe('Test cloud storage read/ write of split storage', function () {

    beforeEach(function () {
        useCloudStorageMock();
    });

    function createDummyBucket(ids: AssetIdCoin[], seed: number): BucketTest {
        const meta = createDummyMetaData(seed * 1000);
        const storage = createCoinHistoryStorageSeed(ids, seed);
        return createBucket(meta, storage);
    }

    it('should read/write timestamp', async function () {
        const timestamp: UpdateTimestamp = {timestampMs: 1234, timestampMsRedundant: 5678};
        await writeUpdateTimestamp(timestamp);
        const respTimestamp = await readUpdateTimestamp();
        expect(respTimestamp).toEqual(timestamp);
    });

    it('should read/write gecko index', async function () {
        const idx = Math.random() * 1000;
        await writeGeckoCoinPageIndex(idx);
        const respIdx = await readGeckoCoinPageIndex();
        expect(respIdx).toEqual(idx);
    });

    describe('Test read coin history', function () {

        async function act(storage: Meta<CoinHistoryStorage>): Promise<void> {
            await writeCoinHistoryCompact(storage.meta, storage.payload);
            const result = await readCoinHistoryBucket();
            expect(result).toEqual(storage);
        }

        it('should return empty obj if no file exists', async function () {
            const result = await readCoinHistoryBucket();
            expect(result.payload).toEqual({});
        });

        it('should write and read file', async function () {
            const storage = createDummyBucket(assetCoin.getIds(), 24);
            await act(storage);
        });

        it('should not add ids even if some ids are missing', async function () {
            const storage = createDummyBucket(['id0', 'id12'], 24);
            await act(storage);
        });
    });

    describe('Test buffer and history independence', function () {

        it('should use separate files for buffer and history (no overwrite)', async function () {
            const history = createDummyBucket(['id0', 'id12'], 24);
            const buffer = createDummyBucket(assetCoin.getIds(), 12);
            await writeCoinHistoryCompact(history.meta, history.payload);
            await writeCoinBuffer(buffer.meta, buffer.payload);
            const resultHistory = await readCoinHistoryBucket();
            const resultBuffer = await readCoinBufferBucket();
            expect(resultHistory).toEqual(history);
            expect(resultBuffer).toEqual(buffer);
            expect(history).not.toEqual(buffer);
        });
    });
});