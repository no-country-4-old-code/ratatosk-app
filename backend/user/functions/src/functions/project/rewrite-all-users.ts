import {firestoreApi} from '../../../../../shared-backend-library/src/firestore/lib/api';
import {getCollectionUser} from '../../../../../../shared-library/src/backend-interface/firestore/documents';

export async function rewriteAllUsers(): Promise<void> {
    // Rewrite updates user data to new compression mode
    // Careful ! Old Frontend might not decompress new compressed user data and crash !

    // TODO: Something is not working here - fix it later
    const db = firestoreApi.getDb();
    const snapshots = await getCollectionUser(db).get();
    const promises = snapshots.map((doc: any) => {
        console.log('--------- ');
        console.log('Id ', doc.id);
        console.log('Data ', doc.data());
        console.log('--------- ');
    });
    return Promise.all(promises).then();
}