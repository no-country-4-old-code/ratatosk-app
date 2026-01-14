import {FirebaseUserProjectInfo} from './interfaces';
import {min} from 'mathjs';

export function getLeastFilledProject(projects: FirebaseUserProjectInfo[]): FirebaseUserProjectInfo | undefined {
    const numbersOfAllUsers = projects.map(proj => proj.numberOfUsers);
    const minNumberOfUsersInProject = stableMin(numbersOfAllUsers);
    return projects.find(proj => proj.numberOfUsers <= minNumberOfUsersInProject) as FirebaseUserProjectInfo;
}

// private

function stableMin(numbersOfAllUsers: number[]): number {
    if (numbersOfAllUsers.length > 0) {
        return min(...numbersOfAllUsers);
    } else {
        return -1;
    }
}