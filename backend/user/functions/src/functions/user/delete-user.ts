import {deleteUser} from '../../helper/firestore/delete';

export function deleteUserData(userId: string): Promise<any> {
    return deleteUser(userId);
}
