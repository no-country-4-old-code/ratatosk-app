import {getScansToNotify} from '../../../../../src/functions/scan/helper/notification/get-scans-to-notify';
import {getCoinIds} from '../../../../../../../../shared-library/src/asset/assets/coin/helper/get-ids-and-info';
import {deepCopy} from '../../../../../../../../shared-library/src/functions/general/object';
import {Scan} from '../../../../../../../../shared-library/src/scan/interfaces';
import {createDummyScan} from '../../../../../../../../shared-library/src/functions/test-utils/dummy-data/scan';


describe('Test if scans, which should be notified, are detected', function () {
    let scanEnabled: Scan;
    let scanDisabled: Scan;

    beforeEach(function () {
        scanEnabled = {...createDummyScan(), result: getCoinIds()};
        scanEnabled.notification.isEnabled = true;
        scanEnabled.title = 'Enabled';

        scanDisabled = {...createDummyScan(), result: getCoinIds()};
        scanDisabled.notification.isEnabled = false;
        scanDisabled.title = 'Disabled';
    });

    describe('Scans with notification and enter enabled but leave disabled', function () {

        it('should return scan if new assets are detected', function () {
            const result = getScansToNotify([scanEnabled]);
            expect(result.length).toEqual(1);
            expect(result[0]).toEqual(scanEnabled);
            expect(result[0].result).toEqual(getCoinIds());
        });

        it('should return scan if at least one new asset is detected', function () {
            scanEnabled.notification.lastNotified = getCoinIds();
            scanEnabled.notification.lastNotified.pop();
            const result = getScansToNotify([scanEnabled]);
            expect(result.length).toEqual(1);
            expect(result[0]).toEqual(scanEnabled);
            expect(result[0].result).toEqual(getCoinIds());
        });

        it('should return scan if at least one new asset is detected even if other assets have left', function () {
            scanEnabled.notification.lastNotified = ['specialId42', ...getCoinIds()];
            scanEnabled.notification.lastNotified.pop();
            const result = getScansToNotify([scanEnabled]);
            expect(result.length).toEqual(1);
            expect(result[0]).toEqual(scanEnabled);
        });

        it('should not return scan if no new asset are detected', function () {
            scanEnabled.notification.lastNotified = getCoinIds();
            const result = getScansToNotify([scanEnabled]);
            expect(result).toEqual([]);
        });

        it('should not return scan if assets have left', function () {
            scanEnabled.notification.lastNotified = ['specialId42', ...getCoinIds()];
            const result = getScansToNotify([scanEnabled]);
            expect(result).toEqual([]);
        });

        it('should not return scan if current detected assets are equal to last seen assets', function () {
            scanEnabled.notification.lastSeen = getCoinIds();
            const result = getScansToNotify([scanEnabled]);
            expect(result).toEqual([]);
        });

        it('should return multiple scans if multiple scans demand to be notified', function () {
            const scanEnabled2 = deepCopy(scanEnabled);
            scanEnabled2.title = scanEnabled.title + '2';
            const result = getScansToNotify([scanEnabled, scanEnabled2]);
            const titles = result.map(scan => scan.title);
            expect(titles).toEqual(['Enabled', 'Enabled2']);
        });

        it('should return only scans which fullfill notification requirments', function () {
            const scanLastSeen = deepCopy(scanEnabled);
            const scanLastNotified = deepCopy(scanEnabled);
            const scanEnabled2 = deepCopy(scanEnabled);
            scanLastSeen.notification.lastSeen = getCoinIds();
            scanLastSeen.title = 'Last seen';
            scanLastNotified.notification.lastNotified = getCoinIds();
            scanLastNotified.title = 'Last notified';
            scanEnabled2.title = 'Enabled2';
            const result = getScansToNotify([scanLastSeen, scanEnabled2, scanEnabled, scanLastNotified]);
            const titles = result.map(scan => scan.title);
            expect(titles).toEqual(['Enabled2', 'Enabled']);
        });
    });

    describe('Scans with notification disabled', function () {

        it('should ignore scans with notification disabled', function () {
            const result = getScansToNotify([scanDisabled, scanDisabled]);
            expect(result).toEqual([]);
        });

        it('should detect scan with enabled notification even if mixed with disabled ones', function () {
            const result = getScansToNotify([scanDisabled, scanEnabled, scanDisabled, scanDisabled]);
            expect(result.length).toEqual(1);
            expect(result[0]).toEqual(scanEnabled);
        });
    });

    describe('Special cases', function () {

        it('should return empty list if no scans are given', function () {
            const result = getScansToNotify([]);
            expect(result).toEqual([]);
        });
    });
});



