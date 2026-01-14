import {readUser} from '../../helper/firestore/read';
import {UserData} from '../../../../../../shared-library/src/datatypes/user';
import {writeUser} from '../../helper/firestore/write';
import {firestoreApi} from '../../../../../shared-backend-library/src/firestore/lib/api';
import {updateNumberOfProUsers} from './helper/update-number-of-pro-users';
import {isPro} from '../../../../../../shared-library/src/functions/is-pro';
import {demoUID} from '../../../../../../shared-library/src/settings/firebase-projects';


export async function cancelProVersion(idToken: string, setCanceled: boolean): Promise<void> {
    const uid = await firestoreApi.requestVerifiedUserId(idToken);
    if (uid && uid !== demoUID) {
        const userData: UserData = await readUser(uid);
        if (isPro(userData)) {
            userData.pro.hasCanceledProVersion = setCanceled;
            // TODO: only for debugging to see how pro version is outdated ! Should not occur in real later
            if (setCanceled) {
                userData.pro.useProVersionUntil = Date.now() + 1000 * 60; // let him use pro version one minute
            } else {
                userData.pro.useProVersionUntil = getDateNextYear().getTime();
            }
            // ---
            await writeUser(uid, userData);
            // TODO: add maintainProStatus periodic function with extend useProVersionUntil and decrement number of pro users
            if (setCanceled) {
                await updateNumberOfProUsers(-1);
            } else {
                await updateNumberOfProUsers(1);
            }
        } else {
            console.error('User is no pro', userData);
        }
    }
}

function getDateNextYear(): Date {
    const date = new Date();
    const nextYear = date.getUTCFullYear() + 1;
    date.setUTCFullYear(nextYear);
    return date;
}
