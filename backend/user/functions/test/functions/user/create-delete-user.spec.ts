import {useFirestoreMock} from '../../../../../shared-backend-library/src/test-utils/firestore-mock/use-firestore-mock';
import {readUser} from '../../../src/helper/firestore/read';
import {disableConsoleLog} from '../../test-utils/disable-console-log';
import {createInitialUserData} from '../../../src/functions/user/helper/create-user';
import {deleteUserData} from '../../../src/functions/user/delete-user';
import {haveAsyncFunctionThrownError} from '../../../../../../shared-library/src/functions/test-utils/expect-async';

describe('Test create and delete of user', function () {
    const uidAlice = 'alice';

    beforeEach(async function () {
        disableConsoleLog();
        useFirestoreMock();
    });

    async function readUserAlice(): Promise<any> {
        const user = await readUser(uidAlice);
        return user;
    }

    it('should start with no user data', async function () {
        const hasThrownError = await haveAsyncFunctionThrownError(readUserAlice);
        expect(hasThrownError).toBeTruthy();
    });

    it('should create user data', async function () {
        await createInitialUserData(uidAlice);
        const hasThrownError = await haveAsyncFunctionThrownError(readUserAlice);
        expect(hasThrownError).toBeFalsy();
    });

    it('should delete user data', async function () {
        await createInitialUserData(uidAlice);
        await deleteUserData(uidAlice);
        const hasThrownError = await haveAsyncFunctionThrownError(readUserAlice);
        expect(hasThrownError).toBeTruthy();
    });
});
