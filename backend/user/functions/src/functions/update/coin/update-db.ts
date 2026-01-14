import {updateHistory} from './calc/update-history';
import {queryData, readNextUpdateTimestamp} from './data/read';
import {writeToStorage} from './data/write';
import {synchronizeSamplesWithHistory} from './sync/synchronize-samples';
import {synchronizeBufferWithCoinIds} from './sync/synchronize-buffer';
import {isTimeForUpdate} from './update-time/update-timestamp';
import {synchronizeHistoryWithCoinIds} from './sync/synchronize-history';
import {CoinSamples, UpdateDbData} from './data/interfaces';
import {MetaData} from '../../../../../../../shared-library/src/datatypes/meta';
import {CoinHistoryStorage} from '../../../helper/interfaces';
import {triggerSchedulePeriodicScan} from '../../../helper/pub-sub/send';


export async function updateCoinDb(): Promise<void> {
    if (await isTimeForUpdateDb()) {
        await run();
    } else {
        console.log('Skip update for updateDatabase');
    }
}


// ------- private

async function run(): Promise<void> {
    const t1 = Date.now();
    let db = await queryData();
    const t2 = Date.now();
    console.log('Get data after ', (t2 - t1) / 1000, ' sec ');
    db = doUpdate(db.history, db.samples, db.buffer, db.meta);
    const t3 = Date.now();
    console.log('Update data after ', (t3 - t2) / 1000, ' sec ');
    return writeToStorage(db.meta, db.history, db.samples, db.buffer).then(
        () => triggerSchedulePeriodicScan());
}

export function doUpdate(history: CoinHistoryStorage, samples: CoinSamples, buffer: CoinHistoryStorage, meta: MetaData): UpdateDbData {
    history = synchronizeHistoryWithCoinIds(history);
    buffer = synchronizeBufferWithCoinIds(buffer, history);
    samples = synchronizeSamplesWithHistory(samples, history);
    updateHistory(history, samples, buffer as CoinHistoryStorage);
    return {samples: samples, history, buffer, meta};
}

async function isTimeForUpdateDb(): Promise<boolean> {
    let isUpdateTime: boolean;
    const storage = await readNextUpdateTimestamp();

    if (storage.timestampMs === storage.timestampMsRedundant) {
        isUpdateTime = isTimeForUpdate(storage.timestampMs);
    } else {
        console.error('Error in timestamp for Update Database (corrupted): ', storage);
        isUpdateTime = true;
    }
    return isUpdateTime;
}
