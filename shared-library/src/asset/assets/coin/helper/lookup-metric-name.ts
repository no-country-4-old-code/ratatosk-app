import {MetricHistory} from '../../../../datatypes/data';


type LookupMetricName = { [name in MetricHistory<'coin'>]: string };

export const lookupMetricNameCoin: LookupMetricName = {
    price: 'price',
    rank: 'rank',
    supply: 'supply',
    volume: 'volume of last 24H',
    marketCap: 'market capacity',
    redditScore: 'reddit score',
    rsi: 'relative strength index (RSI)'
};