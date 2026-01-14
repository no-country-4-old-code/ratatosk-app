import {AssetId, History, MetricHistory, Snapshot, Storage} from '../../../../datatypes/data';
import {
    CompressedAssetIds,
    CompressedHistory,
    CompressedPreSelectionBlueprint,
    CompressedSnapshot,
    CompressedStorageSnapshot
} from '../../../../datatypes/compress';
import {getKeysAs, mapKeys} from '../../../../functions/general/object';
import {compressTimeRanges, decompressTimeRanges} from '../../../../functions/compress/compress-time';
import {TimeSteps} from '../../../../datatypes/time';
import {createForEach} from '../../../../functions/general/for-each';
import {getCoinIds} from './get-ids-and-info';
import {lookupCoinMetric2Compression, lookupCompression2CoinMetric} from './lookup-metric-compression';
import {compressNumbersU8, decompressNumbersU8} from '../../../../functions/compress/compress-numbers-u8';
import {mapBitmap2Indexes, mapIndexes2Bitmap} from '../../../../functions/compress/map-indexes-to-bitmap';
import {PreSelectionBlueprint} from '../../../../scan/pre-selection/interfaces';
import {getCoinCategories} from './get-categories';
import {getCoinExchanges} from './get-exchanges';

const coinIds = getCoinIds();
const lookupCoinId2Idx = createForEach(coinIds, (_, idx) => idx);
const lookupCoinCategories2Idx = createForEach(getCoinCategories(), (_, idx) => idx);
const lookupCoinExchanges2Idx = createForEach(getCoinExchanges(), (_, idx) => idx);
const coinIdsStr = coinIds.map((_, idx) => `${idx}`);
const lookupCoinId2Compressed = createForEach(coinIds, (_, idx) => `${idx}`);
const lookupCompressed2CoinId = createForEach(coinIdsStr, (_, idx) => coinIds[idx]);


export function compressCoinIds(ids: AssetId<'coin'>[]): CompressedAssetIds {
    return compressIds(ids);
}

export function decompressCoinIds(ids: CompressedAssetIds): AssetId<'coin'>[] {
    return decompressIds(ids);
}

export function compressCoinStorageSnapshot(storage: Storage<'coin', 'SNAPSHOT'>): CompressedStorageSnapshot {
    const partial = packStorageSnapshot(storage);
    const compressNestedMetrics = (obj: any) => mapKeys(obj, compressCoinMetrics);
    return mapKeys(partial, mapIds2StringIndexes, compressNestedMetrics);
}

export function decompressCoinStorageSnapshot(compressed: CompressedStorageSnapshot): Storage<'coin', 'SNAPSHOT'> {
    const decompressNestedMetrics = (obj: any) => mapKeys(obj, decompressCoinMetrics);
    const storage = mapKeys(compressed, mapStringIndexes2Ids, decompressNestedMetrics) as Storage<'coin', 'SNAPSHOT'>;
    return unpackStorageSnapshot(storage);
}

export function compressCoinHistory(history: History<'coin'>): CompressedHistory {
    const partial = packHistory(history);
    const compressNested = (obj: any) => mapKeys(obj, compressTimeRanges);
    return mapKeys(partial, compressCoinMetrics, compressNested);
}

export function decompressCoinHistory(compressed: CompressedHistory): History<'coin'> {
    const decompressNested = (obj: any) => mapKeys(obj, decompressTimeRanges);
    const partial = mapKeys(compressed, decompressCoinMetrics, decompressNested) as History<'coin'>;
    return unpackHistory(partial);
}


export function compressCoinPreSelection(blueprint: PreSelectionBlueprint<'coin'>): CompressedPreSelectionBlueprint {
    const manual = mapUndefined2EmptyArray(blueprint.manual);
    const categories = mapUndefined2EmptyArray(blueprint.categories);
    const exchanges = mapUndefined2EmptyArray(blueprint.exchanges);
    return {
        m: compressIds(manual),
        c: compressOptions(categories, getCoinCategories(), lookupCoinCategories2Idx),
        e: compressOptions(exchanges, getCoinExchanges(), lookupCoinExchanges2Idx)
    };
}

export function decompressCoinPreSelection(compressed: CompressedPreSelectionBlueprint): PreSelectionBlueprint<'coin'> {
    const manual = (compressed as any).m;
    const categories = (compressed as any).c;
    const exchanges = (compressed as any).e;
    return {
        manual: decompressOptions(manual, coinIds),
        categories: decompressOptions(categories, getCoinCategories()),
        exchanges: decompressOptions(exchanges, getCoinExchanges()),
    };
}

// ------ private

function compressCoinMetrics(metrics: MetricHistory<'coin'>[]): string[] {
    return metrics.map(metric => lookupCoinMetric2Compression[metric]);
}

