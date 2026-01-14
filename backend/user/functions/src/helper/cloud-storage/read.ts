import {getCloudDocCoinGeckoPageIndex, getCloudDocTimestampUpdate} from './lib/docs';
import {readCloudStorageSplit} from './lib/read-split';
import {UpdateTimestamp} from '../interfaces';
import {readCloudStorage} from './lib/read';
import {CloudStorageHistoryPathInfo} from '../get-history-dependency';
import {Bucket} from '../../../../../../shared-library/src/datatypes/data';


export function readCoinHistoryBucket(requestedContent?: CloudStorageHistoryPathInfo[]): Promise<Bucket<'coin', 'HISTORY'>> {
    return readCloudStorageSplit('history', requestedContent);
}

export function readCoinBufferBucket(requestedContent?: CloudStorageHistoryPathInfo[]): Promise<Bucket<'coin', 'HISTORY'>> {
    return readCloudStorageSplit('buffer', requestedContent);
}

export function readUpdateTimestamp(): Promise<UpdateTimestamp> {
    const doc = getCloudDocTimestampUpdate();
    return readCloudStorage(doc)
        .catch((err): UpdateTimestamp => {
            console.error('Error: Could not read update timestamp. Return corrupted timestamp instead (trigger update). ', err);
            return {timestampMsRedundant: 0, timestampMs: -1};
        });
}

export function readGeckoCoinPageIndex(): Promise<number> {
    const doc = getCloudDocCoinGeckoPageIndex();
    return readCloudStorage(doc)
        .then(idxObj => idxObj.pageIdx)
        .catch(err => {
            console.error('Error: Could not read gecko coin index. Return 0 instead. ', err);
            return 0;
        });
}
