import {marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {buildAllMocks, MockControlArray} from '@test/helper-frontend/mocks/all';
import {cold} from 'jasmine-marbles';
import {lookupMarble2AuthInfo, lookupMarble2Numbers} from '@test/helper-frontend/marble/lookup';
import {of} from 'rxjs';
import {firebaseAppCallCloudFunctionsUrl} from '@shared_library/settings/firebase-projects';
import {ProVersionComponent} from "@app/pages/pro-version/pro-version/pro-version.component";

describe('Test pro version - context user', function () {
    let component: ProVersionComponent;
    let mocks: MockControlArray;

    beforeEach(function () {
        mocks = buildAllMocks();
        component = new ProVersionComponent(mocks.user.mock, mocks.auth.mock, mocks.http.mock, mocks.dialog.mock, mocks.role.mock);
        mocks.auth.control.authUserInfo$ = cold('a', lookupMarble2AuthInfo);
    });

    describe('Test buy of subscription', function () {
        const url = firebaseAppCallCloudFunctionsUrl['USER_001'] + '/buyPro';
        const tokenId = 'miauMiauId1234';
        let spyHttp, spyDialog;

        beforeEach(function () {
            spyHttp = spyOn(mocks.http.mock, 'get').and.returnValue(of(null));
            spyDialog = spyOn(mocks.dialog.mock, 'open').and.callThrough();
            spyOn(mocks.auth.mock, 'getTokenId$').and.returnValue(of(tokenId));
            mocks.dialog.control.afterClosed$ = cold('a', lookupMarble2Numbers);
        });

        xit('should request buy ', () => marbleRun(env => {
            component.giveFeedback();
            (spyDialog.calls.allArgs()[0][1].data as any).stream$.subscribe();
            env.flush();
            expect(spyDialog).toHaveBeenCalledTimes(1);
            expect(spyHttp).toHaveBeenCalledTimes(1);
            expect(spyHttp).toHaveBeenCalledWith(url, {params: {token: tokenId}});
        }));
    });
});
