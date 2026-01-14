import {firestoreApi} from '../../../../../shared-backend-library/src/firestore/lib/api';
import {
    getDocPortfolioWallet,
    getDocUser
} from '../../../../../../shared-library/src/backend-interface/firestore/documents';

export function deleteUser(userId: string): Promise<any> {
    const db = firestoreApi.getDb();
    const doc = getDocUser(db, userId);
    return doc.delete();
}

export function deletePortfolioWallet(userId: string): Promise<any> {
    const db = firestoreApi.getDb();
    const doc = getDocPortfolioWallet(db, userId);
    return doc.delete();
}
