import {writeUser} from '../../../helper/firestore/write';
import {UserData} from '../../../../../../../shared-library/src/datatypes/user';
import {firestoreApi} from '../../../../../../shared-backend-library/src/firestore/lib/api';

export function createInitialUserData(userId: string): Promise<any> {
    const userData = createInitialData();
    return writeUser(userId, userData);
}

// private

function createInitialData(): UserData {
    return {
        pro: {hasCanceledProVersion: true, useProVersionUntil: 0},
        settings: {currency: 'usd'},
        scans: [],  // no initial scans because it is confusing
        lastUserActivity: firestoreApi.getCurrentTimestampAsFieldValue(),
        pushIds: []
    };
}

