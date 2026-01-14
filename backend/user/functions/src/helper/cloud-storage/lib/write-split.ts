import {writeCloudStorage} from './write';
import {CloudStorageDir, getCloudDocMetaData, getCloudDocSamples} from './docs';
import {PartialStorage, SplittableCoinHistory, SplittableCoinStorage} from './interfaces';
import {MetricCoinHistory} from '../../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {MetaData} from '../../../../../../../shared-library/src/datatypes/meta';
import {assetCoin} from '../../../../../../../shared-library/src/asset/lookup-asset-factory';
import {AssetType} from '../../../../../../../shared-library/src/asset/interfaces-asset';
import {TimeSteps} from '../../../../../../../shared-library/src/datatypes/time';
import {createEmptyTimeSteps} from '../../../../../../../shared-library/src/functions/time/steps';


export function writeCloudStorageSplit(meta: MetaData, data: SplittableCoinStorage, dir: CloudStorageDir): Promise<void> {
    const promises: Promise<void>[] = [];
    promises.push(writeMetadata(meta, dir, 'coin'));
    promises.push(writeContent(data, dir, 'coin'));
    return Promise.all(promises).then();
}

// private

function writeMetadata(meta: MetaData, dir: CloudStorageDir, asset: AssetType): Promise<void> {
    return writeCloudStorage(getCloudDocMetaData(dir, asset), meta);
}

function writeContent(data: SplittableCoinStorage, dir: CloudStorageDir, asset: AssetType): Promise<void> {
    const promises: Promise<void>[] = [];
    assetCoin.getMetricsHistory().forEach(attr => {
        const part = createPart(data, attr);
        const cloudStoragePath = getCloudDocSamples(dir, asset, attr);
        promises.push(writeCloudStorage(cloudStoragePath, part));
    });
    return Promise.all(promises).then();
}

function createPart(data: SplittableCoinStorage, attr: MetricCoinHistory): PartialStorage {
    const part: PartialStorage = {};
    assetCoin.getIdsInStorage(data).forEach(id => {
        part[id] = mapError2EmptyArray(data[id], attr);
    });
    return part;
}

function mapError2EmptyArray(partialStorage: SplittableCoinHistory, attr: MetricCoinHistory): TimeSteps {
    let steps: TimeSteps = createEmptyTimeSteps();
    if (partialStorage[attr] !== undefined) {
        steps = partialStorage[attr];
    }
    return steps;
}
