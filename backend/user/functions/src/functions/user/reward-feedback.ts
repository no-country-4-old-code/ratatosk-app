import {readUserDataByToken} from '../scan/helper/read/user/read-user-data';
import {UserData} from '../../../../../../shared-library/src/datatypes/user';
import {Feedback} from '../../../../../../shared-library/src/settings/feedback';
import {firestoreApi} from '../../../../../shared-backend-library/src/firestore/lib/api';
import {isPro} from '../../../../../../shared-library/src/functions/is-pro';
import {writeUser} from '../../helper/firestore/write';
import {Request} from 'firebase-functions/lib/providers/https';
import {RequestUserToken} from '../../../../../../shared-library/src/backend-interface/cloud-functions/interfaces';


export function parseRewardFeedbackRequest(req: Request): RequestUserToken {
    return {token: req.query.token as string};
}

export async function rewardFeedback(idToken: string): Promise<void> {
    return readUserDataByToken(idToken, false).then(info => {
        const feedback = new Feedback();
        rewardFeedbackIfValid(info.uid, info.user, feedback);
    });
}

export async function rewardFeedbackIfValid(uid: string, user: UserData, feedback: Feedback): Promise<void> {
    if (! feedback.isFeedbackEnabled()) {
        throw new Error('Feedback is currently not enabled');
    }

    if (feedback.hasGivenFeedback(user.feedback)) {
        throw new Error(`User has already given feedback @${user.feedback}`);
    }

    await updateFeedbackAndPro(uid, user);
}

// private

function updateFeedbackAndPro(uid: string, user: UserData): Promise<void> {
    const timestamp = firestoreApi.getCurrentTimestampMs();
    user.feedback = timestamp;
    user.pro.useProVersionUntil = getNewProTimestamp(user, timestamp);
    return writeUser(uid, user);
}

function getNewProTimestamp(user: UserData, timestampFeedback: number): number {
    const additionalProTime = getRewaredProTimeInMs();
    if( isPro(user) ) {
        return user.pro.useProVersionUntil + additionalProTime;
    } else {
        return timestampFeedback + additionalProTime;
    }
}

function getRewaredProTimeInMs(): number {
    const feedback = new Feedback();
    const factorWeek2Ms = 7 * 24 * 60 * 60 * 1000;
    return feedback.getNumberOfProWeeks() * factorWeek2Ms;
}