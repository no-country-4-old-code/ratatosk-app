import {mapToDefaultIfBadResponse, sleep, withRetries} from '../lib/helper';
import {RequestGeckoMarketHistory, ResponseGeckoDataMarketHistory} from '../interfaces';
import {geckoApi} from '../lib/api';
import {sampleDbCurrency} from '../../../../../../../shared-library/src/settings/sampling';
import {geckoRequestSettings} from '../lib/settings';
import {AssetIdCoin} from '../../../../../../../shared-library/src/asset/assets/coin/interfaces';

/* eslint-disable @typescript-eslint/camelcase */
export function fetchCoinMarketHistory(id: AssetIdCoin, delayFromInMin: number, delayToInMin: number, sleepFactor = 1): Promise<ResponseGeckoDataMarketHistory> {
    const nowInSec = Math.floor(Date.now() / 1000);
    const from = nowInSec - delayFromInMin * 60;
    const to = nowInSec - delayToInMin * 60;
    const params: RequestGeckoMarketHistory = {from, to, vs_currency: sampleDbCurrency};
    return sendRequestHistory(id, params, sleepFactor);
}

// private

function sendRequestHistory(id: AssetIdCoin, params: RequestGeckoMarketHistory, sleepFactor: number) {
    const sleepTimeMs = geckoRequestSettings.getSleepTimeMs();
    const defaultValue: ResponseGeckoDataMarketHistory = {
        prices: [],
        market_caps: [],
        total_volumes: [],
        errorResponse: true
    };
    return sleep(sleepTimeMs * sleepFactor).then(() => {
        const label = `Coin Gecko Market Chart Range (id: ${id}, from: ${params.from} - to: ${params.to} )`;
        const createPromise = () => geckoApi.coins.fetchMarketChartRange(id, params)
            .then(resp => mapToDefaultIfBadResponse(resp, defaultValue));
        return withRetries(createPromise, 3, defaultValue, label);
    });
}

