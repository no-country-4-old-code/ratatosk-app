import {getCollectionCount} from '../../../../../shared-backend-library/src/firestore/documents';

export function getCollectionNumberOfUsersDebounceIncrement(firestore: any): any {
    return getDocCountEvents(firestore).collection('increment_user');
}

export function getCollectionNumberOfUsersDebounceDecrement(firestore: any): any {
    return getDocCountEvents(firestore).collection('decrement_user');
}

// collections

function getDocCountEvents(firestore: any): any {
    return getCollectionCount(firestore).doc('debounce');
}
