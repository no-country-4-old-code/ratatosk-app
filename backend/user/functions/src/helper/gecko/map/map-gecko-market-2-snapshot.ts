import {GeckoMarketDataSingleCurrency} from '../interfaces';
import {mapNull2Nan} from './map-null-2-nan';
import {CoinSample} from '../../../functions/update/coin/data/interfaces';

export function mapGeckoMarketData2CoinSample(resp: GeckoMarketDataSingleCurrency): CoinSample {
    const price = mapNull2Nan(resp.current_price);
    const supply = mapNull2Nan(resp.circulating_supply);
    return {
        price,
        rank: mapNull2Nan(resp.market_cap_rank),
        volume: mapNull2Nan(resp.total_volume),	// 24h
        supply, // 24h
        marketCap: price * supply,
        // advanced attributes are filled later on (at least in synchronized)
        delta: undefined as any as number,
        sparkline: undefined as any as number[],
        redditScore: undefined as any as number,
        rsi: undefined as any as number
    };
}
