import {useCloudStorageMock} from '../../../test-utils/mocks/cloud-storage/use-cloud-storage-mock';
import {Meta} from '../../../../../../../shared-library/src/datatypes/meta';
import {AssetIdCoin, MetricCoinHistory} from '../../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {CloudStorageBucketMock} from '../../../test-utils/mocks/cloud-storage/cloud-storage';
import {
    createCoinHistoryStorageEmpty,
    createCoinHistoryStorageSeed
} from '../../../test-utils/dummy-data/asset-specific/coin';
import {CoinHistoryStorage} from '../../../../src/helper/interfaces';
import {createDummyMetaData} from '../../../../../../../shared-library/src/functions/test-utils/dummy-data/meta';
import {writeCloudStorageSplit} from '../../../../src/helper/cloud-storage/lib/write-split';
import {readCloudStorageSplit} from '../../../../src/helper/cloud-storage/lib/read-split';
import {Bucket} from '../../../../../../../shared-library/src/datatypes/data';
import {createBucket} from '../../../../../../../shared-library/src/functions/general/types';
import {CloudStorageHistoryPathInfo} from '../../../../src/helper/get-history-dependency';
import {CloudStorageDir} from '../../../../src/helper/cloud-storage/lib/docs';
import {assetCoin} from '../../../../../../../shared-library/src/asset/lookup-asset-factory';
import {AssetType} from '../../../../../../../shared-library/src/asset/interfaces-asset';
import {createEmptyTimeSteps} from '../../../../../../../shared-library/src/functions/time/steps';

type BucketTest = Bucket<'coin', 'HISTORY'>;

describe('Test cloud storage read/ write of split storage', function () {
    const asset: AssetType = 'coin';
    let mock: CloudStorageBucketMock;

    beforeEach(function () {
        mock = useCloudStorageMock();
    });

    function createDummyBucket(ids: AssetIdCoin[], seed: number): BucketTest {
        const meta = createDummyMetaData(seed * 1000);
        const storage = createCoinHistoryStorageSeed(ids, seed);
        return createBucket(meta, storage);
    }

    describe('Test default write / read (read data from all files)', function () {
        const dir: CloudStorageDir = 'history';

        async function act(storage: Meta<CoinHistoryStorage>): Promise<void> {
            await writeCloudStorageSplit(storage.meta, storage.payload, dir);
            const result = await readCloudStorageSplit(dir);
            expect(result).toEqual(storage);
        }

        it('should return empty obj if no file exists', async function () {
            const result = await readCloudStorageSplit(dir);
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

        it('should add missing attributes with empty steps (or not add them add at all)', async function () {
            const rmvAttr: MetricCoinHistory = 'rank';
            const history = createDummyBucket(assetCoin.getIds(), 24);
            const expected = createDummyBucket(assetCoin.getIds(), 24);
            await writeCloudStorageSplit(history.meta, history.payload, dir);
            Object.keys(mock.storage).forEach(key => {
                if (key.includes(rmvAttr)) {
                    delete mock.storage[key];
                }
            });
            assetCoin.getIds().forEach(id => {
                expected.payload[id][rmvAttr] = createEmptyTimeSteps();
            });
            const result = await readCloudStorageSplit(dir);
            expect(result).toEqual(expected);
        });

        it('should use different files for different dirs (no overwrite)', async function () {
            const data = createDummyBucket(['id0', 'id12'], 24);
            const data2 = createDummyBucket(assetCoin.getIds(), 12);
            await writeCloudStorageSplit(data.meta, data.payload, 'buffer');
            await writeCloudStorageSplit(data2.meta, data2.payload, 'history');
            const result = await readCloudStorageSplit('buffer');
            const result2 = await readCloudStorageSplit('history');
            expect(result).toEqual(data);
            expect(result2).toEqual(data2);
            expect(result).not.toEqual(result2);
        });
    });

    describe('Test partial read (read data from only selected files)', function () {
        const dir: CloudStorageDir = 'history';
        let bucket: BucketTest, ids: AssetIdCoin[];

        beforeEach(async function () {
            ids = assetCoin.getIds();
            bucket = createDummyBucket(ids, 24);
            await writeCloudStorageSplit(bucket.meta, bucket.payload, dir);
        });

        it('should fill meta data even if no files selected for read', async function () {
            const result = await readCloudStorageSplit(dir, []);
            expect(result.meta).toBeDefined();
            expect(result.meta).toEqual(bucket.meta);
        });

        it('should return empty storage history for all coins as payload if no file selected', async function () {
            const storageEmpty = createCoinHistoryStorageEmpty(ids);
            const result = await readCloudStorageSplit(dir, []);
            expect(result.payload).toEqual(storageEmpty);
            expect(result.payload).not.toEqual(bucket.payload);
        });

        it('should fill obj with data of requested file (one file)', async function () {
            const files: CloudStorageHistoryPathInfo[] = [{metric: 'rank', asset}];
            const emptySteps = createEmptyTimeSteps();
            const result = await readCloudStorageSplit(dir, files);
            ids.forEach(id => {
                expect(result.payload[id].rank).toEqual(bucket.payload[id].rank);
            });
            ids.forEach(id => {
                expect(result.payload[id].price).toEqual(emptySteps);
                expect(result.payload[id].volume).toEqual(emptySteps);
            });
        });

        it('should fill obj with data of requested file (three files)', async function () {
            const files: CloudStorageHistoryPathInfo[] = [{metric: 'rank', asset}, {
                metric: 'volume',
                asset
            }, {metric: 'price', asset}];
            const emptySteps = createEmptyTimeSteps();
            const result = await readCloudStorageSplit(dir, files);
            ids.forEach(id => {
                expect(result.payload[id].rank).toEqual(bucket.payload[id].rank);
                expect(result.payload[id].volume).toEqual(bucket.payload[id].volume);
                expect(result.payload[id].price).toEqual(bucket.payload[id].price);
            });
            ids.forEach(id => {
                expect(result.payload[id].supply).toEqual(emptySteps);
                expect(result.payload[id].redditScore).toEqual(emptySteps);
                expect(result.payload[id].redditScore).toEqual(emptySteps);
            });
        });
    });
});
