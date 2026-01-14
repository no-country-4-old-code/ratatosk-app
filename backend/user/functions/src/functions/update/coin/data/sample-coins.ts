import {ExchangeRates, Meta, MetaData} from '../../../../../../../../shared-library/src/datatypes/meta';
import {fetchCoinMarket} from '../../../../helper/gecko/requests/request-coin-market';
import {readGeckoCoinPageIndex} from '../../../../helper/cloud-storage/read';
import {
    LookupCurrencyToValue,
    ResponseGeckoDataCoin,
    ResponseGeckoDataMarket
} from '../../../../helper/gecko/interfaces';

import {sampleDbCurrency} from '../../../../../../../../shared-library/src/settings/sampling';
import {geckoRequestSettings} from '../../../../helper/gecko/lib/settings';
import {getCurrencies} from '../../../../../../../../shared-library/src/functions/currency';
import {fetchCoin} from '../../../../helper/gecko/requests/request-coin';
import {CoinSamples} from './interfaces';
import {mapGeckoMarketData2CoinSample} from '../../../../helper/gecko/map/map-gecko-market-2-snapshot';
import {assetCoin} from '../../../../../../../../shared-library/src/asset/lookup-asset-factory';
import {AssetIdCoin} from '../../../../../../../../shared-library/src/asset/assets/coin/interfaces';


const maxTimeForAdvancedContentFetchingMs = 1000 * 20;
const sleepTimeBetweenRequests = geckoRequestSettings.getSleepTimeMs();
export const maxGeckoCoinPageSize = Math.floor(maxTimeForAdvancedContentFetchingMs / sleepTimeBetweenRequests);


export function sampleCoins(): Promise<Meta<CoinSamples>> {
    const promises: Promise<any>[] = [];
    promises.push(getContent());
    promises.push(getMetadata());
    return Promise.all(promises).then(([content, meta]) => ({payload: content, meta}));
}

// private

function getMetadata(): Promise<MetaData> {
    // eslint-disable-next-line @typescript-eslint/camelcase
    return fetchCoin('bitcoin', {market_data: true}).then(resp => {
        return mapToMeta(resp);
    });
}

function getContent(): Promise<CoinSamples> {
    return fetchCoinMarket(assetCoin.getIds()).then(resp => {
        const content = mapToAllCoins(resp);
        return getAdvancedContent(content);
    });
}

function getAdvancedContent(content: CoinSamples): Promise<CoinSamples> {
    return getCoinIdsForAdvancedContent().then(ids => {
        const promises: Promise<void>[] = [];
        ids.forEach((id, idx) => {
            const sleepFactor = idx + 1;
            promises.push(updateWithAdvancedContent(id, content, sleepFactor));
        });
        return Promise.all(promises).then(() => (content));
    });
}

function getCoinIdsForAdvancedContent(): Promise<AssetIdCoin[]> {
    return readGeckoCoinPageIndex().then(idx => {
        const start = idx * maxGeckoCoinPageSize;
        const end = start + maxGeckoCoinPageSize;
        return assetCoin.getIds().slice(start, end);
    });
}

function mapToAllCoins(resp: ResponseGeckoDataMarket): CoinSamples {
    const content: CoinSamples = {};
    resp.forEach(info => {
        content[info.id] = mapGeckoMarketData2CoinSample(info);
    });
    return content;
}

function mapToMeta(resp: ResponseGeckoDataCoin): MetaData {
    let ratesToUsd = undefined as any as ExchangeRates;
    if (resp !== undefined) {
        ratesToUsd = mapToExchangeRates(resp.market_data.current_price);
    }
    return {
        timestampMs: Date.now(),
        unit: sampleDbCurrency,
        ratesTo$: ratesToUsd,
    };
}

function mapToExchangeRates(lookup: LookupCurrencyToValue): ExchangeRates {
    const rates: ExchangeRates = {} as ExchangeRates;
    getCurrencies().forEach(currency => {
        rates[currency] = lookup[currency] / lookup[sampleDbCurrency];
    });
    return rates;
}

function updateWithAdvancedContent(id: string, content: CoinSamples, sleepFactor: number) {
    // eslint-disable-next-line @typescript-eslint/camelcase
    return fetchCoin(id, {market_data: true}, sleepFactor).then(advanced => {
        updateWithAdvanced(id, content, advanced);
    });
}

function updateWithAdvanced(id: AssetIdCoin, content: CoinSamples, resp: ResponseGeckoDataCoin): void {
    if (content[id] !== undefined && resp !== undefined) {
        content[id].redditScore = map2RedditScore(resp);
    }
}

function map2RedditScore(resp: ResponseGeckoDataCoin): number {
    const data = resp.community_data;
    return Math.round(data.reddit_average_posts_48h + data.reddit_average_comments_48h / 1000.0);
}