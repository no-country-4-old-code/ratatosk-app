import {useFirestoreMock} from '../../../../../shared-backend-library/src/test-utils/firestore-mock/use-firestore-mock';
import {updateNumberOfUsers} from '../../../src/functions/user/update-number-of-users';
import {readNumberOfUsers} from '../../../src/helper/firestore/read';
import {
    getCollectionNumberOfUsersDebounceDecrement,
    getCollectionNumberOfUsersDebounceIncrement
} from '../../../src/helper/firestore/documents';
import {firestoreApi} from '../../../../../shared-backend-library/src/firestore/lib/api';

interface NumericIncrementTransform {
    operand: number;
}

describe('Test update of number of users', function () {
    const eventA = 'miAu';
    const eventB = 'B';
    //const mathRandomTriggerCleanUp = 0.005;
    const mathRandomNotTriggerCleanUp = 1;
    const mathRandomReturnContainer = {returnValue: mathRandomNotTriggerCleanUp};

    function readLastWrittenDelta(): Promise<number> {
        return readNumberOfUsers().then(obj => (obj as any as NumericIncrementTransform).operand);
    }

    function map2ZeroIfError(call: () => Promise<number>): Promise<number> {
        // return 0 if .where-mock throws error
        try {
            return call();
        } catch (e) {
            return new Promise((resolve) => resolve(0));
        }
    }

    function getNumberOfDebounceTokenIncr(): Promise<number> {
        const debounceEventsIncrement = getCollectionNumberOfUsersDebounceIncrement(firestoreApi.getDb());
        const queryCall = () => debounceEventsIncrement.where('createdAt', '!=', 0).get().then((data: any) => data.docs.length);
        return map2ZeroIfError(queryCall);
    }

    function getNumberOfDebounceTokenDecr(): Promise<number> {
        const debounceEventsDecrement = getCollectionNumberOfUsersDebounceDecrement(firestoreApi.getDb());
        const queryCall = () => debounceEventsDecrement.where('createdAt', '!=', 0).get().then((data: any) => data.docs.length);
        return map2ZeroIfError(queryCall);
    }

    async function expectDeltaAndTokens(expectedDelta: number, expectedNumberTokensIncr: number, expectedNumberTokensDecr: number): Promise<void> {
        const lastWrittenDelta = await readLastWrittenDelta();
        const numberOfDebounceTokenForIncrement = await getNumberOfDebounceTokenIncr();
        const numberOfDebounceTokenForDecrement = await getNumberOfDebounceTokenDecr();
        expect(lastWrittenDelta).toEqual(expectedDelta);
        expect(numberOfDebounceTokenForIncrement).toEqual(expectedNumberTokensIncr);
        expect(numberOfDebounceTokenForDecrement).toEqual(expectedNumberTokensDecr);
    }

    beforeEach(function () {
        mathRandomReturnContainer.returnValue = mathRandomNotTriggerCleanUp;
        useFirestoreMock();
        spyOn(Math, 'random').and.callFake(() => mathRandomReturnContainer.returnValue);
    });

    it('should increment number of users by 1', async function () {
        await updateNumberOfUsers(eventA, 1);
        await expectDeltaAndTokens(1, 1, 0);
    });

    it('should increment number of users by 2', async function () {
        await updateNumberOfUsers(eventA, 2);
        await expectDeltaAndTokens(2, 1, 0);
    });

    it('should decrement number of users by 1', async function () {
        await updateNumberOfUsers(eventA, -1);
        await expectDeltaAndTokens(-1, 0, 1);
    });

    it('should debounce increment', async function () {
        await updateNumberOfUsers(eventA, 1);
        await updateNumberOfUsers(eventA, 4);
        await expectDeltaAndTokens(1, 1, 0);
    });

    it('should debounce increment of different eventIds independent', async function () {
        await updateNumberOfUsers(eventA, 1);
        await updateNumberOfUsers(eventB, 4);
        await expectDeltaAndTokens(4, 2, 0);
    });

    it('should debounce decrement', async function () {
        await updateNumberOfUsers(eventA, -1);
        await updateNumberOfUsers(eventA, -4);
        await expectDeltaAndTokens(-1, 0, 1);
    });

    it('should debounce decrement of different eventIds independent', async function () {
        await updateNumberOfUsers(eventA, -1);
        await updateNumberOfUsers(eventB, -4);
        await expectDeltaAndTokens(-4, 0, 2);
    });

    it('should debounce increment and decrement independent from each other', async function () {
        await updateNumberOfUsers(eventA, 1);
        await updateNumberOfUsers(eventA, -1);
        await expectDeltaAndTokens(-1, 1, 1);
    });
});