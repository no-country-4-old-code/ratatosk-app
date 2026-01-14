export function getDocNumberOfUsers(firestore: any): any {
    return getCollectionCount(firestore).doc('number_of_users');
}

export function getDocNumberOfProUsers(firestore: any): any {
    return getCollectionCount(firestore).doc('number_of_pro_users');
}

export function getCollectionCount(firestore: any): any {
    return firestore.collection('count');
}
