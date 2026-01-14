import {firestoreApi} from '../../../../../shared-backend-library/src/firestore/lib/api';
import {
    getDocNumberOfProUsers,
    getDocNumberOfUsers
} from '../../../../../shared-backend-library/src/firestore/documents';
import {CountNumberOfDocs} from '../../../../../shared-backend-library/src/firestore/interfaces';

export async function initFirebaseProject() {
    const db = firestoreApi.getDb();
    await createDocNumberOfUsers(db);
    await createDocNumberOfProUsers(db);
}

// private

async function createDocNumberOfUsers(db: any): Promise<void> {
    const doc = await getDocNumberOfUsers(db);
    return initNumberOf(doc, 'NumberOfUsers');
}

async function createDocNumberOfProUsers(db: any): Promise<void> {
    const doc = await getDocNumberOfProUsers(db);
    return initNumberOf(doc, 'NumberOfProUsers');
}



async function initNumberOf(doc: any, name: string): Promise<void> {
    const count: CountNumberOfDocs = {numberOfDocs: 0};
    try {
        doc.create(count);
    } catch (e) {
        console.log(`Document ${name} already exist`, e.message);
    }
}