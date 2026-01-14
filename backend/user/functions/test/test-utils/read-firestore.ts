// only in test because not needed for production
import {Meta} from '../../../../../shared-library/src/datatypes/meta';
import {getDocHistory, getDocSnapshots} from '../../../../../shared-library/src/backend-interface/firestore/documents';
import {firestoreApi} from '../../../../shared-backend-library/src/firestore/lib/api';
import {AssetIdCoin} from '../../../../../shared-library/src/asset/assets/coin/interfaces';
import {Bucket, History, Storage} from '../../../../../shared-library/src/datatypes/data';
import {assetCoin} from '../../../../../shared-library/src/asset/lookup-asset-factory';

export function readStorageAllCoins(): Promise<Meta<Storage<'coin', 'SNAPSHOT'>>> {
    const db = firestoreApi.getDb();
    return readDoc(getDocSnapshots(db)).then((bucket: Bucket<'coin', 'COMPRESSED_SNAPSHOT'>) => {
        return {meta: bucket.meta, payload: assetCoin.decompressStorageSnapshot(bucket.payload)};
    });
}

export function readStorageCoinHistory(id: AssetIdCoin): Promise<Meta<History<'coin'>>> {
    const db = firestoreApi.getDb();
    return readDoc(getDocHistory(db, id)).then((bucket: Bucket<'coin', 'COMPRESSED_SINGLE_HISTORY'>) => {
        return {meta: bucket.meta, payload: assetCoin.decompressHistory(bucket.payload)};
    });
}

// private

function readDoc(doc: any): Promise<any> {
    // DocumentReference seems to be a mess as type
    return doc.get().then((data: any) => {
        return data.data();
    });
}
