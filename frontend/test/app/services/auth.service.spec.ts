import {buildAllMocks, MockControlArray} from '@test/helper-frontend/mocks/all';
import {expectMarbles, marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {AuthInfo, AuthService} from '@app/services/auth.service';
import {lookupMarble2Boolean, MarbleLookup} from '@test/helper-frontend/marble/lookup';
import firebase from 'firebase/app';
import 'firebase/auth';
import {cold} from 'jasmine-marbles';
import {map} from 'rxjs/operators';
import {demoUID} from '@shared_library/settings/firebase-projects';

describe('AuthService', function () {
    const createGetToken = (tokenId) => () => tokenId;  // small hack for promise
    const createUser = (uid: string, tokenId: string): Partial<firebase.User> => ({uid, getIdToken: createGetToken(tokenId)});
    const lookupUser: MarbleLookup<Partial<firebase.User>> = {
        a: createUser('42', '0'),
        b: createUser('0', '1'),
        c: null
    };
    const lookupAuthInfo: MarbleLookup<Partial<AuthInfo>> = {
        a: {uid: lookupUser.a.uid, isDemo: false},
        b: {uid: lookupUser.b.uid, isDemo: false},
        c: {uid: demoUID, isDemo: true},
    };
    let service: AuthService;
    let mocks: MockControlArray;

    beforeEach(function () {
        mocks = buildAllMocks();
        service = new AuthService(mocks.fireauth.mock, null);
    });

    describe('Test get id token ', function () {

        it('should call token id of auth user', () => marbleRun(env => {
            mocks.fireauth.control.authState$ = cold('a-b-b-a', lookupUser);
            const expected$ = cold('a-b-b-a', {a: '0', b: '1'});
            const result$ = service.getTokenId$();
            expectMarbles(result$, expected$, env);
        }));

    });

    describe('Test auth user stream ', function () {

        function act(expected$, env): void {
            const result$ = service.authUserInfo$.pipe(
                map(info => ({uid: info.uid, isDemo: info.isDemo}))
            );
            expectMarbles(result$, expected$, env);
        }

        it('should return info of demo user if no user is logged in', () => marbleRun(env => {
            mocks.fireauth.control.authState$ = cold('c--', lookupUser);
            const expected$ = cold('c--', lookupAuthInfo);
            act(expected$, env);
        }));

        it('should update user info when auth state changes', () => marbleRun(env => {
            mocks.fireauth.control.authState$ = cold('a-b-b-a--c-a', lookupUser);
            const expected$ = cold('a-b---a--c-a', lookupAuthInfo);
            act(expected$, env);
        }));
    });

    describe('Test "is logged in" stream ', function () {

        it('should return true if not-demo user is logged in', () => marbleRun(env => {
            mocks.fireauth.control.authState$ = cold('-a-b-c-c-b-a', lookupUser);
            const expected$ = cold('-t---f---t--', lookupMarble2Boolean);
            expectMarbles(service.isLoggedIn$, expected$, env);
        }));
    });
});
