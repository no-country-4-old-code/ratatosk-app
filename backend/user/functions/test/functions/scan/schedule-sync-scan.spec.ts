import {scheduleSyncScan} from '../../../src/functions/scan/schedule-sync-scan';
import {usePubSubMock} from '../../test-utils/mocks/pub-sub/use-pub-sub-mock';
import {useFirestoreMock} from '../../../../../shared-backend-library/src/test-utils/firestore-mock/use-firestore-mock';
import {writeUser} from '../../../src/helper/firestore/write';
import {createDummyUserData} from '../../../../../../shared-library/src/functions/test-utils/dummy-data/user';
import {lastUserActivityExpireTimeInSec} from '../../../../../../shared-library/src/settings/user';
import {firestoreApi} from '../../../../../shared-backend-library/src/firestore/lib/api';
import {mapMsToTimestamp} from '../../../../../../shared-library/src/functions/time/firestore-timestamp';
import {Timestamp} from '../../../../../../shared-library/src/datatypes/user';


describe('Test scheduler of periodic scan', function () {
    let spyPublish: jasmine.Spy;
    const uidAlice = 'alice';
    const uidBob = 'bob';

    function writeCustomUser(uid: string, useProVersionUntil: number, lastUserActivityInMs: number): Promise<void> {
        const user = createDummyUserData();
        user.pro.useProVersionUntil = useProVersionUntil;
        user.lastUserActivity = new Date(lastUserActivityInMs) as any as Timestamp;
        return writeUser(uid, user);
    }

    function writeProUser(uid: string): Promise<void> {
        return writeCustomUser(uid, Date.now() + 1000, 0);
    }

    function writeActiveProUser(uid: string): Promise<void> {
        return writeCustomUser(uid, Date.now() + 1000, Date.now());
    }

    function writeActiveNoProUser(uid: string): Promise<void> {
        return writeCustomUser(uid, 0, Date.now());
    }

    function writeNoActiveNoProUser(uid: string): Promise<void> {
        return writeCustomUser(uid, Date.now() - 1000, Date.now() - lastUserActivityExpireTimeInSec * 1000 - 1000);
    }


    beforeEach(async function () {
        useFirestoreMock();
        spyOn(firestoreApi, 'getCurrentTimestampMs').and.callFake(() => Date.now());
        spyOn(firestoreApi, 'getCurrentTimestampAsFieldValue').and.callFake(() => mapMsToTimestamp(Date.now()) as any);
        const mock = usePubSubMock();
        const topic = mock.topic('whatever');
        spyOn(mock, 'topic').and.returnValue(topic);
        spyPublish = spyOn(topic, 'publish').and.callThrough();
        // add user
        await writeNoActiveNoProUser(uidAlice);
        await writeNoActiveNoProUser(uidBob);
    });

    async function act(groupSize: number, expectedNumberOfPublish: number): Promise<void> {
        await scheduleSyncScan(groupSize);
        expect(spyPublish).toHaveBeenCalledTimes(expectedNumberOfPublish);
    }

    it('should not publish if no user has an active pro-account', async function () {
        await act(1, 0);
    });

    it('should publish once if one user has an active pro-account', async function () {
        await writeProUser(uidAlice);
        await act(1, 1);
    });

    xit('should publish once if one user has an active pro-account and has been active', async function () {
        await writeActiveProUser(uidAlice);
        await act(1, 1);
    });

    it('should publish once if one user has not a pro but has been active', async function () {
        await writeActiveNoProUser(uidAlice);
        await act(1, 1);
    });

    it('should publish twice if two users has an active pro-account and group size is one', async function () {
        await writeProUser(uidAlice);
        await writeProUser(uidBob);
        await act(1, 2);
    });

    it('should publish twice if one user has an active pro-account and the other has been active and group size is one', async function () {
        await writeProUser(uidAlice);
        await writeActiveNoProUser(uidBob);
        await act(1, 2);
    });

    it('should publish once if two users has an active pro-account and group size is two', async function () {
        await writeProUser(uidAlice);
        await writeProUser(uidBob);
        await act(2, 1);
    });
});