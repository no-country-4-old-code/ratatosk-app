import * as admin from 'firebase-admin';
import {getNextTimestampMs, isTimeForUpdate} from '../../../../src/functions/update/coin/update-time/update-timestamp';
import {firestoreApi} from '../../../../../../shared-backend-library/src/firestore/lib/api';
import {sampleIntervalInMinutes} from '../../../../../../../shared-library/src/settings/sampling';


describe('Test update-time functions', function () {

    const delayMs = 5000;

    describe('Check if time for update', function () {
        // note: function uses the current timestamp. Be careful to create no unstable tests.
        const executionTime = 100;

        it('should return true if sample is already available for some time', function () {
            const timestampSampleAvailableMs = firestoreApi.getCurrentTimestampMs() - delayMs;
            expect(isTimeForUpdate(timestampSampleAvailableMs)).toBeTruthy();
        });

        it('should return true if sample is now available', function () {
            const timestampSampleAvailableMs = firestoreApi.getCurrentTimestampMs();
            expect(isTimeForUpdate(timestampSampleAvailableMs)).toBeTruthy();
        });

        it('should return false if sample is not available now', function () {
            const timestampSampleAvailableMs = firestoreApi.getCurrentTimestampMs() + delayMs;
            expect(isTimeForUpdate(timestampSampleAvailableMs)).toBeFalsy();
        });

        it('should return false if sample is now available but delay not exceeded', function () {
            const timestampSampleAvailableMs = firestoreApi.getCurrentTimestampMs();
            expect(isTimeForUpdate(timestampSampleAvailableMs, delayMs)).toBeFalsy();
        });

        it('should return true if sample is now available and delay is exceeded', function () {
            const timestampSampleAvailableMs = firestoreApi.getCurrentTimestampMs() - delayMs - executionTime;
            expect(isTimeForUpdate(timestampSampleAvailableMs, delayMs)).toBeTruthy();
        });

    });

    describe('Get timestamp of next sample', function () {
        const sampleIntervalInMilli = sampleIntervalInMinutes * 60 * 1000;

        function asMillis(date: Date): number {
            return admin.firestore.Timestamp.fromDate(date).toMillis();
        }

        const timestampA = asMillis(new Date(1999, 12, 31, 23, 55, 0, 0));
        const timestampB = asMillis(new Date(2000, 1, 1, 0, 0, 0, 0));
        const timestampC = asMillis(new Date(2000, 1, 1, 0, 5, 0, 0));

        it('should have interval distance between timestamps A, B, C', function () {
            expect(timestampB - timestampA).toEqual(sampleIntervalInMilli);
            expect(timestampC - timestampB).toEqual(sampleIntervalInMilli);
        });

        it('should return timestamp A if less timestamp A ', function () {
            const nextSampleAvailableMs = getNextTimestampMs(timestampA - delayMs);
            expect(nextSampleAvailableMs).toEqual(timestampA);
        });

        it('should return timestamp B if equal timestamp A ', function () {
            const nextSampleAvailableMs = getNextTimestampMs(timestampA);
            expect(nextSampleAvailableMs).toEqual(timestampB);
        });

        it('should return timestamp B if between timestamp A and B', function () {
            const nextSampleAvailableMs = getNextTimestampMs((timestampA + timestampB) / 2);
            expect(nextSampleAvailableMs).toEqual(timestampB);
        });

        it('should return timestamp C if equal timestamp B', function () {
            const nextSampleAvailableMs = getNextTimestampMs(timestampB);
            expect(nextSampleAvailableMs).toEqual(timestampC);
        });

        it('should use current timestamp if no params given', function () {
            const currentTimestamp = firestoreApi.getCurrentTimestampMs();
            const nextSampleAvailableMs1 = getNextTimestampMs();
            const nextSampleAvailableMs2 = getNextTimestampMs(currentTimestamp);
            expect(nextSampleAvailableMs1).toEqual(nextSampleAvailableMs2);
        });

        it('should call function for default param with every call (this is typescript related)', function () {
            let count = 0;

            function incrementCount(): number {
                count++;
                return count;
            }

            function testParams(a = incrementCount()): number {
                return a;
            }

            const firstCall = testParams();
            const secondCall = testParams();
            expect(firstCall).not.toEqual(secondCall);
        });

        it('should handle whole hour and hour wrap', function () {
            const gridInMinutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80];
            const gridInMillis = gridInMinutes.map(minute => minute * 60 * 1000);
            gridInMillis.forEach(millis => {
                const nextTimestamp = getNextTimestampMs(millis);
                expect(nextTimestamp).toEqual(millis + sampleIntervalInMilli);
            });
        });
    });
});

