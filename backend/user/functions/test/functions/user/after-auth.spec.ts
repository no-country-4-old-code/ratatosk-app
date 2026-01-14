import {
    useFirestoreMock,
    useFirestoreMockExternalDb
} from '../../../../../shared-backend-library/src/test-utils/firestore-mock/use-firestore-mock';
import {handleUserAfterAuth} from '../../../src/functions/user/after-auth';
import {
    getDocAssignedFirebaseProject,
    getDocUser
} from '../../../../../../shared-library/src/backend-interface/firestore/documents';
import {firestoreApi} from '../../../../../shared-backend-library/src/firestore/lib/api';
import {hashFnv32a} from '../../../../../../shared-library/src/functions/hash';
import {firebaseConfigurations} from '../../../../../../shared-library/src/settings/firebase-projects';
import {readUser} from '../../../src/helper/firestore/read';

describe('Test user management after authentication', function () {
    const exampleUid = '123456789abc';
    const exampleEmail = 'miau@wuff.de';
    let exampleHash: string;
    let firestoreUser: any;
    let firestoreSchedule: any;
    let spyOnDelete: jasmine.Spy;

    beforeEach(function () {
        exampleHash = hashFnv32a(exampleEmail);
        firestoreUser = useFirestoreMock();
        firestoreSchedule = useFirestoreMockExternalDb();
        const authMock: any = {deleteUser: async (uid: string) => {console.log('Get ', uid);}};
        spyOn(firestoreApi, 'getAuth').and.returnValue(authMock);
        spyOnDelete = spyOn(authMock, 'deleteUser').and.callThrough();
    });

    async function writeScheduleEntry(hash: string, project: string): Promise<void> {
        const doc = getDocAssignedFirebaseProject(firestoreSchedule, hash);
        doc.set({project});
    }

    async function expectUserDataExists(expected: boolean): Promise<void> {
        const handle = await getDocUser(firestoreUser, exampleUid);
        const doc = await handle.get();
        expect(doc.exists).toEqual(expected);
    }

    it('should delete user if no record for users email/hash exists in scheduler database', async function () {
        await handleUserAfterAuth(exampleUid, exampleEmail);
        await expectUserDataExists(false);
        expect(spyOnDelete).toHaveBeenCalledOnceWith(exampleUid);
    });


    it('should delete user if no matching record for users email/hash exists in scheduler database', async function () {
        await writeScheduleEntry(exampleHash, 'USER_002');
        process.env.GCLOUD_PROJECT = firebaseConfigurations['USER_001'].projectId;
        await handleUserAfterAuth(exampleUid, exampleEmail);
        await expectUserDataExists(false);
        expect(spyOnDelete).toHaveBeenCalledOnceWith(exampleUid);
    });

    it('should create user data if matching record for users email/hash exists in scheduler database', async function () {
        await writeScheduleEntry(exampleHash, 'USER_001');
        process.env.GCLOUD_PROJECT = firebaseConfigurations['USER_001'].projectId;
        await handleUserAfterAuth(exampleUid, exampleEmail);
        await expectUserDataExists(true);
        const user = await readUser(exampleUid);
        expect(user.scans.length).toBeGreaterThanOrEqual(0);
        expect(spyOnDelete).toHaveBeenCalledTimes(0);
    });
});