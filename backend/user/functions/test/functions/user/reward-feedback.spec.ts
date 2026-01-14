import {Feedback} from '../../../../../../shared-library/src/settings/feedback';
import {createDummyUserData} from '../../../../../../shared-library/src/functions/test-utils/dummy-data/user';
import {haveAsyncFunctionThrownError} from '../../../../../../shared-library/src/functions/test-utils/expect-async';
import {UserData} from '../../../../../../shared-library/src/datatypes/user';
import {rewardFeedbackIfValid} from '../../../src/functions/user/reward-feedback';
import {useFirestoreMock} from '../../../../../shared-backend-library/src/test-utils/firestore-mock/use-firestore-mock';
import {firestoreApi} from '../../../../../shared-backend-library/src/firestore/lib/api';
import {readUser} from '../../../src/helper/firestore/read';

describe('Test reward feedback', function () {
    const uid = 'alice';
    let feedback: Feedback;
    let user: UserData;

    beforeEach(async function () {
        useFirestoreMock();
        feedback = new Feedback();
        user = createDummyUserData();
        user.feedback = 0;
    });

    function setSpies(isFeedbackEnabled: boolean, hasGivenFeedback: boolean) {
        spyOn(feedback, 'isFeedbackEnabled').and.returnValue(isFeedbackEnabled);
        spyOn(feedback, 'hasGivenFeedback').and.returnValue(hasGivenFeedback);
    }

    describe('Content', function () {
        const numberOfProWeeks = new Feedback().getNumberOfProWeeks();
        const mapWeek2Ms = 7 * 24 * 60 * 60 * 1000;
        const numberOfProWeeksInMs = mapWeek2Ms * numberOfProWeeks;
        const currentTimestamp = 10000000000;

        beforeEach(function () {
            setSpies(true, false);
            spyOn(feedback, 'getNumberOfProWeeks').and.returnValue(numberOfProWeeks);
            spyOn(firestoreApi, 'getCurrentTimestampMs').and.returnValue(currentTimestamp);
            spyOn(Date, 'now').and.returnValue(currentTimestamp);
        });

        async function runContent(): Promise<UserData> {
            await rewardFeedbackIfValid(uid, user, feedback);
            const userNew = await readUser(uid);
            expect(userNew.feedback).toEqual(currentTimestamp);
            return userNew;
        }

        it('test-check -> feedback-timestamp should be 0 by default', async function () {
            expect(user.feedback).toEqual(0);
        });

        it('should set feedback timestamp', async function () {
            await runContent();
        });

        it('should set pro version to current timestamp + rewarded time if user was never a pro before', async function () {
            user.pro.useProVersionUntil = 0;
            const userNew = await runContent();
            expect(userNew.pro.useProVersionUntil).toEqual(currentTimestamp + numberOfProWeeksInMs);
        });

        it('should set pro version to current timestamp + rewarded time if user is currently no pro', async function () {
            user.pro.useProVersionUntil = currentTimestamp - 1000;
            const userNew = await runContent();
            expect(userNew.pro.useProVersionUntil).toEqual(currentTimestamp + numberOfProWeeksInMs);
        });

        it('should extend pro version by rewarded time if user is pro', async function () {
            const extendedProTimeInMs = 1234567;
            user.pro.useProVersionUntil = currentTimestamp + extendedProTimeInMs;
            const userNew = await runContent();
            expect(userNew.pro.useProVersionUntil).toEqual(currentTimestamp + numberOfProWeeksInMs + extendedProTimeInMs);
        });
    });

    describe('Validation', function () {

        async function runErrorCheck(isErrorExpected: boolean) {
            const callback = () => rewardFeedbackIfValid(uid, user, feedback);
            const wasErrorThrown = await haveAsyncFunctionThrownError(callback);
            expect(wasErrorThrown).toEqual(isErrorExpected);
        }

        it('should throw error if no feedback round is active', async function () {
            setSpies(false, false);
            await runErrorCheck(true);
        });

        it('should throw error if user already has given feedback and feedback not enabled', async function () {
            setSpies(false, true);
            await runErrorCheck(true);
        });

        it('should throw no error if user has given no feedback and feedback is enabled', async function () {
            setSpies(true, false);
            await runErrorCheck(false);
        });

        it('should throw error if user already has given feedback', async function () {
            setSpies(true, true);
            await runErrorCheck(true);
        });
    });
});