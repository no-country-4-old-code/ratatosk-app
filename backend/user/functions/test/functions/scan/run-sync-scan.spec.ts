import {createDummyUserData} from '../../../../../../shared-library/src/functions/test-utils/dummy-data/user';
import {runSyncScan} from '../../../src/functions/scan/run-sync-scan';
import {useFirestoreMock} from '../../../../../shared-backend-library/src/test-utils/firestore-mock/use-firestore-mock';
import {createDummyScanAlwaysTrue} from '../../../../../../shared-library/src/functions/test-utils/dummy-data/scan';
import {deepCopy} from '../../../../../../shared-library/src/functions/general/object';
import {useNotificationMock} from '../../test-utils/mocks/notification/use-notification-mock';
import {Scan} from '../../../../../../shared-library/src/scan/interfaces';
import {useCloudStorageMock} from '../../test-utils/mocks/cloud-storage/use-cloud-storage-mock';
import {lookupSetDatabaseState} from '../../test-utils/database-states';
import {UserData} from '../../../../../../shared-library/src/datatypes/user';
import {firestoreApi} from '../../../../../shared-backend-library/src/firestore/lib/api';
import {getDocUser} from '../../../../../../shared-library/src/backend-interface/firestore/documents';
import {compressUser} from '../../../../../../shared-library/src/functions/compress/compress-user';
import {fixUniqueScanIds} from '../../test-utils/fix-unique-scan-ids';

describe('Test sync scan', function () {
    let spyNotification: jasmine.Spy;
    let scanDisabled: Scan, scanTrigger: Scan, scanBroken: Scan, scanAlreadyCalculated: Scan;

    function addProUser(uid: string, scans: Scan[], user = createDummyUserData(0)) {
        fixUniqueScanIds(scans);
        user.pro.useProVersionUntil = Date.now() + 10000;
        user.scans = deepCopy(scans);
        user.pushIds = ['at least one'];
        const db = firestoreApi.getDb();
        const doc = getDocUser(db, uid);
        user = compressUser(user) as any as UserData;
        return doc.set(user);
    }

    function addProUserWithoutCompression(uid: string, scans: Scan[], user = createDummyUserData(0)) {
        fixUniqueScanIds(scans);
        user.pro.useProVersionUntil = Date.now() + 10000;
        user.scans = deepCopy(scans);
        user.pushIds = ['at least one'];
        return writeWithoutCompression(uid, user);
    }

    function writeWithoutCompression(uid: string, user: UserData): Promise<void> {
        const db = firestoreApi.getDb();
        const doc = getDocUser(db, uid);
        return doc.set(user);
    }

    beforeEach(async function () {
        const timestamp = Math.round(Math.random() * 10000);
        useFirestoreMock();
        useCloudStorageMock();
        const mockNotification = useNotificationMock();
        spyNotification = spyOn(mockNotification, 'sendToDevice').and.callThrough();
        await lookupSetDatabaseState['full'](timestamp);
        // scans
        (scanBroken as any) = {};
        scanDisabled = createDummyScanAlwaysTrue();
        scanDisabled.notification.isEnabled = false;
        scanTrigger = createDummyScanAlwaysTrue();
        scanAlreadyCalculated = createDummyScanAlwaysTrue();
        scanAlreadyCalculated.timestampResultData = timestamp;
        // setup db
        await addProUser('noScans', []);
        await addProUser('disabled', [scanDisabled]);
        await addProUser('trigger', [scanTrigger]);
        await addProUser('alreadyCalculated', [scanAlreadyCalculated]);
        await addProUser('mixed', [scanAlreadyCalculated, scanDisabled, scanTrigger, scanDisabled]);
        await addProUserWithoutCompression('broken', [scanBroken, scanTrigger, scanDisabled]);
        await writeWithoutCompression('empty', {} as UserData);
        return writeWithoutCompression('undefined', undefined as any as UserData);
    });

    async function act(uids: string[], expectedNumberOfNotifications: number) {
        await runSyncScan(uids);
        expect(spyNotification).toHaveBeenCalledTimes(expectedNumberOfNotifications);
    }

    it('should not send any notification if no users are given', async function () {
        await act([], 0);
    });

    it('should not send any notification if users have no scans', async function () {
        await act(['noScans'], 0);
    });

    it('should not send any notification if user contain only disabled scans', async function () {
        await act(['disabled'], 0);
    });

    it('should not send any notification if users have only scans which are already calculated', async function () {
        await act(['alreadyCalculated'], 0);
    });

    it('should send notification if one user contain triggered scan', async function () {
        await act(['trigger'], 1);
    });

    it('should send a notification for each push id of each user with at least one triggered scan', async function () {
        await act(['trigger', 'mixed', 'noScans', 'disabled'], 2);
    });

    it('should not send a notification if user contain broken scan', async function () {
        await act(['broken'], 0);
    });

    it('should evaluate other users even if one user is broken ', async function () {
        await act(['mixed', 'broken', 'trigger'], 2);
    });

    it('should not throw an error if uid is not know', async function () {
        await act(['unknown uid'], 0);
    });

    it('should evaluate other users even if one user id could not be resolved', async function () {
        await act(['mixed', 'unknown uid', 'trigger'], 2);
    });

    it('should not throw an error if user is empty', async function () {
        await act(['empty'], 0);
    });

    it('should not throw an error if user is undefined', async function () {
        await act(['undefined'], 0);
    });
});