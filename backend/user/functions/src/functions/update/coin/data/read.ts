import {sampleCoins} from './sample-coins';
import {handleUninitialisedAssets} from './handle-uninitialised';
import {CoinSamples, UpdateDbData} from './interfaces';
import {readCoinBufferBucket, readCoinHistoryBucket, readUpdateTimestamp} from '../../../../helper/cloud-storage/read';
import {Meta, MetaData} from '../../../../../../../../shared-library/src/datatypes/meta';
import {CoinHistoryStorage, UpdateTimestamp} from '../../../../helper/interfaces';

export function queryData(): Promise<UpdateDbData> {
    const promises: Promise<any>[] = [];
    promises.push(sampleCoins());
    promises.push(readCoinHistoryBucket().then(data => handleUninitialisedAssets(data.payload)));
    promises.push(readCoinBufferBucket());
    return Promise.all(promises).then(([samples, history, buffer]) => mapToUpdateDb(samples, history, buffer));
}

export function readNextUpdateTimestamp(): Promise<UpdateTimestamp> {
    return readUpdateTimestamp();
}

// private

function mapToUpdateDb(coinsWithMeta: Meta<CoinSamples>,
                       history: CoinHistoryStorage,
                       bufferWithMeta: Meta<CoinHistoryStorage>): UpdateDbData {
    const samples = coinsWithMeta.payload;
    const buffer = bufferWithMeta.payload;
    const meta = catchUndefinedExchangeRates(coinsWithMeta.meta, bufferWithMeta.meta);
    return {samples, history, buffer, meta};
}

function catchUndefinedExchangeRates(meta: MetaData, backup: MetaData): MetaData {
    // could happen if request of coin to receive meta data failed
    if (meta.ratesTo$ === undefined) {
        meta.unit = backup.unit;
        meta.ratesTo$ = backup.ratesTo$;
    }
    return meta;
}
