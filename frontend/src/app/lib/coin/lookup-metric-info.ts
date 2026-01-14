import {MetricCoinHistory} from '../../../../../shared-library/src/asset/assets/coin/interfaces';

type LookupMetricInfo = { [attr in MetricCoinHistory]: string };

export const lookupMetricInfo: LookupMetricInfo = {
    price: 'The current price.',
    rank: 'The rank based on market capacity.',
    supply: 'An approximation of the number of coins or tokens that are currently not locked and available for public transactions.',
    volume: 'The amount of the currency that has been traded in the last 24 hours.',
    marketCap: 'The market capacity which is measured by multiplication of the circulating supply of tokens or currency and its current price.',
    redditScore: 'The rounded sum of the weighted number of new posts and comments on coin related reddit pages in the last 48 hours.',
    rsi: 'The relative strength index over the prices of the last 14 days'
};

// see coin gecko -> https://www.coingecko.com/en/glossary
