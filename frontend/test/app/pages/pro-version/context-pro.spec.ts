import {expectMarbles, marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {ContextProComponent} from '@app/pages/pro-version/_components/context-pro/context-pro.component';
import {buildAllMocks, MockControlArray} from '@test/helper-frontend/mocks/all';
import {cold} from 'jasmine-marbles';
import {
    lookupMarble2AuthInfo,
    lookupMarble2Boolean,
    lookupMarble2Numbers,
    MarbleLookup
} from '@test/helper-frontend/marble/lookup';
import {of} from 'rxjs';
import {createDummyUserData} from '../../../../../shared-library/src/functions/test-utils/dummy-data/user';
import {UserData} from '../../../../../shared-library/src/datatypes/user';
import {firebaseAppCallCloudFunctionsUrl} from '@shared_library/settings/firebase-projects';

describe('Test pro version - context pro', function () {
    const lookupUser: MarbleLookup<UserData> = {
        t: {...createDummyUserData(), pro: {hasCanceledProVersion: true, useProVersionUntil: 123456}},
        f: {...createDummyUserData(), pro: {hasCanceledProVersion: false, useProVersionUntil: 654321000}}
    };
    let component: ContextProComponent;
    let mocks: MockControlArray;

    beforeEach(function () {
        mocks = buildAllMocks();
        component = new ContextProComponent(mocks.user.mock, mocks.auth.mock, mocks.http.mock, mocks.dialog.mock);
        mocks.auth.control.authUserInfo$ = cold('a', lookupMarble2AuthInfo);
    });


    describe('Test cancel of subscription', function () {
        const url = firebaseAppCallCloudFunctionsUrl['USER_001'] + '/cancelPro';
        const tokenId = 'miauMiauId';
        let spyHttp, spyDialog;

        beforeEach(function () {
            spyHttp = spyOn(mocks.http.mock, 'get').and.returnValue(of(null));
            spyDialog = spyOn(mocks.dialog.mock, 'open').and.callThrough();
            spyOn(mocks.auth.mock, 'getTokenId$').and.returnValue(of(tokenId));
            mocks.dialog.control.afterClosed$ = cold('a', lookupMarble2Numbers);
        });

        function act(expectedCancel: boolean, env): void {
            (spyDialog.calls.allArgs()[0][1].data as any).stream$.subscribe();
            env.flush();
            expect(spyDialog).toHaveBeenCalledTimes(1);
            expect(spyHttp).toHaveBeenCalledTimes(1);
            expect(spyHttp).toHaveBeenCalledWith(url, {
                params: {
                    token: tokenId,
                    setCanceled: expectedCancel as any as string
                }
            });
        }

        it('should request cancel by setting cancel flag to true', () => marbleRun(env => {
            component.setCancelStatus(true);
            act(true, env);
        }));

        it('should request cancel of cancel by setting cancel flag to false', () => marbleRun(env => {
            component.setCancelStatus(false);
            act(false, env);
        }));
    });

    describe('Test canceled status stream', function () {

        it('should update according to user', () => marbleRun(env => {
            mocks.user.control.user$ = env.hot('t-f-f-t', lookupUser);
            const expected$ = cold('t-f---t', lookupMarble2Boolean);
            expectMarbles(component.isCanceled$, expected$, env);
        }));
    });

    describe('Test expire date stream', function () {
        const lookupExpire: MarbleLookup<string> = {
            a: new Date(1970, 0, 1).toLocaleDateString(),
            b: new Date(1970, 0, 8).toLocaleDateString()
        };

        it('should update according to user', () => marbleRun(env => {
            mocks.user.control.user$ = env.hot('t-f-f-t', lookupUser);
            const expected$ = cold('a-b---a', lookupExpire);
            expectMarbles(component.expiredInfo$, expected$, env);
            expect(['8.1.1970', '1/8/1970']).toContain(lookupExpire.b); // depends on language settings of system
        }));
    });

});
