import {buildAllMocks, MockControlArray} from '@test/helper-frontend/mocks/all';
import {testInjectionUserActivityDaemon, UserActivityDaemon} from '@app/services/user-activity-daemon.service';
import {
    lookupMarble2AuthInfo,
    lookupMarble2Boolean,
    lookupMarble2Numbers,
    MarbleLookup
} from '@test/helper-frontend/marble/lookup';
import {expectMarbles, marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {cold} from 'jasmine-marbles';
import {shareReplay, take} from 'rxjs/operators';
import {UserData} from '@shared_library/datatypes/user';
import {createDummyUserData} from '@shared_library/functions/test-utils/dummy-data/user';
import {lastUserActivityExpireTimeInSec} from '@shared_library/settings/user';
import {of} from 'rxjs';
import {mapMsToTimestamp} from '@shared_library/functions/time/firestore-timestamp';

describe('Test user activity daemon', function () {
    const expectedMaxTimeOfAsyncExecution = 30 * 1000;
    const expectedIntervalTriggerMs = 60 * 1000;
    const initialTimestamp = 0;
    const offsetMs = 12345678;
    const lookupTimestamps: MarbleLookup<number> = {
        i: initialTimestamp,   // the intial timestamp should force async call (if non pro & non demo)
        a: offsetMs,
        b: offsetMs + lastUserActivityExpireTimeInSec * 1000 - expectedIntervalTriggerMs - 1,   // still fresh
        c: offsetMs + lastUserActivityExpireTimeInSec * 1000 - expectedIntervalTriggerMs,       // refresh needed -> update
        d: offsetMs + lastUserActivityExpireTimeInSec * 1000 - 1,                               // refresh needed -> update
        e: offsetMs + lastUserActivityExpireTimeInSec * 1000,                                   // refresh needed -> async
    };
    let lookupUser: MarbleLookup<UserData>;
    let mocks: MockControlArray;
    let service: UserActivityDaemon;

    beforeEach(function () {
        lookupUser = {
            a: {...createDummyUserData(3, 0), lastUserActivity: mapMsToTimestamp(offsetMs)},
            b: {...createDummyUserData(3, 0), lastUserActivity: mapMsToTimestamp(offsetMs + 1)},
            c: {...createDummyUserData(2, 0), lastUserActivity: mapMsToTimestamp(offsetMs + 1)},  // different obj but same timestamp
            d: {...createDummyUserData(3, 0), lastUserActivity: null},  // server timestamp is not filled yet
            p: {...createDummyUserData(3, 10)}
        };
        lookupUser.p.pro.useProVersionUntil = Date.now() * 100;

        mocks = buildAllMocks();
        testInjectionUserActivityDaemon.isTestRun = true;
        spyOn(mocks.auth.mock, 'getTokenId$').and.returnValue(of('exampleIdToken'));
        service = new UserActivityDaemon(mocks.auth.mock, mocks.user.mock, mocks.http.mock);
    });

    describe('Test refresh stream', function () {

        function act(trigger$, dateNow$, numberOfExpectedAsyncCalls: number, numberOfExpectedUpdates: number, env): void {
            // set spies
            const spyAsync = spyOn(mocks.http.mock, 'get').and.returnValue(of(true));
            const spyUpdate = spyOn(mocks.user.mock, 'updateUserData').and.returnValue(of(true));
            // mock interval because marble can not handle it
            spyOn((service as any), 'getTimeTrigger$').and.returnValue(trigger$);
            // prepare date stream
            const containerData = {timestamp: 123};
            spyOn(Date, 'now').and.callFake(() => containerData.timestamp);
            dateNow$.subscribe(timestampNowMs => {containerData.timestamp = timestampNowMs});
            // act2
            const refresh$ = service['getRefreshUserActivity$']().pipe(take(3));
            refresh$.subscribe(x => console.log('Here', x));
            env.flush();
            // assert
            expect(spyAsync).toHaveBeenCalledTimes(numberOfExpectedAsyncCalls);
            expect(spyUpdate).toHaveBeenCalledTimes(numberOfExpectedUpdates);
        }

        it('should not do anything if user is pro or demo', () => marbleRun( env => {
            mocks.auth.control.authUserInfo$ = cold('d---a', lookupMarble2AuthInfo).pipe(shareReplay(1));
            mocks.user.control.user$ = cold(        'a-p--', lookupUser).pipe(shareReplay(1));
            const setDataNow$ = env.hot(            'a----', lookupTimestamps);
            const trigger$ = cold(                  'x----');
            act(trigger$, setDataNow$, 0, 0, env);
        }));

        it('should trigger async if new user (no pro & no demo) is logged in', () => marbleRun( env => {
            mocks.auth.control.authUserInfo$ = cold('-a--', lookupMarble2AuthInfo).pipe(shareReplay(1));
            mocks.user.control.user$ = cold(        '-a--', lookupUser).pipe(shareReplay(1));
            const setDataNow$ = env.hot(            'a---', lookupTimestamps);
            const trigger$ = cold(                  'x---');
            act(trigger$, setDataNow$, 1, 0, env);
        }));

        it('should trigger async if every time a new user (no pro & no demo) is logged in', () => marbleRun( env => {
            mocks.auth.control.authUserInfo$ = cold('-a 1m b 1m d 1m a', lookupMarble2AuthInfo).pipe(shareReplay(1));
            mocks.user.control.user$ = cold(        '-a 1m - 1m - 1m -', lookupUser).pipe(shareReplay(1));
            const trigger$ = cold(                  'x- 1m - 1m - 1m -');
            const setDataNow$ = env.hot(            'a- 1m - 1m - 1m -', lookupTimestamps);
            act(trigger$, setDataNow$, 3, 0, env);
        }));

        it('should not trigger more then one action every 30 s (negative case)', () => marbleRun( env => {
            mocks.auth.control.authUserInfo$ = cold('-a-          ', lookupMarble2AuthInfo).pipe(shareReplay(1));
            mocks.user.control.user$ = cold(        'ab-          ', lookupUser).pipe(shareReplay(1));
            const trigger$ = cold(                  'x-- 29s x-x-x');
            const setDataNow$ = env.hot(            'a-e          ', lookupTimestamps);
            act(trigger$, setDataNow$, 1, 0, env);
        }));

        it('should not trigger more then one action every 30 s (positive case)', () => marbleRun( env => {
            mocks.auth.control.authUserInfo$ = cold('-a-          ', lookupMarble2AuthInfo).pipe(shareReplay(1));
            mocks.user.control.user$ = cold(        'ab-          ', lookupUser).pipe(shareReplay(1));
            const trigger$ = cold(                  'x-- 30s x-x-x');
            const setDataNow$ = env.hot(            'a-e          ', lookupTimestamps);
            act(trigger$, setDataNow$, 2, 0, env);
        }));

        it('should not trigger any action as long timestamp is fresh', () => marbleRun( env => {
            mocks.auth.control.authUserInfo$ = cold('-a      ', lookupMarble2AuthInfo).pipe(shareReplay(1));
            mocks.user.control.user$ = cold(        'ab      ', lookupUser).pipe(shareReplay(1));
            const trigger$ = cold(                  'x- 1m -x');
            const setDataNow$ = env.hot(            'a- 1m b-', lookupTimestamps);
            act(trigger$, setDataNow$, 1, 0, env);
        }));

        it('should trigger update if timestamp going to be expired for sync calculation in next iteration (upper boundary)', () => marbleRun( env => {
            mocks.auth.control.authUserInfo$ = cold('-a      ', lookupMarble2AuthInfo).pipe(shareReplay(1));
            mocks.user.control.user$ = cold(        'ab      ', lookupUser).pipe(shareReplay(1));
            const trigger$ = cold(                  'x- 1m -x');
            const setDataNow$ = env.hot(            'a- 1m c-', lookupTimestamps);
            act(trigger$, setDataNow$, 1, 1, env);
        }));

        it('should trigger update if timestamp going to be expired for sync calculation in next iteration (lower boundary)', () => marbleRun( env => {
            mocks.auth.control.authUserInfo$ = cold('-a      ', lookupMarble2AuthInfo).pipe(shareReplay(1));
            mocks.user.control.user$ = cold(        'ab      ', lookupUser).pipe(shareReplay(1));
            const trigger$ = cold(                  'x- 1m -x');
            const setDataNow$ = env.hot(            'a----d--', lookupTimestamps);
            act(trigger$, setDataNow$, 1, 1, env);
        }));

        it('should trigger async if timestamp is invalid and we might already missed a sync scan calculation', () => marbleRun( env => {
            mocks.auth.control.authUserInfo$ = cold('-a      ', lookupMarble2AuthInfo).pipe(shareReplay(1));
            mocks.user.control.user$ = cold(        'ab      ', lookupUser).pipe(shareReplay(1));
            const trigger$ = cold(                  'x- 1m -x');
            const setDataNow$ = env.hot(            'a----e--', lookupTimestamps);
            act(trigger$, setDataNow$, 2, 0, env);
        }));

    });

    describe('Test user activation timestamp stream', function () {

        function act(setDataNow$, expected$, env): void {
            // prepare date stream
            const containerData = {timestamp: 0};
            spyOn(Date, 'now').and.callFake(() => containerData.timestamp);
            setDataNow$.subscribe(timestampNowMs => containerData.timestamp = timestampNowMs);
            // act
            const timestamp$ = service['getLastUserActivityInLocalMs$']();
            expectMarbles(timestamp$, expected$, env);
        }

        it('should not fire anything if user is pro or demo', () => marbleRun( env => {
            mocks.auth.control.authUserInfo$ = cold('d---a', lookupMarble2AuthInfo).pipe(shareReplay(1));
            mocks.user.control.user$ = cold(        'a-p--', lookupUser).pipe(shareReplay(1));
            const setDataNow$ = env.hot(            'a----', lookupTimestamps);
            const expected$ = cold(                 '-----', lookupMarble2Boolean);
            act(setDataNow$, expected$, env);
        }));

        it('should skip first user data and return initial timestamp instead to force async call for non pro & non demo', () => marbleRun( env => {
            mocks.auth.control.authUserInfo$ = cold('a', lookupMarble2AuthInfo).pipe(shareReplay(1));
            mocks.user.control.user$ = cold(        'a', lookupUser).pipe(shareReplay(1));
            const setDataNow$ = env.hot(            'a', lookupTimestamps);
            const expected$ = cold(                 'i', lookupTimestamps);
            act(setDataNow$, expected$, env);
        }));

        it('should skip first user data and return initial timestamp instead every time a new non pro non demo user comes', () => marbleRun( env => {
            mocks.auth.control.authUserInfo$ = cold('a--b--d--a--', lookupMarble2AuthInfo).pipe(shareReplay(1));
            mocks.user.control.user$ = cold(        'a----------b-', lookupUser).pipe(shareReplay(1));
            const setDataNow$ = env.hot(            'a-----------', lookupTimestamps);
            const expected$ = cold(                 'i--i-----i-a', lookupTimestamps);
            act(setDataNow$, expected$, env);
        }));

        it('should map user data timestamp to local timestamp if user activity timestamp changed', () => marbleRun( env => {
            mocks.auth.control.authUserInfo$ = cold('a', lookupMarble2AuthInfo).pipe(shareReplay(1));
            mocks.user.control.user$ = cold(        'a-a-b-b-a', lookupUser).pipe(shareReplay(1));
            const setDataNow$ = env.hot(            'a--------', lookupTimestamps);
            const expected$ = cold(                 'i---a---a', lookupTimestamps);
            act(setDataNow$, expected$, env);
        }));

        it('should not map to local timestamp if only object changed but timestamp stays the same', () => marbleRun( env => {
            mocks.auth.control.authUserInfo$ = cold('a', lookupMarble2AuthInfo).pipe(shareReplay(1));
            mocks.user.control.user$ = cold(        'a-a-b-c-a', lookupUser).pipe(shareReplay(1));
            const setDataNow$ = env.hot(            'a--------', lookupTimestamps);
            const expected$ = cold(                 'i---a---a', lookupTimestamps);
            act(setDataNow$, expected$, env);
        }));

        it('should ignore not filled server timestamps (last user activity has value of null)', () => marbleRun( env => {
            mocks.auth.control.authUserInfo$ = cold('a', lookupMarble2AuthInfo).pipe(shareReplay(1));
            mocks.user.control.user$ = cold(        'a-a-d-a-a-b', lookupUser).pipe(shareReplay(1));
            const setDataNow$ = env.hot(            'a----------', lookupTimestamps);
            const expected$ = cold(                 'i---------a', lookupTimestamps);
            act(setDataNow$, expected$, env);
        }));

        it('should map user data timestamp to current local timestamp ', () => marbleRun( env => {
            mocks.auth.control.authUserInfo$ = cold('a', lookupMarble2AuthInfo).pipe(shareReplay(1));
            mocks.user.control.user$ = cold(        'a-a-b-b-a', lookupUser).pipe(shareReplay(1));
            const setDataNow$ = env.hot(            'a--b-c---', lookupTimestamps);
            const expected$ = cold(                 'i---b---c', lookupTimestamps);
            act(setDataNow$, expected$, env);
        }));
    });

    describe('Test enabled stream', function () {

        it('should return true if user is no demo nor pro user', () => marbleRun( env => {
            mocks.auth.control.authUserInfo$ = cold('a-d---a--', lookupMarble2AuthInfo).pipe(shareReplay(1));
            mocks.user.control.user$ = cold(        'a---p---a', lookupUser).pipe(shareReplay(1));
            const expected$ = cold(                 't-f-----t', lookupMarble2Boolean);
            const enabled$ = service['getIsEnabled$']();
            expectMarbles(enabled$, expected$, env);
        }));
    });

    describe('Test trigger stream', function () {

        it('should trigger every 60 sec and start with -1', () => marbleRun( env => {
            const expected$ = cold('i 59s 999ms a 59s 999ms (b|)', {...lookupMarble2Numbers, i: -1});
            const trigger$ = service['getTimeTrigger$']().pipe(take(3));
            expectMarbles(trigger$, expected$, env);
        }));
    });


});
