import {getCloudDocCoinGeckoPageIndex, getCloudDocTimestampUpdate} from './lib/docs';
import {writeCloudStorageSplit} from './lib/write-split';
import {MetaData} from '../../../../../../shared-library/src/datatypes/meta';
import {CoinHistoryStorage, UpdateTimestamp} from '../interfaces';
import {writeCloudStorage} from './lib/write';

export function writeCoinHistoryCompact(meta: MetaData, content: CoinHistoryStorage): Promise<void> {
    return writeCloudStorageSplit(meta, content, 'history');
}

export function writeCoinBuffer(meta: MetaData, content: CoinHistoryStorage): Promise<void> {
    return writeCloudStorageSplit(meta, content, 'buffer');
}

export function writeUpdateTimestamp(updateTimestamp: UpdateTimestamp): Promise<void> {
    const doc = getCloudDocTimestampUpdate();
    return writeCloudStorage(doc, updateTimestamp);
}

export function writeGeckoCoinPageIndex(pageIdx: number): Promise<void> {
    const doc = getCloudDocCoinGeckoPageIndex();
    return writeCloudStorage(doc, {pageIdx});
}
