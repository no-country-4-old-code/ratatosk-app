import {
    getFirebaseProjects,
    getFirebaseUserProjects
} from '../../../src/functions/firebase-projects/get-firebase-user-projects';
import {isFirebaseUserProject} from '../../../src/settings/firebase-projects';
import {FirebaseProjectName} from '../../../src/datatypes/firebase-projects';

describe('Test get firebase projects', function () {

    it('should only contain specific projects (get all projects)', function () {
        const exceptions: FirebaseProjectName[] = ['SCHEDULE', 'WEBPAGE'];
        getFirebaseProjects().forEach(project => {
            if ( ! isFirebaseUserProject(project) ) {
                expect(exceptions).toContain(project);
            }
        });
    });

    it('should only contain specific projects (get user projects)', function () {
        getFirebaseUserProjects().forEach(project => {
            const isValid = isFirebaseUserProject(project);
            expect(isValid).withContext(`Error for ${project}`).toBe(true);
        });
    });
});