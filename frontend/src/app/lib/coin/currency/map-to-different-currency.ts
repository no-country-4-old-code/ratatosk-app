import {Currency} from '../../../../../../shared-library/src/datatypes/currency';
import {TimeRange, TimeSteps} from '../../../../../../shared-library/src/datatypes/time';
import {MetricCoinHistory} from '../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {MetaData} from '../../../../../../shared-library/src/datatypes/meta';
import {History, Snapshot} from '../../../../../../shared-library/src/datatypes/data';

export function changeSnapshotCurrency(snapshot: Snapshot<'coin'>, meta: MetaData, dest: Currency): Snapshot<'coin'> {
    const factor = meta.ratesTo$[dest];
    const applyFactor = (value: number) => factor * value;
    return {
        price: applyFactor(snapshot.price),
        rank: snapshot.rank,
        delta: snapshot.delta,
        sparkline: snapshot.sparkline,
    };
}

export function changeHistoryCurrency(history: History<'coin'>, meta: MetaData, dest: Currency): History<'coin'> {
    const factor = meta.ratesTo$[dest];
    const applyFactor = (attr: MetricCoinHistory) => applyFactorToHistorySteps(history[attr], factor);
    return {
        price: applyFactor('price'),
        volume: applyFactor('volume'),
        marketCap: applyFactor('marketCap'),
        rank: {...history.rank},
        supply: {...history.supply},
        redditScore: {...history.redditScore},
        rsi: {...history.rsi}
    };
}

// private

function applyFactorToHistorySteps(steps: TimeSteps, factor: number): TimeSteps {
    const applyFactor = (step: TimeRange) => steps[step].map(val => factor * val);
    return {
        '1D': applyFactor('1D'),
        '1W': applyFactor('1W'),
        '1M': applyFactor('1M'),
        '3M': applyFactor('3M'),
        '1Y': applyFactor('1Y'),
        '5Y': applyFactor('5Y'),
    };
}
