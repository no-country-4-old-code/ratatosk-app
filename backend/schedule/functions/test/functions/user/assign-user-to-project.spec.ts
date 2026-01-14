import {
    useFirestoreMockExternalDb
} from '../../../../../shared-backend-library/src/test-utils/firestore-mock/use-firestore-mock';
import {hashFnv32a} from '../../../../../../shared-library/src/functions/hash';
import {writeAssignedFirebaseProject} from '../../../src/helper/firestore/write';
import {FirebaseUserProjectName} from '../../../../../../shared-library/src/datatypes/firebase-projects';
import {assignUserToFirebaseProject} from '../../../src/functions/user/helper/assign-user-to-project';
import {readAssignedFirebaseProject} from '../../../../../shared-backend-library/src/firestore/read';

describe('Test assigning user to firebase project', function () {
    const exampleEmail = 'qwert.trewq@asd.dsa';
    const hashOfExampleEmail = hashFnv32a(exampleEmail);

    beforeEach(function () {
        useFirestoreMockExternalDb();
    });

    async function act(email: string, expectedProjectName: string): Promise<void> {
        const hash = hashFnv32a(email);
        const resp = await assignUserToFirebaseProject(email, 'USER_001');
        await expectDocAssignedProjectToContain(hash, expectedProjectName);
        expect(resp.success).toBeTruthy();
        expect(resp.project).toEqual(expectedProjectName);
    }

    function expectDocAssignedProjectToContain(hash: string, expectedContent: string): Promise<void> {
        return readAssignedFirebaseProject(hash).then(content => expect(content).toEqual(expectedContent));
    }

    it('should assign user to project and create a (hash -> project) - doc for lookup during login', async () => {
        const expectedProject = 'USER_001';
        await act(exampleEmail, expectedProject);
    });

    it('should return saved project name if hash of users email is already assigned to a project', async () => {
        const exampleProject = 'MIAU_123' as FirebaseUserProjectName;
        await writeAssignedFirebaseProject(hashOfExampleEmail, exampleProject);
        await act(exampleEmail, exampleProject);
    });


    it('should assign user to project with less users', async () => {
        // TODO: Actually it is only 1 project
        const expectedProject = 'USER_001';
        await act(exampleEmail, expectedProject);
    });
});