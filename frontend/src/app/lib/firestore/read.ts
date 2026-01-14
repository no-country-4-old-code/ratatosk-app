import {AngularFirestore} from '@angular/fire/firestore';
import {filter, map, shareReplay, tap} from 'rxjs/operators';
import {
    getDocHistory,
    getDocSnapshots,
    getDocUser
} from '../../../../../shared-library/src/backend-interface/firestore/documents';
import {UserData} from '../../../../../shared-library/src/datatypes/user';
import {from, Observable} from 'rxjs';
import {Meta} from '../../../../../shared-library/src/datatypes/meta';
import {AssetIdCoin} from '../../../../../shared-library/src/asset/assets/coin/interfaces';
import {Bucket, History} from '../../../../../shared-library/src/datatypes/data';
import {lookupAssetFactory} from '../../../../../shared-library/src/asset/lookup-asset-factory';
import {decompressUser} from '@shared_library/functions/compress/compress-user';

export function listenToBucketSnapshotCoin(firestore: AngularFirestore): Observable<Bucket<'coin', 'SNAPSHOT'>> {
    return listenToDoc(getDocSnapshots(firestore)).pipe(
        map(compressed => {
            const payload = lookupAssetFactory['coin'].decompressStorageSnapshot(compressed.payload);
            return {meta: compressed.meta, payload};
        }),
        shareReplay(1)
    );
}

export function listenToStorageHistory(firestore: AngularFirestore, id: AssetIdCoin): Observable<Meta<History<'coin'>>> {
    return listenToDoc(getDocHistory(firestore, id.toString())).pipe(
        map(compressed => {
            const payload = lookupAssetFactory['coin'].decompressHistory(compressed.payload);
            return {meta: compressed.meta, payload};
        }),
        shareReplay(1)
    );
}

export function listenToStorageUser(firestore: AngularFirestore, userId: string): Observable<UserData> {
    return listenToDoc(getDocUser(firestore, userId)).pipe(
        filter(compressed => compressed !== undefined), // otherwise it crashed when online
        map(compressed => decompressUser(compressed)),
        shareReplay(1)
    );
}

export function readBucketSnapshotCoin(firestore: AngularFirestore): Observable<Bucket<'coin', 'SNAPSHOT'>> {
    return readDoc(getDocSnapshots(firestore)).pipe(
        map(compressed => {
            const payload = lookupAssetFactory['coin'].decompressStorageSnapshot(compressed.payload);
            return {meta: compressed.meta, payload};
        }),
    );
}

export function readStorageHistoryCoin(firestore: AngularFirestore, id: AssetIdCoin): Observable<Meta<History<'coin'>>> {
    return readDoc(getDocHistory(firestore, id.toString())).pipe(
        map(compressed => {
            console.log('Read compressed');
            const payload = lookupAssetFactory['coin'].decompressHistory(compressed.payload);
            return {meta: compressed.meta, payload};
        }),
    );
}




// ------ private

function listenToDoc(doc: any): Observable<any> {
    return doc.valueChanges().pipe(
        tap(data => console.warn('Reload ', data)),
    );
}

function readDoc(doc: any): Observable<any> {
    return from(doc.get()).pipe(
        map((data: any) => data.data())
    );
}

