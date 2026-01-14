import {mapMsToTimestamp, mapTimestampToMs} from '../../../src/functions/time/firestore-timestamp';
import firestore from 'firebase/app';
import 'firebase/firestore';

describe('Test mapping from milliseconds to firestore timestamp and via versa', function () {

    function act(ms: number, expectedSeconds: number, expectedNano: number): void {
        const timestamp = mapMsToTimestamp(ms);
        expect(timestamp.seconds).toEqual(expectedSeconds);
        expect(timestamp.nanoseconds).toEqual(expectedNano);
    }

    it('should split into seconds and milliseconds', function () {
        act(0, 0, 0);
        act(1000, 1, 0);
        act(1001, 1, 1000000);
        act(1234.5, 1, 234500000);
        act(0.5, 0, 500000);
    });

    it('should be reversible', function () {
        const timestampsInMs = [0, 0.99, 1, 1.01, 999, 1000, 12345.6789, Date.now()];
        timestampsInMs.forEach(ms => {
            const timestamp = mapMsToTimestamp(ms);
            const result = mapTimestampToMs(timestamp);
            expect(result).toEqual(ms);
        });
    });

    it('should be equal to firestore timestamp result (which could not be used because of import error in firebase cloud)', function () {
        const milliseconds = 123100;
        const seconds = 123;
        const nanoseconds = 100000000;
        const firestoreTimestamp = {...new  firestore.firestore.Timestamp(seconds, nanoseconds)};
        const timestamp = mapMsToTimestamp(milliseconds);
        expect(timestamp).toEqual(firestoreTimestamp);
    });

    it('should also work with convertion of firestore timestamps', function () {
        const seconds = 123;
        const nanoseconds = 100000000;
        const firestoreTimestamp = {...new firestore.firestore.Timestamp(seconds, nanoseconds)};
        const milliseconds = mapTimestampToMs(firestoreTimestamp);
        const timestamp = mapMsToTimestamp(milliseconds);
        expect(timestamp).toEqual(firestoreTimestamp);
    });

});