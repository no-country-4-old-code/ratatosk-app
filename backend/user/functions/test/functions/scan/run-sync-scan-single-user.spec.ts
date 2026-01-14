import {createDummyUserData} from '../../../../../../shared-library/src/functions/test-utils/dummy-data/user';
import {runPeriodicScanForSingleUser} from '../../../src/functions/scan/run-sync-scan';
import {createDummyAssetDatabase} from '../../test-utils/dummy-data/asset-database';
import {useFirestoreMock} from '../../../../../shared-backend-library/src/test-utils/firestore-mock/use-firestore-mock';
import {UserData} from '../../../../../../shared-library/src/datatypes/user';
import {
    createDummyScanAlwaysFalse,
    createDummyScanAlwaysTrue
} from '../../../../../../shared-library/src/functions/test-utils/dummy-data/scan';
import {readUser} from '../../../src/helper/firestore/read';
import {getCoinIds} from '../../../../../../shared-library/src/asset/assets/coin/helper/get-ids-and-info';
import {deepCopy} from '../../../../../../shared-library/src/functions/general/object';
import {useNotificationMock} from '../../test-utils/mocks/notification/use-notification-mock';
import {writeUser} from '../../../src/helper/firestore/write';
import {AssetId} from '../../../../../../shared-library/src/datatypes/data';
import {firestore} from 'firebase-admin/lib/firestore';
import {firestoreApi} from '../../../../../shared-backend-library/src/firestore/lib/api';
import {
    mapMsToTimestamp,
    mapTimestampToMs
} from '../../../../../../shared-library/src/functions/time/firestore-timestamp';
import {fixUniqueScanIds} from '../../test-utils/fix-unique-scan-ids';
import Timestamp = firestore.Timestamp;

