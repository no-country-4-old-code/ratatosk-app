import {readUser} from '../../helper/firestore/read';
import {UserData, UserProStatus} from '../../../../../../shared-library/src/datatypes/user';
import {writeUser} from '../../helper/firestore/write';
import {firestoreApi} from '../../../../../shared-backend-library/src/firestore/lib/api';
import {updateNumberOfProUsers} from './helper/update-number-of-pro-users';
import {isPro} from '../../../../../../shared-library/src/functions/is-pro';
import {demoUID} from '../../../../../../shared-library/src/settings/firebase-projects';


export async function buyProVersion(idToken: string): Promise<void> {
    const uid = await firestoreApi.requestVerifiedUserId(idToken);
    console.log('Get user id ', uid);
    if (uid && uid !== demoUID) {
        const userData: UserData = await readUser(uid);
        if (isPro(userData)) {
            console.error('User is already a pro !', userData);
        } else {
            userData.pro = getNewProStatus();
            await writeUser(uid, userData);
            await updateNumberOfProUsers(1);
        }
    }
}

// private

function getNewProStatus(): UserProStatus {
    const date = new Date();
    const dateNextYear = getDateIncreasedByHalfYear(date);
    return {useProVersionUntil: dateNextYear.getTime(), hasCanceledProVersion: false};
}

export function getDateIncreasedByHalfYear(date: Date): Date {
    return addMonths(new Date(date), 6);
}

function addMonths(date: Date, months: number): Date {
    const dCopy = date.getDate();
    date.setMonth(date.getMonth() + +months);
    if (date.getDate() != dCopy) {
        date.setDate(0);
    }
    return date;
}
