import {getDocNumberOfUsers} from '../../../../shared-backend-library/src/firestore/documents';
import {CountNumberOfDocs} from '../../../../shared-backend-library/src/firestore/interfaces';

export function writeNumberOfUsers(firestore: any, numberOfUsers: number): Promise<void> {
    const counter: CountNumberOfDocs = {numberOfDocs: numberOfUsers};
    return getDocNumberOfUsers(firestore).set(counter);
}