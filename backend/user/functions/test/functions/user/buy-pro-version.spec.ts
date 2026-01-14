import {useFirestoreMock} from '../../../../../shared-backend-library/src/test-utils/firestore-mock/use-firestore-mock';
import {writeUser} from '../../../src/helper/firestore/write';
import {createDummyUserData} from '../../../../../../shared-library/src/functions/test-utils/dummy-data/user';
import {buyProVersion, getDateIncreasedByHalfYear} from '../../../src/functions/user/buy-pro-version';
import {spyOnGeckoRequestVerifiedUserId} from '../../test-utils/mocks/gecko/spy-on-gecko';
import {readNumberOfProUsers, readUser} from '../../../src/helper/firestore/read';
import {disableConsoleLog} from '../../test-utils/disable-console-log';
import {cancelProVersion} from '../../../src/functions/user/cancel-pro-version';
import {firestoreApi} from '../../../../../shared-backend-library/src/firestore/lib/api';
import {demoUID} from '../../../../../../shared-library/src/settings/firebase-projects';
import {getDocNumberOfProUsers} from '../../../../../shared-backend-library/src/firestore/documents';
import {CountNumberOfDocs} from '../../../../../shared-backend-library/src/firestore/interfaces';

// TODO: Enable if Stripe is enabled
xdescribe('Test buy and cancel lifecycle of pro account', function () {
    const uidAlice = 'alice';
    const uidBob = 'bob';
    const token = 'someIdToken';

    async function writeNumberOfProUsers(n: number): Promise<void> {
        const db = firestoreApi.getDb();
        const doc = getDocNumberOfProUsers(db);
        const data: CountNumberOfDocs = {numberOfDocs: {operand: n} as any as number}; // compatible to NumericIncrementTransform
        return doc.set(data);
    }

    async function readNumberOfProUsersWrapped(): Promise<number> {
        return readNumberOfProUsers().then(n => (n as any).operand);
    }

    beforeEach(async function () {
        disableConsoleLog();
        useFirestoreMock();
        await writeUser(uidAlice, createDummyUserData());
        await writeUser(uidBob, createDummyUserData());
        await writeUser(demoUID, createDummyUserData());
        await writeNumberOfProUsers(0);
    });

    describe('Test buy ', function () {
        const oneHourInMs = 1000 * 60 * 60;
        const oneDayInMs = oneHourInMs * 24;
        const halfYearInMs = oneDayInMs * 365 / 2;
        const halfYearLater = Date.now() + halfYearInMs;

        function getProUntil(uid: string): Promise<number> {
            return readUser(uid).then(user => user.pro.useProVersionUntil);
        }

        it('should have pro until time of zero and zero pro users at the beginning', async function () {
            expect(await getProUntil(demoUID)).toEqual(0);
            expect(await getProUntil(uidAlice)).toEqual(0);
            expect(await getProUntil(uidBob)).toEqual(0);
            expect(await readNumberOfProUsersWrapped()).toEqual(0);
        });

        it('should set pro-flag to true and increase number of pro users after buy if user verified', async function () {
            const spy = spyOnGeckoRequestVerifiedUserId(uidAlice);
            await buyProVersion(token);
            expect(spy).toHaveBeenCalledTimes(1);
            expect(await getProUntil(uidAlice)).toBeGreaterThanOrEqual(halfYearLater);
            expect(await getProUntil(uidAlice)).toBeLessThan(halfYearLater + oneDayInMs * 2);
            expect(await getProUntil(uidBob)).toEqual(0);
            expect(await readNumberOfProUsersWrapped()).toEqual(1);
        });

        it('should not allow demo user to buy pro version', async function () {
            spyOnGeckoRequestVerifiedUserId(demoUID);
            await buyProVersion(token);
            expect(await getProUntil(demoUID)).toEqual(0);
            expect(await getProUntil(uidAlice)).toEqual(0);
            expect(await getProUntil(uidBob)).toEqual(0);
            expect(await readNumberOfProUsersWrapped()).toEqual(0);
        });

        it('should not change user data if buy event occur and pro is already active', async function () {
            const newUseProUntil = halfYearLater + 1234567890;
            spyOnGeckoRequestVerifiedUserId(uidAlice);
            await buyProVersion(token);
            const user = await readUser(uidAlice);
            user.pro.useProVersionUntil = newUseProUntil;
            await writeUser(uidAlice, {...user});
            await buyProVersion(token);
            await buyProVersion(token);
            await buyProVersion(token);
            expect(await getProUntil(uidAlice)).toEqual(newUseProUntil);
            expect(await readNumberOfProUsersWrapped()).toEqual(1);
        });

        it('should skip if user is already a pro', async function () {
            const newUseProUntil = halfYearLater + 1234567890;
            spyOnGeckoRequestVerifiedUserId(uidAlice);
            const user = await readUser(uidAlice);
            user.pro.useProVersionUntil = newUseProUntil;
            await writeUser(uidAlice, {...user});
            await buyProVersion(token);
            expect(await getProUntil(uidAlice)).toEqual(newUseProUntil);
            expect(await readNumberOfProUsersWrapped()).toEqual(0);
        });

        describe('Test increase of date by 6 month', function () {

            function actDate(date: Date, expectedDate: Date): void {
                const result = getDateIncreasedByHalfYear(date);
                expect(result.toString()).toEqual(expectedDate.toString());
            }

            it('should add 6 months', function () {
                actDate(new Date(2020, 0, 1), new Date(2020, 6, 1));
                actDate(new Date(2020, 0, 2), new Date(2020, 6, 2));
                actDate(new Date(2020, 0, 31), new Date(2020, 6, 31));
                actDate(new Date(2020, 1, 1), new Date(2020, 7, 1));
                actDate(new Date(2020, 1, 2), new Date(2020, 7, 2));
                actDate(new Date(2020, 5, 30), new Date(2020, 11, 30));
            });

            it('should handle day overflow (from 31 day month to 30 day month & via versa)', function () {
                actDate(new Date(2020, 2, 31), new Date(2020, 8, 30));
                actDate(new Date(2020, 3, 30), new Date(2020, 9, 30));
            });

            it('should handle month overflow (step into next year)', function () {
                actDate(new Date(2020, 6, 1), new Date(2021, 0, 1));
                actDate(new Date(2020, 6, 2), new Date(2021, 0, 2));
                actDate(new Date(2020, 6, 31), new Date(2021, 0, 31));
                actDate(new Date(2020, 7, 30), new Date(2021, 1, 28));
            });

        });
    });

    describe('Test cancel', function () {

        function getProCanceled(uid: string): Promise<boolean> {
            return readUser(uid).then(user => user.pro.hasCanceledProVersion);
        }

        it('should start with canceled as true', async function () {
            expect(await getProCanceled(demoUID)).toEqual(true);
            expect(await getProCanceled(uidAlice)).toEqual(true);
            expect(await getProCanceled(uidBob)).toEqual(true);
        });

        it('should do nothing if canceled non-pro account', async function () {
            spyOnGeckoRequestVerifiedUserId(uidAlice);
            await cancelProVersion(token, true);
            await cancelProVersion(token, false);
            await cancelProVersion(token, false);
            expect(await getProCanceled(uidAlice)).toEqual(true);
        });

        it('should set cancel flag to false after buy', async function () {
            spyOnGeckoRequestVerifiedUserId(uidAlice);
            await buyProVersion(token);
            expect(await getProCanceled(uidAlice)).toEqual(false);
            expect(await getProCanceled(uidBob)).toEqual(true);
        });

        it('should set cancel flag to true if canceled after buy', async function () {
            spyOnGeckoRequestVerifiedUserId(uidAlice);
            await buyProVersion(token);
            await cancelProVersion(token, true);
            expect(await getProCanceled(uidAlice)).toEqual(true);
        });

        it('should reset cancel flag to false if re-canceled after buy', async function () {
            spyOnGeckoRequestVerifiedUserId(uidAlice);
            await buyProVersion(token);
            await cancelProVersion(token, true);
            await cancelProVersion(token, false);
            expect(await getProCanceled(uidAlice)).toEqual(false);
        });
    });
});
