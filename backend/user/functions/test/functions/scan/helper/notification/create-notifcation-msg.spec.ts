import {createNotificationMsg} from '../../../../../src/functions/scan/helper/notification/create-notification-msg';
import {
    createDummyScanAlwaysFalse,
    createDummyScanAlwaysTrue
} from '../../../../../../../../shared-library/src/functions/test-utils/dummy-data/scan';
import {Scan} from '../../../../../../../../shared-library/src/scan/interfaces';

describe('Test creation of notification msg', function () {
    let scanAlice: Scan;
    let scanBob: Scan;

    beforeEach(function () {
        scanAlice = createDummyScanAlwaysTrue();
        scanAlice.title = 'SpecialTitle Yeah yeah';
        scanBob = createDummyScanAlwaysFalse();
        scanBob.title = '<>scan-%False${i}';
    });

    describe('Msg should contain positive delta to last-seen assets string', function () {

        function act(lastSeen: string[], result: string[], expected: string): void {
            scanAlice.notification.lastSeen = lastSeen;
            scanAlice.result = result;
            const msg = createNotificationMsg([scanAlice]);
            expect(msg).toContain(expected);
        }

        it('should listen sum of new added assets under +', function () {
            act([], [], '0');
            act([], ['a'], '1');
            act([], ['a', 'b'], '2');
        });

    });

    describe('Title of all scans should be part of notification msg', function () {

        it('should contain title of scan', function () {
            const msg = createNotificationMsg([scanAlice]);
            expect(msg).toContain(scanAlice.title);
            expect(msg).not.toContain(scanBob.title);
        });

        it('should contain title of all given scans', function () {
            const msg = createNotificationMsg([scanAlice, scanBob]);
            expect(msg).toContain(scanAlice.title);
            expect(msg).toContain(scanBob.title);
        });
    });
});