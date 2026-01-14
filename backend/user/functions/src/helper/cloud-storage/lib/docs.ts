import {MetricHistory} from '../../../../../../../shared-library/src/datatypes/data';
import {AssetType} from '../../../../../../../shared-library/src/asset/interfaces-asset';

export type CloudStorageDir = 'history' | 'buffer';

export function getCloudDocSamples(dir: CloudStorageDir, asset: AssetType, metric: MetricHistory<'coin'>): string {
    return `private/${dir}/${asset}/${metric}.json`;
}

export function getCloudDocTimestampUpdate(): string {
    return 'private/updateTimestamp.json';
}

export function getCloudDocCoinGeckoPageIndex(): string {
    return 'private/other/coin/geckoPageIndex.json';
}

export function getCloudDocMetaData(dir: CloudStorageDir, asset: AssetType): string {
    return `private/${dir}/meta/${asset}MetaData.json`;
}
