import {History, Snapshot} from '../../../../datatypes/data';
import {getMetricsCoinHistory, getMetricsCoinSnapshot} from './get-metrics';
import {createForEach} from '../../../../functions/general/for-each';
import {createTimeSteps} from '../../../../functions/time/steps';
import {getTimeRanges} from '../../../../functions/time/get-time-ranges';
import {TimeSteps} from '../../../../datatypes/time';
import {createArray} from '../../../../functions/general/array';
import {numberOfSamplesOfSparkline} from '../../../../settings/sampling';

export function createDummyCoinSnapshot(seed: number): Snapshot<'coin'> {
    const metrics = getMetricsCoinSnapshot();
    const snapshot = {
        ...createForEach(metrics, (_, idx) => (seed * (1 + idx))),
        sparkline: createArray(numberOfSamplesOfSparkline, seed)
    };
    return snapshot;
}

export function createDummyCoinHistory(seed: number): History<'coin'> {
    const metrics = getMetricsCoinHistory();
    const history = createForEach(metrics, (_, idx) => createTimeSteps(seed * (1 + idx)));
    history.marketCap = createTimeStepsForMarketCap(history);
    return history;
}

// private

function createTimeStepsForMarketCap(history: History<'coin'>): TimeSteps {
    const ranges = getTimeRanges();
    return createForEach(ranges, range => {
        const price = history.price[range][0];
        const supply = history.supply[range][0];
        const length = history.supply[range].length;
        return createArray(length, price * supply);
    });
}
