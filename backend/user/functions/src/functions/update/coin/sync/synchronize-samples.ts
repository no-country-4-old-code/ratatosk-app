import {getIdsInitialised} from '../../../../helper/get-initialised-coin-ids';
import {CoinSample, CoinSamples} from '../data/interfaces';

import {CoinHistoryStorage} from '../../../../helper/interfaces';
import {assetCoin} from '../../../../../../../../shared-library/src/asset/lookup-asset-factory';
import {calcDelta} from '../../../../../../../../shared-library/src/functions/calc-delta';
import {
    lookupNumberOfSamplesOfRange,
    numberOfSamplesOfSparkline
} from '../../../../../../../../shared-library/src/settings/sampling';
import {History, Snapshot} from '../../../../../../../../shared-library/src/datatypes/data';
import {lowestTimeRange} from '../../../../../../../../shared-library/src/functions/time/get-time-ranges';
import {extractSparkline, normalize} from './sparkline';
import {calculateRsi} from '../calc/calculate-rsi';

export function synchronizeSamplesWithHistory(sampledCoins: CoinSamples, history: CoinHistoryStorage): CoinSamples {
    const coins: any = {};
    const ids = getIdsInitialised(history);
    const attributes = assetCoin.getMetricsHistory();

    ids.forEach(id => {
        coins[id] = mapUndefined2Empty(sampledCoins[id]);
        coins[id].rsi = calculateRsi(coins[id].price, history[id].price);
        attributes.forEach(attr => {
            const historicValue = history[id][attr][lowestTimeRange][0];
            coins[id][attr] = mapUndefined2HistoryOrNan(coins[id][attr], historicValue);
        });
        coins[id].delta = calcPriceDelta(coins[id], history[id]);
        coins[id].sparkline = getSparklineAsU8Array(coins[id], history[id]);
    });
    return coins as CoinSamples;
}

// private

function mapUndefined2Empty(obj: CoinSample): CoinSample {
    if (obj === undefined) {
        return {} as CoinSample;
    } else {
        return {...obj};
    }
}

function mapUndefined2HistoryOrNan(value: number, historicValue: number): number {
    if (value === undefined && historicValue !== undefined) {
        return historicValue;
    } else {
        return mapUndefined2Nan(value);
    }
}

function mapUndefined2Nan(value: number): number {
    if (value === undefined) {
        return NaN;
    } else {
        return value;
    }
}

function calcPriceDelta(snapshot: Snapshot<any>, history: History<any>): number {
    const slicedSamples = history.price['1D'].slice(0, lookupNumberOfSamplesOfRange['1D'] - 1);
    return calcDelta(snapshot.price, slicedSamples);
}

function getSparklineAsU8Array(snapshot: Snapshot<any>, history: History<any>): number[] {
    const maxNumberOf1Byte = 255;
    const sparkline = extractSparkline(snapshot.price, history.price['1D'], numberOfSamplesOfSparkline);
    return normalize(sparkline, maxNumberOf1Byte);
}
