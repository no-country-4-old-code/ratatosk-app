import {CoinHistoryStorage} from '../../../../src/helper/interfaces';
import {assetCoin} from '../../../../../../../shared-library/src/asset/lookup-asset-factory';
import {AssetIdCoin} from '../../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {createForEach} from '../../../../../../../shared-library/src/functions/general/for-each';

export function createCoinHistoryStorageEmpty(ids: AssetIdCoin[]): CoinHistoryStorage {
    return createForEach(ids, () => assetCoin.createEmptyHistory());
}

export function createCoinHistoryStorageSeed(ids: AssetIdCoin[], seed = 0): CoinHistoryStorage {
    return createForEach(ids, (id, idx) => assetCoin.createDummyHistory(idx + seed));
}
