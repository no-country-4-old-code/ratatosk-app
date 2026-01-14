import {lookupCoinInfo} from '../../../../../shared-library/src/asset/assets/coin/helper/lookup-coin-info-basic';
import {AssetIdCoin} from '../../../../../shared-library/src/asset/assets/coin/interfaces';

export function filterCoinIdsByTerm(ids: AssetIdCoin[], filterTerm: string): AssetIdCoin[] {
    return ids.filter(id => isTermInCoin(id, filterTerm));
}

// private

function isTermInCoin(id: AssetIdCoin, filterTerm: string): boolean {
    const info = lookupCoinInfo[id];
    const idTerms = [info.name, info.symbol].map(t => t.toLowerCase());
    return idTerms.some(coinTerm => coinTerm.toLowerCase().includes(filterTerm.toLowerCase()));
}
