import {expectMarbles, marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {cold} from 'jasmine-marbles';
import {map} from 'rxjs/operators';
import {OptionsComponent} from '@app/pages/main-menu/options/options.component';
import {buildAllMocks, MockControlArray} from '@test/helper-frontend/mocks/all';
import {lookupMarble2Boolean, MarbleLookup} from '@test/helper-frontend/marble/lookup';
import {AuthInfo} from '@app/services/auth.service';
import {appInfo} from '@lib/global/app-info';


describe('OptionsComponent', () => {
    let component: OptionsComponent;
    let mocks: MockControlArray;

    beforeEach(function () {
        mocks = buildAllMocks();
        component = new OptionsComponent(null, mocks.route.mock, mocks.auth.mock, mocks.snackbar.mock, mocks.clipboard.mock);
    });

    describe('Test sharing dialog', function () {
        let act: () => void;
        let spyOnShare: jasmine.Spy, spyOnSnackbar: jasmine.Spy, spyOnClipboard: jasmine.Spy;

        beforeEach(function () {
            act = () => component['triggerSharingDialog']();
            (navigator as any).share = (msg: string) => new Promise((resolve) => resolve({}));
            spyOnShare = spyOn((navigator as any), 'share').and.callThrough();
            spyOnSnackbar = spyOn(mocks.snackbar.mock, 'open').and.callThrough();
            spyOnClipboard = spyOn(mocks.clipboard.mock, 'copy').and.callThrough();
        });

        it('should open share dialog of device if supported', function () {
            (navigator as any).canShare = true;
            act();
            expect(spyOnShare).toHaveBeenCalledTimes(1);
            expect(spyOnSnackbar).toHaveBeenCalledTimes(0);
            expect(spyOnClipboard).toHaveBeenCalledTimes(0);
        });

        it('should copy url and open snackbar if device share dialog is not supported', function () {
            (navigator as any).canShare = undefined;
            act();
            expect(spyOnShare).toHaveBeenCalledTimes(0);
            expect(spyOnSnackbar).toHaveBeenCalledTimes(1);
            expect(spyOnClipboard).toHaveBeenCalledTimes(1);
            expect(spyOnClipboard).toHaveBeenCalledWith(appInfo.url);
        });

    });

    describe('Test update user banner', function () {
        const lookupAuthInfo: MarbleLookup<Partial<AuthInfo>> = {
            a: {isDemo: false, email: 'miau'},
            b: {isDemo: false, email: 'wuff'},
            c: {isDemo: true, email: 'demo'},
        };
        const lookupTitleExpected: MarbleLookup<string | undefined> = {
            a: '\nmiau',
            b: '\nwuff',
            c: 'Login or register'
        };

        function act(authInfo$, expected$, env): void {
            mocks.auth.control.authUserInfo$ = authInfo$;
            const subtext$ = component.userBanner$.pipe(
                map(banner => banner.title)
            );
            expectMarbles(subtext$, expected$, env);
        }

        it('should show email as subtext for non-demo user', () => marbleRun(env => {
            const authInfo$ = cold('a-b-b-a', lookupAuthInfo);
            const expected$ = cold('a-b---a', lookupTitleExpected);
            act(authInfo$, expected$, env);
        }));

        it('should show demo note as subtext if no user is logged in', () => marbleRun(env => {
            const authInfo$ = cold('c-c', lookupAuthInfo);
            const expected$ = cold('c--', lookupTitleExpected);
            act(authInfo$, expected$, env);
        }));

        it('should change banner according to user', () => marbleRun(env => {
            const authInfo$ = cold('a-b-c-b-a', lookupAuthInfo);
            const expected$ = cold('a-b-c-b-a', lookupTitleExpected);
            act(authInfo$, expected$, env);
        }));
    });

    describe('Test options', function () {

        function act(isLoggedIn$, expectedProOptionAvailable$, env): void {
            mocks.auth.control.isLoggedIn$ = isLoggedIn$;
            const isProOptionAvailable$ = component.options$.pipe(
                map(options => options.map(opt => opt.title)),
                map(titles => titles.join(',').toUpperCase().includes(',PRO '))
            );
            expectMarbles(isProOptionAvailable$, expectedProOptionAvailable$, env);
        }

        it('should start with pro version option not available', () => marbleRun(env => {
            const isLoggedIn$ = cold(                '---', lookupMarble2Boolean);
            const expectedProOptionAvailable$ = cold('f--', lookupMarble2Boolean);
            act(isLoggedIn$, expectedProOptionAvailable$, env);
        }));

        it('should only contain pro version option if user is logged in (== not DEMO)', () => marbleRun(env => {
            const isLoggedIn$ = cold(                'f-t-t-f', lookupMarble2Boolean);
            const expectedProOptionAvailable$ = cold('f-t---f', lookupMarble2Boolean);
            act(isLoggedIn$, expectedProOptionAvailable$, env);
        }));

    });

});
