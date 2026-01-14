// eslint-disable-next-line @typescript-eslint/no-var-requires
import {
    ResponseGeckoApi,
    ResponseGeckoDataCoin,
    ResponseGeckoDataMarket,
    ResponseGeckoDataMarketHistory
} from '../interfaces';
import {AssetIdCoin} from '../../../../../../../shared-library/src/asset/assets/coin/interfaces';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const CoinGecko = require('coingecko-api'); // no declaration file -> have to use require
CoinGecko.TIMEOUT = 15000; // ms
const client = new CoinGecko();


export const geckoApi = {
    coins: {fetch, markets, fetchMarketChartRange}
};

// private

function fetch(id: AssetIdCoin, params: any): Promise<ResponseGeckoApi<ResponseGeckoDataCoin>> {
    return client.coins.fetch(id, params);
}

function markets(params: any): Promise<ResponseGeckoApi<ResponseGeckoDataMarket>> {
    return client.coins.markets(params);
}

function fetchMarketChartRange(id: AssetIdCoin, params: any): Promise<ResponseGeckoApi<ResponseGeckoDataMarketHistory>> {
    return client.coins.fetchMarketChartRange(id, params);
}