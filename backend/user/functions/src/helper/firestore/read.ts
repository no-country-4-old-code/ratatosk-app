import {firestoreApi} from '../../../../../shared-backend-library/src/firestore/lib/api';
import {UserData} from '../../../../../../shared-library/src/datatypes/user';
import {
    getDocPortfolioWallet,
    getDocUser
} from '../../../../../../shared-library/src/backend-interface/firestore/documents';
import {decompressUser} from '../../../../../../shared-library/src/functions/compress/compress-user';
import {PortfolioWallet} from '../../../../../../shared-library/src/datatypes/portfolio';
import {
    getDocNumberOfProUsers,
    getDocNumberOfUsers
} from '../../../../../shared-backend-library/src/firestore/documents';
import {CountNumberOfDocs} from '../../../../../shared-backend-library/src/firestore/interfaces';
import {readDoc} from '../../../../../shared-backend-library/src/firestore/read';

export function readUser(userId: string): Promise<UserData> {
    const db = firestoreApi.getDb();
    return readDoc(getDocUser(db, userId)).then(user => decompressUser(user));
}

export function readPortfolioWallet(userId: string): Promise<PortfolioWallet> {
    const db = firestoreApi.getDb();
    return readDoc(getDocPortfolioWallet(db, userId)).then(wallet => wallet); // TODO: add decompression
}

export function readNumberOfUsers(): Promise<number> {
    const db = firestoreApi.getDb();
    return readDoc(getDocNumberOfUsers(db)).then((counter: CountNumberOfDocs) => counter.numberOfDocs as number);
}

export function readNumberOfProUsers(): Promise<number> {
    const db = firestoreApi.getDb();
    return readDoc(getDocNumberOfProUsers(db)).then((counter: CountNumberOfDocs) => counter.numberOfDocs as number);
}
