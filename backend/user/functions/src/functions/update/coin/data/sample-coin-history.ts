import {
    lookupCompleteDurationInMinutesOfRange,
    lookupSampledDurationInMinutesOfRange,
    lookupStepWidthInMinutesOfRange
} from '../../../../../../../../shared-library/src/settings/sampling';
import {TimeRange, TimeSteps} from '../../../../../../../../shared-library/src/datatypes/time';
import {AssetIdCoin, MetricCoinHistory} from '../../../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {ResponseGeckoDataMarketHistory} from '../../../../helper/gecko/interfaces';
import {fetchCoinMarketHistory} from '../../../../helper/gecko/requests/request-coin-history';
import {mapGeckoHistory2Samples} from '../../../../helper/gecko/map/map-gecko-history-2-samples';
import {History} from '../../../../../../../../shared-library/src/datatypes/data';
import {getTimeRanges} from '../../../../../../../../shared-library/src/functions/time/get-time-ranges';

type PartialCoinHistory = { [attr in MetricCoinHistory]: Partial<TimeSteps> }


export function sampleGeckoHistory(id: AssetIdCoin): Promise<History<'coin'>> {
    const promises: Promise<PartialCoinHistory>[] = [];
    getTimeRanges().forEach((range, index) => {
        const pufferInMin = 2 * lookupStepWidthInMinutesOfRange[range];
        const delayFrom = lookupCompleteDurationInMinutesOfRange[range] + pufferInMin;
        const delayTo = lookupCompleteDurationInMinutesOfRange[range] - lookupSampledDurationInMinutesOfRange[range];
        const sleepFactor = index + 1; // prevent burst of gecko requests
        const p = fetchCoinMarketHistory(id, delayFrom, delayTo, sleepFactor).then(resp => {
            if (resp.errorResponse) {
                throw new Error(`Fetch coin market history failed for ${id} from ${delayFrom} to ${delayTo} with delay factor:  ${sleepFactor}`);
            }
            return mapResp2PartialHistory(resp, range);
        });
        promises.push(p);
    });
    return Promise.all(promises).then(partialHistories => mergePartials(partialHistories));
}

// private

function mapResp2PartialHistory(resp: ResponseGeckoDataMarketHistory, range: TimeRange): PartialCoinHistory {
    const partialHistory: PartialCoinHistory = {
        price: {},
        rank: {},
        supply: {},
        volume: {},
        redditScore: {},
        marketCap: {},
        rsi: {}
    };
    const prices = mapGeckoHistory2Samples(resp.prices, range);
    const volumes = mapGeckoHistory2Samples(resp.total_volumes, range);
    const marketCaps = mapGeckoHistory2Samples(resp.market_caps, range);
    const supply = calcSupply(prices, marketCaps);
    partialHistory.price[range] = prices;
    partialHistory.volume[range] = volumes;
    partialHistory.supply[range] = supply;
    partialHistory.rank[range] = [];
    partialHistory.marketCap[range] = marketCaps;
    partialHistory.redditScore[range] = [];
    partialHistory.rsi[range] = [];
    return partialHistory;
}

function calcSupply(prices: number[], marketCaps: number[]): number[] {
    if (prices.length > marketCaps.length) {
        console.error('In calc supply. Length differ ', prices.length, marketCaps.length);
        prices = prices.slice(0, marketCaps.length);
    }
    return prices.map((price, index) => marketCaps[index] / price);
}

function mergePartials(partialHistories: PartialCoinHistory[]): History<'coin'> {
    return {
        price: mergePartialsOfAttr('price', partialHistories),
        rank: mergePartialsOfAttr('rank', partialHistories),
        supply: mergePartialsOfAttr('supply', partialHistories),
        volume: mergePartialsOfAttr('volume', partialHistories),
        marketCap: mergePartialsOfAttr('marketCap', partialHistories),
        redditScore: mergePartialsOfAttr('redditScore', partialHistories),
        rsi: mergePartialsOfAttr('rsi', partialHistories),
    };
}

function mergePartialsOfAttr(attr: MetricCoinHistory, partialHistories: PartialCoinHistory[]): TimeSteps {
    const partialHistorySteps = partialHistories.map(part => part[attr]);
    let combined = {} as TimeSteps;
    partialHistorySteps.forEach(part => {
        combined = {...combined, ...part};
    });
    return combined;
}
