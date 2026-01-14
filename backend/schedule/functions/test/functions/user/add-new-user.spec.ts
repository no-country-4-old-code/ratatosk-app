import {spyOnRecaptchaVerify} from '../../test-utils/mocks/recaptcha/spy-on-recaptcha';
import {addNewUser} from '../../../src/functions/user/add-new-user';
import {RequestAddNewUser} from '../../../../../../shared-library/src/backend-interface/cloud-functions/interfaces';
import {
    useFirestoreMockExternalDb
} from '../../../../../shared-backend-library/src/test-utils/firestore-mock/use-firestore-mock';
import {hashFnv32a} from '../../../../../../shared-library/src/functions/hash';
import {existsDocAssignedFirebaseProject} from '../../../../../shared-backend-library/src/firestore/exists';
import {writeNumberOfUsers} from '../../test-utils/write-number-of-users';

describe('Test adding a new user', function () {
    const exampleEmail = 'qwert.trewq@asd.dsa';
    const exampleToken = '123456789101112131415abcdef';
    const exampleIp = '192.168.0.0';
    const hashOfExampleEmail = hashFnv32a(exampleEmail);
    const minReCaptchScore = 0.3;
    const maxNumberOfUsers = 20000;
    let request: RequestAddNewUser;
    let spyVerify: jasmine.Spy;
    let mockFirestore: any;

    beforeEach(async function () {
        request = {email: exampleEmail, token: exampleToken};
        mockFirestore = useFirestoreMockExternalDb();
    });

    async function act(expectedSuccess: boolean, exspectedPartialMsg?: string) {
        const response = await addNewUser(request, exampleIp);
        await expectDocAssignedDbExists(hashOfExampleEmail, expectedSuccess);
        expect(spyVerify).toHaveBeenCalledOnceWith(exampleToken, exampleIp);
        expect(response.success).toEqual(expectedSuccess);
        if (exspectedPartialMsg) {
            expect(response.msg).toContain(exspectedPartialMsg);
        } else {
            expect(response.msg).toBeUndefined();
        }
    }

    function expectDocAssignedDbExists(hash: string, expectExists: boolean): Promise<void> {
        return existsDocAssignedFirebaseProject(hash).then(exists => expect(exists).toEqual(expectExists));
    }

    it('should assign new user to database and create a document based on email hash as record', async () => {
        spyVerify = spyOnRecaptchaVerify({success: true, score: minReCaptchScore});
        await writeNumberOfUsers(mockFirestore, maxNumberOfUsers - 1);
        await act(true);
    });

    it('should assign first new user to database and create a document based on email hash as record', async () => {
        spyVerify = spyOnRecaptchaVerify({success: true, score: minReCaptchScore});
        await writeNumberOfUsers(mockFirestore, 0);
        await act(true);
    });

    it(`should not assign new user to database if recaptcha verify returns a score less ${minReCaptchScore}`, async () => {
        spyVerify = spyOnRecaptchaVerify({success: true, score: minReCaptchScore - 0.01});
        await writeNumberOfUsers(mockFirestore, maxNumberOfUsers - 1);
        await act(false, 'score');
    });

    it('should not assign new user to database if recaptcha verify fails', async () => {
        const exampleErrorReason = 'miau 1234 ü';
        spyVerify = spyOnRecaptchaVerify({success: true, 'error-codes': [exampleErrorReason]});
        await writeNumberOfUsers(mockFirestore, maxNumberOfUsers - 1);
        await act(false, exampleErrorReason);
    });

    it('should not assign new user to database if number of users is equal to threshold', async () => {
        spyVerify = spyOnRecaptchaVerify({success: true, score: minReCaptchScore});
        await writeNumberOfUsers(mockFirestore, maxNumberOfUsers);
        await act(false, 'reached the user limit');
    });

    it('should not assign new user to database if number of users is above threshold', async () => {
        spyVerify = spyOnRecaptchaVerify({success: true, score: minReCaptchScore});
        await writeNumberOfUsers(mockFirestore, maxNumberOfUsers + 1);
        await act(false, 'reached the user limit');
    });

    it('should not assign new user to database if no database was readable', async () => {
        spyVerify = spyOnRecaptchaVerify({success: true, score: minReCaptchScore});
        await act(false, 'Internal error during verification');
    });
});