import {writeCoinBuffer, writeCoinHistoryCompact, writeGeckoCoinPageIndex} from '../../src/helper/cloud-storage/write';
import {MetaData} from '../../../../../shared-library/src/datatypes/meta';

import {createCoinHistoryStorageSeed} from './dummy-data/asset-specific/coin';
import {createDummyMetaData} from '../../../../../shared-library/src/functions/test-utils/dummy-data/meta';
import {CoinHistoryStorage} from '../../src/helper/interfaces';
import {assetCoin} from '../../../../../shared-library/src/asset/lookup-asset-factory';
import {AssetIdCoin} from '../../../../../shared-library/src/asset/assets/coin/interfaces';


type SetUpDatabaseFunction = (timestampMs?: number) => Promise<void>;
export type MockDatabaseState = 'empty' | 'one' | 'two-with-nan' | 'missing-attr' | 'one-missing' | 'full';
export type LookupDatabaseStateInit = { [state in MockDatabaseState]: AssetIdCoin[] }
export type LookupSetDatabaseState = { [state in MockDatabaseState]: SetUpDatabaseFunction }

export const lookupIdsDatabaseState: LookupDatabaseStateInit = {
    'empty': [],
    'one': assetCoin.getIds().slice(0, 1),
    'two-with-nan': assetCoin.getIds().slice(0, 2),
    'missing-attr': assetCoin.getIds().slice(0, 2),
    'one-missing': assetCoin.getIds().slice(0, assetCoin.getIds().length - 1),
    'full': assetCoin.getIds(),
};

export const lookupSetDatabaseState: LookupSetDatabaseState = {
    'empty': (timestampMs?: number) => setUp('empty', timestampMs),
    'one': (timestampMs?: number) => setUp('one', timestampMs),
    'two-with-nan': (timestampMs?: number) => setUpWithLastAsNan('two-with-nan', timestampMs),
    'missing-attr': (timestampMs?: number) => setUpWithoutAttributeVolume('missing-attr', timestampMs),
    'one-missing': (timestampMs?: number) => setUp('one-missing', timestampMs),
    'full': (timestampMs?: number) => setUp('full', timestampMs),
};

export function getMockDatabaseStates(): MockDatabaseState[] {
    return Object.keys(lookupSetDatabaseState) as MockDatabaseState[];
}

// private

async function setUp(state: MockDatabaseState, timestampMs?: number): Promise<void> {
    const ids = lookupIdsDatabaseState[state];
    const meta = createDummyMetaData(timestampMs);
    const history = createCoinHistoryStorageSeed(ids);
    return write(meta, history, 0);
}

async function setUpWithLastAsNan(state: MockDatabaseState, timestampMs?: number): Promise<void> {
    const ids = lookupIdsDatabaseState[state];
    const lastId: AssetIdCoin = ids[ids.length - 1];
    const meta = createDummyMetaData(timestampMs);
    const history = createCoinHistoryStorageSeed(ids);
    assetCoin.getMetricsHistory().forEach(attr => {
        history[lastId][attr]['1D'][0] = NaN;
    });
    return write(meta, history, 0);
}

async function setUpWithoutAttributeVolume(state: MockDatabaseState, timestampMs?: number): Promise<void> {
    const ids = lookupIdsDatabaseState[state];
    const lastId: AssetIdCoin = ids[ids.length - 1];
    const meta = createDummyMetaData(timestampMs);
    const history = createCoinHistoryStorageSeed(ids);
    delete history[lastId]['volume'];
    return write(meta, history, 0);
}

async function write(meta: MetaData, history: CoinHistoryStorage, pageIdx: number): Promise<void> {
    await writeCoinBuffer(meta, {});
    await writeCoinHistoryCompact(meta, history);
    await writeGeckoCoinPageIndex(pageIdx);
}
