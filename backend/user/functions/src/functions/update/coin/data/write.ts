import {readGeckoCoinPageIndex} from '../../../../helper/cloud-storage/read';
import {maxGeckoCoinPageSize} from './sample-coins';
import {
    writeCoinBuffer,
    writeCoinHistoryCompact,
    writeGeckoCoinPageIndex,
    writeUpdateTimestamp
} from '../../../../helper/cloud-storage/write';
import {getIdsInitialised} from '../../../../helper/get-initialised-coin-ids';

import {writeCoinHistoryForEachId, writeCoinSnapshots} from '../../../../helper/firestore/write';
import {CoinHistoryStorage, UpdateTimestamp} from '../../../../helper/interfaces';
import {getNextTimestampMs} from '../update-time/update-timestamp';
import {MetaData} from '../../../../../../../../shared-library/src/datatypes/meta';
import {CoinSamples} from './interfaces';
import {assetCoin} from '../../../../../../../../shared-library/src/asset/lookup-asset-factory';
import {Storage} from '../../../../../../../../shared-library/src/datatypes/data';


export function writeToStorage(meta: MetaData, history: CoinHistoryStorage, samples: CoinSamples, buffer: CoinHistoryStorage): Promise<any> {
    // write private before public because update of public data might trigger frontend stuff which trigger function which use private data
    const snapshots = mapSamples2Snapshots(samples);
    return writePrivate(meta, history, buffer).then(() => writePublic(meta, history, snapshots));
}

// ---------- private

// TODO: Rmv export
export function writePrivate(meta: MetaData, history: CoinHistoryStorage, buffer: CoinHistoryStorage): Promise<any> {
    const promises: Promise<any>[] = [];
    promises.push(writeNextTimestamp());
    promises.push(incrementGeckoCoinPage());
    promises.push(writeCoinHistoryCompact(meta, history));
    promises.push(writeCoinBuffer(meta, buffer));
    return Promise.all(promises);
}

function writePublic(meta: MetaData, history: CoinHistoryStorage, snapshots: Storage<'coin', 'SNAPSHOT'>): Promise<any> {
    const promises: Promise<any>[] = [];
    promises.push(writeCoinSnapshots(meta, history, snapshots));
    promises.push(writeCoinHistoryForEachId(meta, history, getIdsInitialised(history)));
    return Promise.all(promises);
}

function writeNextTimestamp(): Promise<any> {
    const timestampMs = getNextTimestampMs();
    const data: UpdateTimestamp = {timestampMs: timestampMs, timestampMsRedundant: timestampMs};
    return writeUpdateTimestamp(data);
}

function incrementGeckoCoinPage(): Promise<any> {
    return readGeckoCoinPageIndex().then(pageIdx => {
        const numberOfPages = Math.ceil(assetCoin.getIds().length / maxGeckoCoinPageSize);
        pageIdx = (pageIdx + 1) % numberOfPages;
        return writeGeckoCoinPageIndex(pageIdx);
    });
}

function mapSamples2Snapshots(samples: CoinSamples): Storage<'coin', 'SNAPSHOT'> {
    const storage: any = {};
    assetCoin.getIdsInStorage(samples).forEach(id => {
        storage[id] = {};
        assetCoin.getMetricsSnapshot().forEach(attr => {
            storage[id][attr] = samples[id][attr];
        });
    });
    return storage;
}