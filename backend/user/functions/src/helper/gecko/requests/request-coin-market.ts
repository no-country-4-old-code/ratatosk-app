import {mapToDefaultIfBadResponse, sleep, withRetries} from '../lib/helper';
import {GeckoMarketDataSingleCurrency, RequestGeckoMarket, ResponseGeckoDataMarket} from '../interfaces';
import {geckoApi} from '../lib/api';
import {sampleDbCurrency} from '../../../../../../../shared-library/src/settings/sampling';
import {createRangeArray} from '../../../../../../../shared-library/src/functions/general/array';
import {geckoRequestSettings} from '../lib/settings';
import {AssetIdCoin} from '../../../../../../../shared-library/src/asset/assets/coin/interfaces';
/* eslint-disable @typescript-eslint/camelcase */

export const maxGeckoMarketCoinPerPage = 50; // maximum to ensure it is stable

export function fetchCoinMarket(ids: AssetIdCoin[]): Promise<ResponseGeckoDataMarket> {
    const calls = Math.ceil(ids.length / maxGeckoMarketCoinPerPage);
    const promises = createRangeArray(calls).map(pageOffset => {
        const start = pageOffset * maxGeckoMarketCoinPerPage;
        const end = start + maxGeckoMarketCoinPerPage;
        const params: RequestGeckoMarket = {
            ids: ids.slice(start, end),
            vs_currency: sampleDbCurrency
        };
        return sendRequestMarket(params, pageOffset);
    });
    return Promise.all(promises).then(results =>
        results.flat().filter(ele => ele !== undefined));
}

// private

function sendRequestMarket(params: RequestGeckoMarket, sleepFactor: number) {
    const sleepTimeMs = geckoRequestSettings.getSleepTimeMs();
    const defaultValue: GeckoMarketDataSingleCurrency[] = [];
    return sleep(sleepTimeMs * sleepFactor).then(() => {
        const label = `Coin Gecko Market (page: ${params.page})`;
        const createPromise = () => geckoApi.coins.markets(params)
            .then(resp => mapToDefaultIfBadResponse(resp, defaultValue));
        return withRetries(createPromise, 3, defaultValue, label);
    });
}