function decompressCoinMetrics(metrics: MetricHistory<'coin'>[]): string[] {
    return metrics.map(metric => lookupCompression2CoinMetric[metric]);
}

function compressIds(ids: AssetId<'coin'>[]): any | any[] {
    return compressOptions(ids, coinIds, lookupCoinId2Idx);
}

function decompressIds(compressed: any | any[]): AssetId<'coin'>[] {
    return decompressOptions(compressed, coinIds);
}

function compressOptions(selected: string[], all: string[], lookupOption2Idx: { [option in string]: number }): any | any[] {
    if (selected.length === all.length) {
        // compress hack to support all
        return true;
    } else {
        const bitIndexes = selected.map(option => lookupOption2Idx[option]);
        return compressBitIndexes(bitIndexes);
    }
}

function decompressOptions(compressed: any | any[], all: string[]): string[] {
    if (compressed === undefined) {
        // handle new options
        return [...all];
    }
    if (typeof compressed === 'boolean') {
        // compress hack to support all options
        return [...all];
    }
    const bitmapsU8 = decompressNumbersU8(compressed);
    const indexes = mapBitmap2Indexes(bitmapsU8);
    return indexes.map(idx => all[idx]);
}

function compressBitIndexes(bitIndexes: number[]): any | any[] {
    if (bitIndexes.some(idx => idx === undefined)) {
        console.error('Undefined idx after compression ');
        bitIndexes = bitIndexes.filter(idx => idx !== undefined);
    }
    const bitmapsU8 = mapIndexes2Bitmap(bitIndexes);
    return compressNumbersU8(bitmapsU8);
}

function mapIds2StringIndexes(ids: AssetId<'coin'>[]): any[] {
    const compressed = ids.map(id => lookupCoinId2Compressed[id]);
    if (compressed.some(id => id === undefined)) {
        console.error('Undefined ids after compression ', compressed);
    }
    return compressed.filter(id => id !== undefined);
}

function mapStringIndexes2Ids(compressed: any[]): AssetId<'coin'>[] {
    return compressed.map(id => lookupCompressed2CoinId[id]);
}

function packStorageSnapshot(storage: Storage<any, 'SNAPSHOT'>): CompressedStorageSnapshot {
    const ids = getKeysAs(storage);
    return createForEach(ids, key => packSnapshot(storage[key]));
}

function unpackStorageSnapshot(storage: Storage<'coin', 'SNAPSHOT'>): Storage<any, 'SNAPSHOT'> {
    const ids = getKeysAs(storage);
    return createForEach(ids, key => unpackSnapshot((storage as any)[key]));
}

function packSnapshot(unpacked: Snapshot<'coin'>): CompressedSnapshot {
    return {
        rank: unpacked.rank,
        price: unpacked.price,
        delta: unpacked.delta,
        sparkline: compressNumbersU8(unpacked.sparkline)
    };
}

export function packHistory(packed: History<'coin'>): Omit<History<'coin'>, 'marketCap'> {
    return {
        rank: packed.rank,
        price: packed.price,
        volume: packed.volume,
        supply: packed.supply,
        redditScore: packed.redditScore,
        rsi: packed.rsi,
    };
}

function unpackSnapshot(packed: CompressedSnapshot): Snapshot<'coin'> {
    return {
        rank: (packed as any as Snapshot<'coin'>).rank,
        price: (packed as any as Snapshot<'coin'>).price,
        delta: (packed as any as Snapshot<'coin'>).delta,
        sparkline: decompressNumbersU8((packed as any).sparkline)
    };
}

function unpackHistory(packed: Omit<History<'coin'>, 'marketCap'>): History<'coin'> {
    return {
        rank: packed.rank,
        price: packed.price,
        volume: packed.volume,
        supply: packed.supply,
        marketCap: multiplyRanges(packed.price, packed.supply),
        redditScore: packed.redditScore,
        rsi: packed.rsi
    };
}

function multiplyRanges(price: TimeSteps, supply: TimeSteps): TimeSteps {
    return {
        '1D': multiply(price['1D'], supply['1D']),
        '1W': multiply(price['1W'], supply['1W']),
        '1M': multiply(price['1M'], supply['1M']),
        '3M': multiply(price['3M'], supply['3M']),
        '1Y': multiply(price['1Y'], supply['1Y']),
        '5Y': multiply(price['5Y'], supply['5Y']),
    };
}

function multiply(first: number[], second: number[]): number[] {
    return first.map((val1: number, idx: number) => {
        return val1 * second[idx];
    });
}


function mapUndefined2EmptyArray(ids?: any[]): any[] {
    return ids === undefined ? [] : ids;
}
