import {processNotifications} from '../../../../../src/functions/scan/helper/notification/handle-notifications';
import {useNotificationMock} from '../../../../test-utils/mocks/notification/use-notification-mock';
import {deepCopy} from '../../../../../../../../shared-library/src/functions/general/object';
import {AssetId} from '../../../../../../../../shared-library/src/datatypes/data';
import {Scan} from '../../../../../../../../shared-library/src/scan/interfaces';
import {createDummyScan} from '../../../../../../../../shared-library/src/functions/test-utils/dummy-data/scan';

describe('Test process notifications', function () {
    let spyNotification: jasmine.Spy;


    beforeEach(async function () {
        const mockNotification = useNotificationMock();
        spyNotification = spyOn(mockNotification, 'sendToDevice').and.callThrough();
    });

    async function act(scans: Scan[], pushIds: string[], expectedScans: Scan[], expectedNumberOfNotifications: number) {
        const copyScans = deepCopy(scans);
        const result = processNotifications(copyScans, pushIds);
        await result.sendNotificationPromise.then();
        expect(result.scans).toEqual(expectedScans);
        expect(spyNotification).toHaveBeenCalledTimes(expectedNumberOfNotifications);
    }

    function createScanTriggerNotification(): Scan {
        return createCustomScan(['wuff', 'waff'], ['miau']);
    }

    function createScanTriggerNoNotification(lastNotified = ['miau', 'wuff']): Scan {
        return createCustomScan(lastNotified, lastNotified);
    }

    function createCustomScan(result: string[], lastNotified: string[]): Scan {
        const scan = {...createDummyScan(), result};
        scan.notification.lastNotified = [...lastNotified] as AssetId<any>[];
        return scan;
    }

    it('should do nothing if a empty array of scans is given', async function () {
        await act([], ['id0'], [], 0);
    });


    it('should do nothing if a empty array of push ids is given', async function () {
        const scans = [createScanTriggerNotification()];
        await act(scans, [], scans, 0);
    });


    it('should update scans and send notification if triggered', async function () {
        const scans = [createScanTriggerNotification()];
        const expectedScans = [createScanTriggerNotification()];
        expectedScans[0].notification.lastNotified = expectedScans[0].result;
        await act(scans, ['id0'], expectedScans, 1);
    });

    it('should not update nor send if no notification is triggered', async function () {
        const scans = [createScanTriggerNoNotification()];
        const expectedScans = [createScanTriggerNoNotification()];
        await act(scans, ['id0'], expectedScans, 0);
    });

    it('should send a notification for every push id', async function () {
        const scans = [createScanTriggerNotification()];
        const expectedScans = [createScanTriggerNotification()];
        expectedScans[0].notification.lastNotified = expectedScans[0].result;
        await act(scans, ['id0', 'id1', 'id2', 'id3'], expectedScans, 4);
    });

    it('should only update scans which triggered a notification', async function () {
        const scans = [
            createScanTriggerNoNotification(['unique']),
            createScanTriggerNotification(),
            createScanTriggerNoNotification()
        ];
        const expectedScans = [
            createScanTriggerNoNotification(['unique']),
            createScanTriggerNotification(),
            createScanTriggerNoNotification()
        ];
        expectedScans[1].notification.lastNotified = expectedScans[1].result;
        await act(scans, ['id0'], expectedScans, 1);
    });

});