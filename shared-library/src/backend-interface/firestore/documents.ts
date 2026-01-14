import {AssetType} from '../../asset/interfaces-asset';

export function getDocUser(firestore: any, id: string): any {
    return getCollectionUser(firestore).doc(id);
}

export function getDocPortfolioWallet(firestore: any, id: string): any {
    return getCollectionPortfolio(firestore).doc(id);
}

export function getDocHistory(firestore: any, id: string, asset: AssetType = 'coin'): any {
    return getCollectionPublic(firestore).doc('history').collection(asset).doc(id);
}

export function getDocSnapshots(firestore: any, asset: AssetType = 'coin'): any {
    return getCollectionPublic(firestore).doc('snapshots').collection(asset).doc('all');
}

export function getDocAssignedFirebaseProject(firestore: any, hash: string): any {
    // only in project SCHEDULED
    return getCollectionPrivate(firestore).doc(hash);
}

// collections

function getCollectionPublic(firestore: any): any {
    return firestore.collection('public');
}

export function getCollectionUser(firestore: any): any {
    return firestore.collection('users');
}

export function getCollectionPortfolio(firestore: any): any {
    return firestore.collection('portfolio');
}

export function getCollectionPrivate(firestore: any): any {
    return firestore.collection('private');
}