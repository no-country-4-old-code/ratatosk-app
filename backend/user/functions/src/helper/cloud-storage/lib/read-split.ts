import {readCloudStorage} from './read';
import {CloudStorageDir, getCloudDocMetaData, getCloudDocSamples} from './docs';
import {PartialStorage, SplittableCoinBucket, SplittableCoinStorage} from './interfaces';
import {Meta, MetaData} from '../../../../../../../shared-library/src/datatypes/meta';
import {AssetIdCoin, MetricCoinHistory} from '../../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {createCoinHistoryStorageEmpty} from '../../../../test/test-utils/dummy-data/asset-specific/coin';
import {Storage} from '../../../../../../../shared-library/src/datatypes/data';
import {createBucket} from '../../../../../../../shared-library/src/functions/general/types';
import {CloudStorageHistoryPathInfo} from '../../get-history-dependency';
import {assetCoin} from '../../../../../../../shared-library/src/asset/lookup-asset-factory';
import {AssetType} from '../../../../../../../shared-library/src/asset/interfaces-asset';

type PartialHistory = { [id in AssetIdCoin]?: number[] };
type ShouldBeReadFunction = (attr: MetricCoinHistory, asset: AssetType) => boolean

export function readCloudStorageSplit(dir: CloudStorageDir, files?: CloudStorageHistoryPathInfo[]): Promise<Meta<SplittableCoinStorage>> {
    return getIdsFromCloud(dir, 'coin').then(ids => {
        const data = init(ids);
        return read(dir, data, 'coin', files);
    });
}

// private

function init(ids: AssetIdCoin[]): SplittableCoinBucket {
    const meta = undefined as any as MetaData; // should be overwrite (otherwise it should crash)
    const payload = createCoinHistoryStorageEmpty(ids);
    return createBucket(meta, payload);
}

function read(dir: CloudStorageDir, data: Meta<SplittableCoinStorage>, asset: AssetType, files?: CloudStorageHistoryPathInfo[]): Promise<Meta<SplittableCoinStorage>> {
    const promises: Promise<void>[] = [];
    promises.push(readMeta(dir, data, asset));
    promises.push(readContent(dir, data, asset, files));
    return Promise.all(promises).then(() => data);
}

function readMeta(dir: CloudStorageDir, data: Meta<SplittableCoinStorage>, asset: AssetType): Promise<void> {
    const path = getCloudDocMetaData(dir, asset);
    return readCloudStorage(path)
        .then(meta => {
            data.meta = meta;
        })
        .catch(reason => console.error('Error during read of meta from cloud storage', reason, path));
}

function readContent(dir: CloudStorageDir, data: Meta<SplittableCoinStorage>, asset: AssetType, files?: CloudStorageHistoryPathInfo[]): Promise<void> {
    const promises: Promise<void>[] = [];
    const shouldBeRead = buildShouldBeReadFunction(files);
    assetCoin.getMetricsHistory().forEach(attr => {
        if (shouldBeRead(attr, asset)) {
            promises.push(readPartOfContent(dir, attr, asset, data));
        }
    });
    return Promise.all(promises).then();
}

function buildShouldBeReadFunction(filesToRead?: CloudStorageHistoryPathInfo[]): ShouldBeReadFunction {
    let func: ShouldBeReadFunction = () => true;
    if (filesToRead !== undefined) {
        func = (attr, asset) => filesToRead.some(info => info.metric === attr && info.asset === asset);
    }
    return func;
}

function readPartOfContent(dir: CloudStorageDir, attr: MetricCoinHistory, asset: AssetType, data: Meta<SplittableCoinStorage>): Promise<void> {
    const cloudStoragePath = getCloudDocSamples(dir, asset, attr);
    return readCloudStorage(cloudStoragePath)
        .then(partial => updateDataWithPart(partial, data, attr))
        .catch(reason => console.error('Error during read content from cloud storage: ', reason, cloudStoragePath));
}

function updateDataWithPart(partial: PartialStorage, data: Meta<SplittableCoinStorage>, attr: MetricCoinHistory): void {
    assetCoin.getIdsInStorage(partial as any as Storage<'coin', any>).forEach(id => {
        data.payload[id][attr] = partial[id];
    });
}

function getIdsFromCloud(dir: CloudStorageDir, asset: AssetType): Promise<AssetIdCoin[]> {
    const cloudStoragePath = getCloudDocSamples(dir, asset, 'price');
    return readCloudStorage(cloudStoragePath).then((storage: PartialHistory) => assetCoin.getIdsInStorage(storage as any as Storage<'coin', any>)).catch(reason => {
        console.error('Error during initial read from cloud storage to receive coin ids', reason);
        return [];
    });
}
