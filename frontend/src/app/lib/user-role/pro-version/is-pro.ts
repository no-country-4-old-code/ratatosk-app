import {UserData} from '../../../../../../shared-library/src/datatypes/user';

export function isProVersionValid(user: UserData): boolean {
    // Date.now() is ok here. Time of the device could differ from server time but +- 1 day might be ok.
    return user.pro.useProVersionUntil - Date.now() > 0;
}