describe('Test sync scan for single user', function () {
    const uid = 'uidTest';
    let dbDataTimestamp: number;
    let spyUpdate: jasmine.Spy, spyNotification: jasmine.Spy;
    let user: UserData;

    beforeEach(async function () {
        const mockFirestore = useFirestoreMock();
        const mockNotification = useNotificationMock();
        spyOn(firestoreApi, 'getCurrentTimestampMs').and.callFake(() => Date.now());
        spyOn(firestoreApi, 'getCurrentTimestampAsFieldValue').and.callFake(() => mapMsToTimestamp(Date.now()) as any);
        dbDataTimestamp = 12345678910;
        user = createDummyUserData(0);
        user.pro.useProVersionUntil = Date.now() + 1000;
        user.pushIds = ['at least one'];
        spyUpdate = spyOn(mockFirestore, 'collection').and.callThrough();
        spyNotification = spyOn(mockNotification, 'sendToDevice').and.callThrough();
    });

    async function act(expectedNumberOfNotifications: number) {
        fixUniqueScanIds(user.scans);
        const db = createDummyAssetDatabase(0);
        db.coin.meta.timestampMs = dbDataTimestamp;
        const copyUser = deepCopy(user);
        await writeUser(uid, copyUser);
        spyUpdate.calls.reset();
        await runPeriodicScanForSingleUser(copyUser, uid, db);
        expect(spyUpdate).toHaveBeenCalledTimes(1); // in every case the result should be updated
        expect(spyNotification).toHaveBeenCalledTimes(expectedNumberOfNotifications);
    }

    it('should not send any notification if user has no scans', async function () {
        user.scans = [];
        await act(0);
    });

    it('should not send any notification if user has only scans with notification disabled', async function () {
        user.scans = [createDummyScanAlwaysTrue(), createDummyScanAlwaysFalse()];
        user.scans[0].notification.isEnabled = false;
        user.scans[1].notification.isEnabled = false;
        await act(0);
    });

    it('should send notification if notification event occur', async function () {
        user.scans = [createDummyScanAlwaysTrue()];
        user.scans[0].notification.isEnabled = true;
        await act(1);
    });

    it('should send one notification for each push id', async function () {
        user.pushIds = ['1', '2', '3', '4'];
        user.scans = [createDummyScanAlwaysTrue()];
        user.scans[0].notification.isEnabled = true;
        await act(4);
    });

    it('should send no notification if no push id is available', async function () {
        user.pushIds = [];
        user.scans = [createDummyScanAlwaysTrue()];
        user.scans[0].notification.isEnabled = true;
        await act(0);
    });

    it('should send only one (compact) notification even if multiple scans triggered a notification', async function () {
        user.scans = [createDummyScanAlwaysTrue(), createDummyScanAlwaysTrue(), createDummyScanAlwaysFalse()];
        user.scans[0].notification.isEnabled = true;
        user.scans[1].notification.isEnabled = true;
        user.scans[2].notification.isEnabled = true;
        await act(1);
    });

    it('should only notify about scans which are actually changed', async function () {
        user.scans = [createDummyScanAlwaysTrue(), createDummyScanAlwaysTrue(), createDummyScanAlwaysFalse()];
        user.scans[0].notification.isEnabled = true;
        user.scans[1].notification.isEnabled = true;
        user.scans[2].notification.isEnabled = true;
        user.scans[0].title = 'goodScan1';
        user.scans[1].title = 'goodScan2';
        user.scans[2].title = 'badScan';
        await act(1);
        const msgBody = spyNotification.calls.argsFor(0)[1].data.body;
        expect(msgBody).toContain('goodScan1');
        expect(msgBody).toContain('goodScan2');
        expect(msgBody).not.toContain('badScan');
    });

    it('should update field "last notified" for scans which were notified', async function () {
        user.scans = [createDummyScanAlwaysTrue(), createDummyScanAlwaysTrue()];
        user.scans[0].notification.isEnabled = true;
        user.scans[1].notification.isEnabled = true;
        await act(1);
        const updatedUserData = await readUser(uid);
        expect(updatedUserData.scans[0].notification.lastNotified).toEqual(getCoinIds());
        expect(updatedUserData.scans[0].notification.lastNotified).not.toEqual(user.scans[0].notification.lastNotified);
    });

    it('should not update field "last notified" for scans which were not notified', async function () {
        const someIds = [getCoinIds()[2], getCoinIds()[4]];
        user.scans = [createDummyScanAlwaysTrue(), createDummyScanAlwaysTrue()];
        user.scans[0].notification.isEnabled = false;
        user.scans[1].notification.isEnabled = true;
        user.scans[0].notification.lastNotified = [...someIds];
        user.scans[1].notification.lastNotified = [...someIds];
        await act(1);
        const updatedUserData = await readUser(uid);
        expect(updatedUserData.scans[0].notification.lastNotified).toEqual(someIds);
        expect(updatedUserData.scans[1].notification.lastNotified).toEqual(getCoinIds());
        expect(updatedUserData.scans[0].notification.lastNotified).not.toEqual(updatedUserData.scans[1].notification.lastNotified);
    });

    it('should update field "last notified" only for scans which triggered a notification', async function () {
        user.scans = [createDummyScanAlwaysTrue(), createDummyScanAlwaysFalse(), createDummyScanAlwaysTrue()];
        user.scans[0].notification.isEnabled = true;
        user.scans[1].notification.isEnabled = true;
        user.scans[2].notification.isEnabled = true;
        user.scans[1].notification.lastNotified = [];
        await act(1);
        const updatedUserData = await readUser(uid);
        expect(updatedUserData.scans[0].notification.lastNotified).toEqual(getCoinIds());
        expect(updatedUserData.scans[1].notification.lastNotified).toEqual([]);
        expect(updatedUserData.scans[2].notification.lastNotified).toEqual(getCoinIds());
    });

    it('should update "last notified"-attribute of scan in user data with result if at least one scan triggered a notification', async function () {
        user.scans = [createDummyScanAlwaysTrue()];
        user.scans[0].notification.isEnabled = true;
        await act(1);
        const updatedUserData = await readUser(uid);
        expect(user.scans[0].notification.lastNotified).toEqual([]);
        expect(updatedUserData.scans[0].notification.lastNotified).not.toEqual([]);
        expect(updatedUserData.scans[0].notification.lastNotified).toEqual(updatedUserData.scans[0].result as AssetId<any>[]);
    });

    it('should update result and last scan calculation indepentendt of notification settings', async function () {
        user.scans = [createDummyScanAlwaysTrue()];
        user.scans[0].notification.isEnabled = false;
        user.scans[0].result = [];
        user.scans[0].timestampResultData = 0;
        await act(0);
        const updatedUserData = await readUser(uid);
        expect(updatedUserData.scans[0].result).toEqual(getCoinIds());
        expect(updatedUserData.scans[0].timestampResultData).toEqual(dbDataTimestamp);
    });

    it('should not change last user activity if it is in range', async function () {
        const timestampMs = Date.now() - 1000;
        const lastUserActivity = mapMsToTimestamp(timestampMs);
        user.scans = [createDummyScanAlwaysTrue()];
        user.scans[0].notification.isEnabled = false;
        user.lastUserActivity = lastUserActivity;
        await act(0);
        const updatedUserData = await readUser(uid);
        const updatetdLastUserActivityMs = mapTimestampToMs(updatedUserData.lastUserActivity as Timestamp);
        expect(updatetdLastUserActivityMs).toEqual(timestampMs);
    });

    it('should limit last user activity if it outside range', async function () {
        const timestampMs = Date.now() + 1000;
        const lastUserActivity = mapMsToTimestamp(timestampMs);
        user.scans = [createDummyScanAlwaysTrue()];
        user.scans[0].notification.isEnabled = false;
        user.lastUserActivity = lastUserActivity;
        await act(0);
        const updatedUserData = await readUser(uid);
        const updatetdLastUserActivityMs = mapTimestampToMs(updatedUserData.lastUserActivity as Timestamp);
        expect(updatetdLastUserActivityMs).toBeLessThan(timestampMs);
        expect(updatetdLastUserActivityMs).toBeGreaterThan(timestampMs - 1000);
    });
});