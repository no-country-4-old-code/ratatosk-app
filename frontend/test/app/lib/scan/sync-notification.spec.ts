import {createDummyScan} from "@shared_library/functions/test-utils/dummy-data/scan";
import {syncNotificationWithResult, syncScansWithoutUnseenAssets} from "@lib/scan/sync-notification";
import {Scan} from "@shared_library/scan/interfaces";

describe('Test scan notification sync', function () {


    function createTestScan(lastNotified, lastSeen, result): Scan {
        const scan = createDummyScan();
        scan.notification.lastNotified = lastNotified;
        scan.notification.lastSeen = lastSeen;
        scan.result = result;
        return scan;
    }

    function expectScan(scan, expectedLastNotified, expectedLastSeen): void {
        expect(scan.notification.lastNotified).toEqual(expectedLastNotified);
        expect(scan.notification.lastSeen).toEqual(expectedLastSeen);
    }


    describe('Sync one scan', function () {

        it('should set lastSeen and lastNotified to current result', function () {
            const result = ['miau', 'uff'];
            let scan = createTestScan(['1'], ['2'], result);
            // act
            scan = syncNotificationWithResult(scan);
            // assert
            expect(scan.notification.lastNotified).toEqual(result);
            expect(scan.notification.lastSeen).toEqual(result);
        });
    });


    describe('Sync scans without unseen assets', function () {

        it('should work with empty scans', function () {
            const scans = syncScansWithoutUnseenAssets([]);
            expect(scans).toEqual([]);
        });

        it('should apply changes only to scans which have no unseen assets', function () {
            let scans = [
                createTestScan(['1'], ['2'], ['2', '3']),
                createTestScan(['1'], ['2'], ['3']),
                createTestScan(['1'], ['2'], ['2']),
                createTestScan(['1'], ['2'], []),
            ];
            scans = syncScansWithoutUnseenAssets(scans);
            expectScan(scans[0], ['1'], ['2']);
            expectScan(scans[1], ['1'], ['2']);
            expectScan(scans[2], ['2'], ['2']);
            expectScan(scans[3], [], []);
        });

    });
});