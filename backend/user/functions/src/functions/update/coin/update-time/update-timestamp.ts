import admin from 'firebase-admin';
import {sampleIntervalInMinutes} from '../../../../../../../../shared-library/src/settings/sampling';
import {firestoreApi} from '../../../../../../../shared-backend-library/src/firestore/lib/api';


export function isTimeForUpdate(timestampWhenNextSampleIsAvailable: number, delayForUpdateInMs = 0) {
    let ret = true, diff;
    try {
        diff = firestoreApi.getCurrentTimestampMs() - timestampWhenNextSampleIsAvailable;
        ret = diff >= delayForUpdateInMs;
    } catch (e) {
        console.error('UpdateSchedule in isTimeForUpdate: ', e);
    }
    return ret;
}


export function getNextTimestampMs(timestampMs = firestoreApi.getCurrentTimestampMs()): number {
    // default param get evaluated at runtime
    const gridInMilli = getSamplingTimestampsMs(timestampMs);
    let nextTimestamp = gridInMilli.find(val => val > timestampMs);
    if (nextTimestamp === undefined || nextTimestamp < 0) {
        console.error('Error in getNextTimestamp: ', nextTimestamp);
        nextTimestamp = timestampMs + sampleIntervalInMinutes * 60 * 1000;
    }
    return nextTimestamp;
}


// -- private


export function getSamplingTimestampsMs(refTimestampMs: number): number[] {
    const gridInMinutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
    const refDate = admin.firestore.Timestamp.fromMillis(refTimestampMs).toDate();
    refDate.setMinutes(0, 0, 0);
    return gridInMinutes.map((minute: number) => {
        refDate.setMinutes(minute);
        return admin.firestore.Timestamp.fromDate(refDate).toMillis();
    });
}
