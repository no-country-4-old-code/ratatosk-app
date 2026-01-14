import {CoinHistoryStorage} from './interfaces';
import {assetCoin} from '../../../../../shared-library/src/asset/lookup-asset-factory';
import {AssetIdCoin} from '../../../../../shared-library/src/asset/assets/coin/interfaces';
import {History} from '../../../../../shared-library/src/datatypes/data';


export function getIdsInitialised(history: CoinHistoryStorage): AssetIdCoin[] {
    return assetCoin.getIds().filter(id => isHistoryInitialised(history[id]));
}

export function isHistoryInitialised(history: History<'coin'>): boolean {
    let ret = false;
    if (history !== undefined) {
        ret = history.price['1D'].length > 0;
    }
    return ret;
}
