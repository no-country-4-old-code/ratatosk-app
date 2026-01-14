import {MetricCoinHistory, MetricCoinSnapshot} from '../interfaces';
import {getKeysAs} from '../../../../functions/general/object';
import {MetricHistory, MetricSnapshot, Snapshot} from '../../../../datatypes/data';

export function getMetricsCoinHistory(): MetricHistory<'coin'>[] {
    const dummy: { [attr in MetricCoinHistory]: number } = {
        price: NaN, rank: NaN, supply: NaN, volume: NaN, marketCap: NaN, redditScore: NaN, rsi: NaN
    };
    return Object.keys(dummy) as MetricCoinHistory[];
}

export function getMetricsCoinSnapshot(): MetricSnapshot<'coin'>[] {
    const dummy: Snapshot<'coin'> = {
        rank: NaN,
        price: NaN,
        delta: NaN,
        sparkline: []
    };
    return getKeysAs<MetricCoinSnapshot>(dummy);
}
