import {MetricHistory, MetricSnapshot} from '../../../../datatypes/data';

type Metric = MetricHistory<'coin'> | MetricSnapshot<'coin'>;
type LookupMetric2Compression = { [metric in Metric]: string }
type LookupCompression2Metric = { [compressed in string]: Metric }


export const lookupCoinMetric2Compression: LookupMetric2Compression = {
    volume: '0',
    price: '4',
    rank: '5',
    marketCap: '6',
    supply: '7',
    redditScore: '8',
    delta: '9',
    sparkline: '10',
    rsi: '1'
};

export const lookupCompression2CoinMetric: LookupCompression2Metric = {
    '0': 'volume',
    '1': 'rsi',
    '4': 'price',
    '5': 'rank',
    '6': 'marketCap',
    '7': 'supply',
    '8': 'redditScore',
    '9': 'delta',
    '10': 'sparkline',
};