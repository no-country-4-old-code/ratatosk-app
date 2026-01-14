import {firestoreApi} from '../../../../../shared-backend-library/src/firestore/lib/api';
import {MetaData} from '../../../../../../shared-library/src/datatypes/meta';
import {UserData} from '../../../../../../shared-library/src/datatypes/user';
import {
    getDocHistory,
    getDocPortfolioWallet,
    getDocSnapshots,
    getDocUser
} from '../../../../../../shared-library/src/backend-interface/firestore/documents';
import {CoinHistoryStorage} from '../interfaces';
import {createBucket} from '../../../../../../shared-library/src/functions/general/types';
import {AssetIdCoin} from '../../../../../../shared-library/src/asset/assets/coin/interfaces';
import {Storage} from '../../../../../../shared-library/src/datatypes/data';
import {lookupAssetFactory} from '../../../../../../shared-library/src/asset/lookup-asset-factory';
import {compressUser} from '../../../../../../shared-library/src/functions/compress/compress-user';
import {PortfolioWallet} from '../../../../../../shared-library/src/datatypes/portfolio';

export function writeCoinSnapshots(meta: MetaData, history: CoinHistoryStorage, newStorage: Storage<'coin', 'SNAPSHOT'>): Promise<any> {
    const db = firestoreApi.getDb();
    const doc = getDocSnapshots(db);
    const compressed = lookupAssetFactory['coin'].compressStorageSnapshot(newStorage);
    const bucket = createBucket<'coin', 'COMPRESSED_SNAPSHOT'>(meta, compressed);
    return doc.set(bucket);
}

export function writeCoinHistoryForEachId(meta: MetaData, history: CoinHistoryStorage, ids: AssetIdCoin[]): Promise<any> {
    const promises: Promise<any>[] = [];
    const db = firestoreApi.getDb();
    ids.forEach((id: AssetIdCoin) => {
        const compressed = lookupAssetFactory['coin'].compressHistory(history[id]);
        const bucket = createBucket<'coin', 'COMPRESSED_SINGLE_HISTORY'>(meta, compressed);
        const idStr = id.toString();
        const promiseWrite = getDocHistory(db, idStr).set(bucket);
        promises.push(promiseWrite);
    });
    return Promise.all(promises);
}

export function writeUser(userId: string, userData: UserData): Promise<any> {
    const db = firestoreApi.getDb();
    const doc = getDocUser(db, userId);
    const compressed = compressUser(userData);
    return doc.set(compressed);
}

export function writePortfolio(userId: string, wallet: PortfolioWallet): Promise<any> {
    const db = firestoreApi.getDb();
    const doc = getDocPortfolioWallet(db, userId);
    const compressed = wallet; //compressUser(userData); // TODO: Compress Portfolio
    return doc.set(compressed);
}