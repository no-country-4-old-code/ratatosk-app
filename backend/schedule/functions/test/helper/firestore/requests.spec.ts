import {
    useFirestoreMockExternalDb
} from '../../../../../shared-backend-library/src/test-utils/firestore-mock/use-firestore-mock';
import {writeAssignedFirebaseProject} from '../../../src/helper/firestore/write';
import {FirebaseUserProjectName} from '../../../../../../shared-library/src/datatypes/firebase-projects';
import {readAssignedFirebaseProject} from '../../../../../shared-backend-library/src/firestore/read';

describe('Test firestore operations with fake database', function () {

    beforeEach(function () {
        useFirestoreMockExternalDb();
    });

    it('should read/write assigned database', async function () {
        const database = 'USER_MIAU' as FirebaseUserProjectName;
        const hash = 'hashHash123';
        await writeAssignedFirebaseProject(hash, database);
        const respDatabase = await readAssignedFirebaseProject(hash);
        expect(respDatabase).toEqual(database);
    });

});
