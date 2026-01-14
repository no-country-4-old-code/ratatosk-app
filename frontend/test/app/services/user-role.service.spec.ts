import {UserRoleService} from '@app/services/user-role.service';
import {buildAllMocks, MockControlArray} from '@test/helper-frontend/mocks/all';
import {marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {cold} from 'jasmine-marbles';
import {createDummyUserData} from '../../../../shared-library/src/functions/test-utils/dummy-data/user';
import {lookupMarble2Boolean, lookupMarble2Numbers, MarbleLookup} from '@test/helper-frontend/marble/lookup';
import {RestrictedAction, UserRole} from '@app/lib/user-role/permission-check/interfaces';
import {map, pluck, tap} from 'rxjs/operators';
import {createDummyAuthInfo} from '@test/helper-frontend/dummy-data/auth';
import {Observable} from 'rxjs';
import {createDummyScans} from '../../../../shared-library/src/functions/test-utils/dummy-data/scan';
import {ScanFrontend} from '@app/lib/scan/interfaces';
import {createDummyScanWithConditions} from '@test/helper-frontend/dummy-data/view';
import {createRangeArray} from '../../../../shared-library/src/functions/general/array';
import {createDummyConditionAlwaysTrue} from '../../../../shared-library/src/functions/test-utils/dummy-data/condition';

describe('UserRoleService', () => {
  let service: UserRoleService;
  let mocks: MockControlArray;
  const lookupRole: MarbleLookup<UserRole> = {d: 'demo', u: 'user', p: 'pro'};

  function setMocks(isDemo$: Observable<boolean>, hasProVersion$: Observable<boolean>) {
    const offsetMs = 100;
    const hasProVersionTimestampMs = Date.now() + offsetMs;
    const hasNoProVersionTimestampMs = offsetMs;
    mocks.user.control.user$ = hasProVersion$.pipe(
        map( hasProVersion => (hasProVersion) ? hasProVersionTimestampMs : hasNoProVersionTimestampMs),
        map( useProVersionUntil => {
          const user = createDummyUserData();
          user.pro.useProVersionUntil = useProVersionUntil;
          return user; }),
        tap(x => console.log(x))
    );
    mocks.auth.control.authUserInfo$ = isDemo$.pipe(
        map( isDemo => ({...createDummyAuthInfo('123'), ...{isDemo}}))
    );
  }

  beforeEach(function () {
    mocks = buildAllMocks();
    service = new UserRoleService(mocks.scan.mock, mocks.auth.mock, mocks.user.mock, mocks.build.mock);
  });

  describe('Test role stream', function () {

    it('should update role when user data leads to role change', () => marbleRun( env => {
      const isDemo$ = cold(       'f------', lookupMarble2Boolean);
      const hasProVersion$ = cold('t-f-f-t', lookupMarble2Boolean);
      const expected$ = cold(     'p-u---p', lookupRole);
      setMocks(isDemo$, hasProVersion$);
      env.expectObservable(service.role$).toBe(expected$.marbles, expected$.values);
    }));

    it('should update role when auth data leads to role change', () => marbleRun( env => {
      const isDemo$ = cold(       't-f-f-t', lookupMarble2Boolean);
      const hasProVersion$ = cold('f------', lookupMarble2Boolean);
      const expected$ = cold(     'd-u---d', lookupRole);
      setMocks(isDemo$, hasProVersion$);
      env.expectObservable(service.role$).toBe(expected$.marbles, expected$.values);
    }));

    it('should ignore pro version info if user uses demo mode', () => marbleRun( env => {
      const isDemo$ = cold(       't-------', lookupMarble2Boolean);
      const hasProVersion$ = cold('t-f-f-t-', lookupMarble2Boolean);
      const expected$ = cold(     'd-------', lookupRole);
      setMocks(isDemo$, hasProVersion$);
      env.expectObservable(service.role$).toBe(expected$.marbles, expected$.values);
      }));
  });

  describe('Test check permission', function () {


    function setUp(action: RestrictedAction, numberOfViews$: Observable<number>, numberOfConditions$: Observable<number>): Observable<boolean> {
      mocks.scan.control.scans$ = numberOfViews$.pipe(
          map(numberOfViews => createDummyScans(numberOfViews) as ScanFrontend[]),
      );
      mocks.build.control.scan$ = numberOfConditions$.pipe(
          map( numberOfConditions => {
            const conditions = createRangeArray(numberOfConditions).map(tmp => createDummyConditionAlwaysTrue());
            return createDummyScanWithConditions(conditions);
          })
      );
      return service.getPermissionCheck$(action).pipe(pluck('isPermitted'));
    }

    beforeEach(function () {
      const isDemo$ = cold('f', lookupMarble2Boolean);
      const hasProVersion$ = cold('f', lookupMarble2Boolean);
      setMocks(isDemo$, hasProVersion$);
    });

    it('should use role user for test', () => marbleRun( env => {
      const expected$ = cold('u', lookupRole);
      env.expectObservable(service.role$).toBe(expected$.marbles, expected$.values);
    }));

    it('should update permission dynamically based on input data (addScan)', () => marbleRun( env => {
      const numberOfViews$ =      cold(    'a-c-d-e-d-c-b--------', lookupMarble2Numbers);
      const numberOfConditions$ = cold(    'a-------------e-f-e-d', lookupMarble2Numbers);
      const expected$ = cold(              't---f-----t---f-----t', lookupMarble2Boolean);
      const permission$ = setUp('addScan', numberOfViews$, numberOfConditions$);
      env.expectObservable(permission$).toBe(expected$.marbles, expected$.values);
    }));

    it('should update permission dynamically based on input data (addCondition)', () => marbleRun( env => {
      const numberOfViews$ =      cold(    'a--------------', lookupMarble2Numbers);
      const numberOfConditions$ = cold(    'a-b-c-d-e-d-c-b', lookupMarble2Numbers);
      const expected$ = cold(              't-----f-----t--', lookupMarble2Boolean);
      const permission$ = setUp('addCondition', numberOfViews$, numberOfConditions$);
      env.expectObservable(permission$).toBe(expected$.marbles, expected$.values);
    }));

  });
});
