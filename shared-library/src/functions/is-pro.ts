import {UserData} from '../datatypes/user';

export function isPro(userData: UserData): boolean {
    return userData.pro.useProVersionUntil >= Date.now();
}