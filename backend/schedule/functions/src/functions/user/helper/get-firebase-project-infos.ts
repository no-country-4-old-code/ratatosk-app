import {FirebaseUserProjectInfo} from './interfaces';
import {
    getFirebaseUserProjects
} from '../../../../../../../shared-library/src/functions/firebase-projects/get-firebase-user-projects';
import {readNumberOfUsers} from '../../../../../../shared-backend-library/src/firestore/read';


export function getFirebaseProjectInfos(): Promise<FirebaseUserProjectInfo[]> {
    const projects = getFirebaseUserProjects();
    const promises = projects.map(name => {
        return readNumberOfUsers(name)
            .then(numberOfUsers => ({name, numberOfUsers}))
            .catch(() => {
                console.error('Could not read number of users from firebase project: ', name);
                return undefined;
            });
    });
    return Promise.all(promises).then(projects => {
        return projects.filter(proj => proj !== undefined) as FirebaseUserProjectInfo[];
    });
}
