import {AreScansSynchronizedService} from '@app/services/are-scans-synchronized.service';
import {buildAllMocks, MockControlArray} from '@test/helper-frontend/mocks/all';
import {expectMarbles, marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {cold} from 'jasmine-marbles';
import {lookupMarble2AuthInfo, lookupMarble2Boolean, MarbleLookup} from '@test/helper-frontend/marble/lookup';
import {UserData} from '@shared_library/datatypes/user';
import {createDummyUserData} from '@shared_library/functions/test-utils/dummy-data/user';
import {createCoinHistoryWithMetaData} from '@test/helper-frontend/dummy-data/asset-specific/coin';
import {Observable, of} from 'rxjs';
import {AuthInfo} from '@app/services/auth.service';

describe('Test scan synchronisation check service', function () {
    let mocks: MockControlArray;
    let service: AreScansSynchronizedService;
    let lookupUser: MarbleLookup<UserData>;

    function createUser(proUntil: number, lastCalculationTimestampMs: number, numberOfScans = 3): UserData {
        const user = createDummyUserData(numberOfScans);
        user.pro.useProVersionUntil = proUntil;
        user.scans.forEach(scan => {
            scan.timestampResultData = lastCalculationTimestampMs;
        });
        return user;
    }

    beforeEach(function () {
        mocks = buildAllMocks();
        service = new AreScansSynchronizedService(mocks.auth.mock, mocks.user.mock, mocks.coin.mock);
        const timestampFuture = Date.now() + 10000;
        lookupUser = {
            f: createUser(0, 0),
            t: createUser(0, timestampFuture),
            e: createUser(0, timestampFuture, 0),
            p: createUser(timestampFuture, 0),
        };
    });

    function act(auth$: Observable<AuthInfo>, user$: Observable<UserData>, expected$, env): void {
        const bucket = createCoinHistoryWithMetaData(0);
        bucket.meta.timestampMs = Date.now();
        mocks.auth.control.authUserInfo$ = auth$;
        mocks.user.control.user$ = user$;
        spyOn(mocks.coin.mock, 'getCoinHistoryWithMetaData').and.returnValue(of(bucket));
        expectMarbles(service.areScansSynchronized$, expected$, env);
    }

    it('should return false if user is not demo or pro and timestamp is lower server', () => marbleRun(env => {
        const auth$ = cold(     'a------', lookupMarble2AuthInfo);
        const user$ = cold(     'f-t-t-f', lookupUser);
        const expected$ = cold( 'f-t---f', lookupMarble2Boolean);
        act(auth$, user$, expected$, env);
    }));

    it('should return true if is demo or pro', () => marbleRun(env => {
        const auth$ = cold(     'a-d---a--', lookupMarble2AuthInfo);
        const user$ = cold(     'f---p---f', lookupUser);
        const expected$ = cold( 'f-t-----f', lookupMarble2Boolean);
        act(auth$, user$, expected$, env);
    }));

    it('should return false if user is not demo or pro and has no scans', () => marbleRun(env => {
        const auth$ = cold(     'a------', lookupMarble2AuthInfo);
        const user$ = cold(     't-e-e-t', lookupUser);
        const expected$ = cold( 't-f---t', lookupMarble2Boolean);
        act(auth$, user$, expected$, env);
    }));
});