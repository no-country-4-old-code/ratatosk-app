import {GeckoMarketDataSingleCurrency} from '../../../src/helper/gecko/interfaces';
import {AssetIdCoin} from '../../../../../../shared-library/src/asset/assets/coin/interfaces';

export function createDummyGeckoMarketData(id: AssetIdCoin, seed = 0): GeckoMarketDataSingleCurrency {
    /* eslint-disable @typescript-eslint/camelcase */
    return {
        id,
        name: `name${seed}`,
        symbol: `symbol${seed}`,
        market_cap_rank: seed + 1,
        current_price: seed + 2,
        circulating_supply: seed + 3,
        market_cap: seed + 4,
        price_change_24h: seed + 5,
        price_change_percentage_24h: seed + 6,
        total_volume: seed + 7,
        ath: seed + 8,
        ath_date: `name${seed}`,
        atl: seed + 9,
        atl_date: `name${seed}`
    };
    /* eslint-enable @typescript-eslint/camelcase */
}
