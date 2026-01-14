import {RequestGeckoCoin, ResponseGeckoDataCoin} from '../interfaces';
import {geckoRequestSettings} from '../lib/settings';
import {mapToDefaultIfBadResponse, sleep, withRetries} from '../lib/helper';
import {geckoApi} from '../lib/api';
import {AssetIdCoin} from '../../../../../../../shared-library/src/asset/assets/coin/interfaces';
/* eslint-disable @typescript-eslint/camelcase */

const defaultParams: RequestGeckoCoin = {
    tickers: false,
    market_data: true,
    community_data: true,
    developer_data: true,
    localization: false,
    sparkline: false
};

export function fetchCoin(id: AssetIdCoin, overwriteParams: Partial<RequestGeckoCoin> = defaultParams, sleepFactor = 1): Promise<ResponseGeckoDataCoin> {
    const params = {...defaultParams, ...overwriteParams};
    return sendRequestCoin(id, params, sleepFactor);
}

// private

function sendRequestCoin(id: AssetIdCoin, params: RequestGeckoCoin, sleepFactor: number) {
    const sleepTimeMs = sleepFactor * geckoRequestSettings.getSleepTimeMs();
    const defaultValue = undefined as any as ResponseGeckoDataCoin;
    return sleep(sleepTimeMs).then(() => {
        const label = `Coin Gecko Market Coin (id: ${id})`;
        const createPromise = () => geckoApi.coins.fetch(id, params)
            .then(resp => mapToDefaultIfBadResponse(resp, defaultValue));
        return withRetries(createPromise, 1, defaultValue, label);
    });
}
