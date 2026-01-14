import {FirebaseUserProjectInfo} from '../../../src/functions/user/helper/interfaces';
import {FirebaseUserProjectName} from '../../../../../../shared-library/src/datatypes/firebase-projects';
import {getLeastFilledProject} from '../../../src/functions/user/helper/get-least-filled-project';

describe('Test get least filled project', function () {

    function createProject(name: string, numberOfUsers: number): FirebaseUserProjectInfo {
        return {name: name as any as FirebaseUserProjectName, numberOfUsers};
    }

    function act(projects: FirebaseUserProjectInfo[], expectedProjectName: string) {
        const result = getLeastFilledProject(projects) as FirebaseUserProjectInfo;
        expect(result.name).toEqual(expectedProjectName);
    }

    it('should return project if only one was given', function () {
        act(
            [
                createProject('a', 0)
            ],
            'a'
        );
    });

    it('should return project with lowest number of users if multiple given', function () {
        act(
            [
                createProject('a', 1),
                createProject('b', 0),
                createProject('c', 2),
            ],
            'b'
        );
    });

    it('should return first project if multiple with equal number of users are given', function () {
        act(
            [
                createProject('a', 0),
                createProject('b', 0),
                createProject('c', 0)
            ],
            'a'
        );
    });

    it('should return undefined if given empty list', function () {
        const result = getLeastFilledProject([]);
        expect(result).toBeUndefined();
    });
});