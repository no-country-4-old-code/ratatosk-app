import {readCoinHistoryBucket} from '../../../../../helper/cloud-storage/read';
import {Bucket, HistoryWithId, Storage} from '../../../../../../../../../shared-library/src/datatypes/data';
import {CloudStorageHistoryPathInfo} from '../../../../../helper/get-history-dependency';
import {assetCoin} from '../../../../../../../../../shared-library/src/asset/lookup-asset-factory';
import {Meta} from '../../../../../../../../../shared-library/src/datatypes/meta';


export function readCoinDataBucket(requestedContent?: CloudStorageHistoryPathInfo[]): Promise<Meta<HistoryWithId<'coin'>[]>> {
    return readCoinHistoryBucket(requestedContent).then((bucket: Bucket<'coin', 'HISTORY'>) => {
        return {
            meta: bucket.meta,
            payload: mapHistory2WithId(bucket.payload)
        };
    });
}

// private CoinHistoryStorage

function mapHistory2WithId(storage: Storage<'coin', 'HISTORY'>): HistoryWithId<'coin'>[] {
    return assetCoin.getIdsInStorage(storage).map(id => {
        return {id, history: storage[id]};
    });
}
