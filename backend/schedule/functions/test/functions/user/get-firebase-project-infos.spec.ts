import {getFirebaseProjectInfos} from '../../../src/functions/user/helper/get-firebase-project-infos';
import {
    useFirestoreMockExternalDb
} from '../../../../../shared-backend-library/src/test-utils/firestore-mock/use-firestore-mock';
import {writeNumberOfUsers} from '../../test-utils/write-number-of-users';

describe('Test get firebase project infos', function () {
    let mock: any;

    beforeEach(async function () {
        mock = useFirestoreMockExternalDb();
    });

    it('should fill projects info based on number of users', async function () {
        // assign
        const randomSeed = Math.random() * 1000;
        await writeNumberOfUsers(mock, randomSeed);
        // act
        const projects = await getFirebaseProjectInfos();
        // assert
        expect(projects[0].numberOfUsers).toEqual(randomSeed);
        expect(projects[0].name).toEqual('USER_001');
        expect(projects.length).toBeGreaterThan(0);
    });

});