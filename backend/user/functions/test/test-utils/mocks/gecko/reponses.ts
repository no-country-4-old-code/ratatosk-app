import responseFetchCoinBitcoin from './responses/response_gecko_coin_fetch_bitcoin.json';
import responseFetchCoinError from './responses/response_gecko_coin_fetch_error.json';
import responseMarket from './responses/response_gecko_coin_market.json';
import responseRange1D from './responses/response_gecko_coin_range_bitcoin_1D.json';
import responseRange1W from './responses/response_gecko_coin_range_bitcoin_1W.json';
import responseRange1M from './responses/response_gecko_coin_range_bitcoin_1M.json';
import responseRange3M from './responses/response_gecko_coin_range_bitcoin_3M.json';
import responseRange1Y from './responses/response_gecko_coin_range_bitcoin_1Y.json';
import responseRange5Y from './responses/response_gecko_coin_range_bitcoin_5Y.json';
import responseRangeError from './responses/response_gecko_coin_range_error.json';
import responseDataCoinMarketP1 from './responses/result_coin_market_200pp_page_1.json';
import responseDataCoinMarketP2 from './responses/result_coin_market_200pp_page_2.json';
import responseDataCoinMarketP3 from './responses/result_coin_market_200pp_page_3.json';
import {TimeRange} from '../../../../../../../shared-library/src/datatypes/time';
import {AssetIdCoin} from '../../../../../../../shared-library/src/asset/assets/coin/interfaces';


export const responseGeckoFetchCoinBitcoin = responseFetchCoinBitcoin;
export const responseGeckoFetchCoinError = responseFetchCoinError;
export const responseGeckoFetchMarket = responseMarket;
export const responseGeckoFetchMarketError = responseFetchCoinError;
export const responseGeckoFetchRangeError = responseRangeError;

export const lookupGeckoResponseFetchRange: { [range in TimeRange]: any } = {
    '1D': responseRange1D,
    '1W': responseRange1W,
    '1M': responseRange1M,
    '3M': responseRange3M,
    '1Y': responseRange1Y,
    '5Y': responseRange5Y,
};

export function getCoinIdsFromGecko(): AssetIdCoin[] {
    const responses = [...responseDataCoinMarketP1, ...responseDataCoinMarketP2, ...responseDataCoinMarketP3];
    return responses.map(resp => resp.id);
}
