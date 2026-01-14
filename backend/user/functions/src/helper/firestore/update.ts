import {UserData} from '../../../../../../shared-library/src/datatypes/user';
import {compressUser} from '../../../../../../shared-library/src/functions/compress/compress-user';
import {getDocUser} from '../../../../../../shared-library/src/backend-interface/firestore/documents';
import {firestoreApi} from '../../../../../shared-backend-library/src/firestore/lib/api';


export function updateUser(userId: string, userData: Partial<UserData>): Promise<any> {
    const db = firestoreApi.getDb();
    const doc = getDocUser(db, userId);
    const compressed = compressUser(userData);
    return doc.update(compressed);
}
