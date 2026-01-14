import {
    lookupGeckoResponseFetchRange,
    responseGeckoFetchCoinBitcoin,
    responseGeckoFetchCoinError,
    responseGeckoFetchMarket,
    responseGeckoFetchMarketError,
    responseGeckoFetchRangeError
} from './reponses';
import {mapToPromise} from '../../../../../../../shared-library/src/functions/map-to-promise';
import {geckoApi} from '../../../../src/helper/gecko/lib/api';
import {geckoRequestSettings} from '../../../../src/helper/gecko/lib/settings';
import {firestoreApi} from '../../../../../../shared-backend-library/src/firestore/lib/api';
import {TimeRange} from '../../../../../../../shared-library/src/datatypes/time';

import {assetCoin} from '../../../../../../../shared-library/src/asset/lookup-asset-factory';

export function disableGeckoTimeSleep() {
    spyOn(geckoRequestSettings, 'getSleepTimeMs').and.returnValue(0);
}

export function spyOnGeckoRequestVerifiedUserId(returnValue: string): jasmine.Spy {
    const value = mapToPromise(returnValue);
    return spyOn(firestoreApi, 'requestVerifiedUserId').and.returnValue(value);
}

// requests

export function spyOnGeckoCoinAndReturnResponse(): jasmine.Spy {
    const responseFetchCoins = mapToPromise(responseGeckoFetchCoinBitcoin);
    return spyOn(geckoApi.coins, 'fetch').and.returnValue(responseFetchCoins);
}

export function spyOnGeckoCoinAndReturnError(): jasmine.Spy {
    const responseFetchCoins = mapToPromise(responseGeckoFetchCoinError);
    return spyOn(geckoApi.coins, 'fetch').and.returnValue(responseFetchCoins);
}

export function spyOnGeckoMarketsAndReturnResponse(): jasmine.Spy {
    const response = mapToPromise(responseGeckoFetchMarket);
    return spyOn(geckoApi.coins, 'markets').and.returnValue(response);
}

export function spyOnGeckoMarketsAndReturnForIds(ids = assetCoin.getIds()): jasmine.Spy {
    const changeId = (data: any, idx: number) => ({...data, id: ids[idx]});
    const resp = {...responseGeckoFetchMarket};
    resp.data = [...resp.data, ...resp.data, ...resp.data]; // increase to support up to 300
    resp.data = resp.data.slice(0, ids.length).map((data, idx) => changeId(data, idx));
    const response = mapToPromise(resp);
    return spyOn(geckoApi.coins, 'markets').and.returnValue(response);
}

export function spyOnGeckoMarketsAndReturnError(): jasmine.Spy {
    const response = mapToPromise(responseGeckoFetchMarketError);
    return spyOn(geckoApi.coins, 'markets').and.returnValue(response);
}

export function spyOnGeckoRangeAndReturnResponse(range: TimeRange = '1D'): jasmine.Spy {
    const responseFetchRange = mapToPromise(lookupGeckoResponseFetchRange[range]);
    return spyOn(geckoApi.coins, 'fetchMarketChartRange').and.returnValue(responseFetchRange);
}

export function spyOnGeckoRangeAndReturnError(): jasmine.Spy {
    const responseFetchRange = mapToPromise(responseGeckoFetchRangeError);
    return spyOn(geckoApi.coins, 'fetchMarketChartRange').and.returnValue(responseFetchRange);
}
