import {UserData, UserProStatus, UserSettings} from '../../../datatypes/user';
import {createDummyScans} from './scan';
import {mapMsToTimestamp} from '../../time/firestore-timestamp';

export function createDummyUserData(numberOfScans=3, seed =0, withOptional=true): UserData {
    let optional: Partial<UserData> = {};
    if(withOptional){
        optional = {feedback: 123.4};
    }

    return {
        settings: createDummyUserSettings(),
        pro: createDummyUserProStatus(),
        scans: createDummyScans(numberOfScans, seed),
        lastUserActivity: mapMsToTimestamp(Date.now()),  // for frontend it could also become null
        pushIds: [],
        ...optional
    };
}

// private

function createDummyUserProStatus(): UserProStatus {
    return {hasCanceledProVersion: true, useProVersionUntil: 0};
}

function createDummyUserSettings(): UserSettings {
    return {currency: 'usd'};
}
