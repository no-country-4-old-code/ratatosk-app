import {proceedInTimeSeries} from './time-series';
import {CoinSample, CoinSamples} from '../data/interfaces';
import {TimeRange, TimeSteps} from '../../../../../../../../shared-library/src/datatypes/time';
import {AssetIdCoin, MetricCoinHistory} from '../../../../../../../../shared-library/src/asset/assets/coin/interfaces';

import {CoinHistoryStorage} from '../../../../helper/interfaces';
import {
    lookupBufferSizeOfRange,
    lookupNumberOfSamplesOfRange
} from '../../../../../../../../shared-library/src/settings/sampling';
import {assetCoin} from '../../../../../../../../shared-library/src/asset/lookup-asset-factory';
import {History} from '../../../../../../../../shared-library/src/datatypes/data';
import {
    getTimeRanges,
    lowestTimeRange
} from '../../../../../../../../shared-library/src/functions/time/get-time-ranges';


export function updateHistory(history: CoinHistoryStorage, newCoins: CoinSamples, buffer: CoinHistoryStorage): void {
    assetCoin.getIdsInStorage(history).forEach((id: AssetIdCoin) => {
        updateHistoryOfCoin(history[id], newCoins[id], buffer[id]);
    });
}


// ------------ private


function updateHistoryOfCoin(history: History<'coin'>, newCoin: CoinSample, buffer: History<'coin'>): void {
    assetCoin.getMetricsHistory().forEach((attribute: MetricCoinHistory) => {
        let value = history[attribute][lowestTimeRange][0]; // previous value

        if (newCoin !== undefined) {
            const newValue = newCoin[attribute];
            if (newValue !== undefined) {
                value = newValue;
            }
        }
        updateHistoryOfCoinAttribute(value, history[attribute], buffer[attribute]);
    });
}

export function updateHistoryOfCoinAttribute(newValue: number, history: TimeSteps, buffer: TimeSteps): void {
    let nextValue = newValue;
    let isNewValueFromPreviousStageAvailable = true;

    getTimeRanges().forEach((range: TimeRange) => {
        if (isNewValueFromPreviousStageAvailable) {
            const overflowedValue = updateHistoryOfCoinAttributeOfRange(nextValue, history, buffer, range);
            if (overflowedValue === undefined) {
                isNewValueFromPreviousStageAvailable = false;
            } else {
                nextValue = overflowedValue;
                isNewValueFromPreviousStageAvailable = true;
            }
        } else { /* pass because forEach has no break */
        }
    });
}


function updateHistoryOfCoinAttributeOfRange(newValue: number, history: TimeSteps, buffer: TimeSteps, range: TimeRange): number | undefined {
    const thresholdBuffer = lookupBufferSizeOfRange[range];
    const thresholdSeries = lookupNumberOfSamplesOfRange[range];
    const timeSeries = proceedInTimeSeries(newValue, buffer[range], history[range], thresholdBuffer, thresholdSeries);
    buffer[range] = timeSeries.buffer;
    history[range] = timeSeries.series;
    return timeSeries.overflowedValue;
}

