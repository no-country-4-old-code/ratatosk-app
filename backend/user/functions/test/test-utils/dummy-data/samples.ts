import {CoinSample, CoinSamples} from '../../../src/functions/update/coin/data/interfaces';
import {AssetIdCoin} from '../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {createForEach} from '../../../../../../shared-library/src/functions/general/for-each';
import {createArray} from '../../../../../../shared-library/src/functions/general/array';
import {numberOfSamplesOfSparkline} from '../../../../../../shared-library/src/settings/sampling';

export function createDummyCoinSamples(ids: AssetIdCoin[], initFirstValue = 0): CoinSamples {
    return createForEach(ids, (_, idx) => {
        return createFullCoinSample(initFirstValue + idx);
    });
}

export function createFullCoinSample(value: number): CoinSample {
    return {
        rank: value,
        price: value,
        volume: value,
        supply: value,
        marketCap: value * value,
        sparkline: createArray(numberOfSamplesOfSparkline, value),
        delta: value,
        redditScore: value,
        rsi: value
    };
}
