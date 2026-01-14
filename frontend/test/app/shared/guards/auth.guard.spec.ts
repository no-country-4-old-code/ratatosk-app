import {IsEmailVerifiedGuard} from '@app/shared/guards/verifiy-email.guard';
import {buildAllMocks, MockControlArray} from '@test/helper-frontend/mocks/all';
import {of} from 'rxjs';


describe('AuthGuard', () => {
    let mocks: MockControlArray;
    let guard: IsEmailVerifiedGuard;
    let spyNavigate: jasmine.Spy;
    const urlLogin = '/menu/options/login';
    const routeToOtherLogin: any = {url: urlLogin};
    const routeToOtherPage: any = {url: 'other/route'};

    beforeEach(() => {
        mocks = buildAllMocks();
        spyNavigate = spyOn(mocks.router.mock, 'navigate').and.returnValue(null);
        guard = new IsEmailVerifiedGuard(mocks.auth.mock, mocks.router.mock);
    });

    function expectRedirect(): void {
        expect(spyNavigate).toHaveBeenCalledTimes(1);
        expect(spyNavigate).toHaveBeenCalledWith([urlLogin]);
    }

    function expectNoRedirect(): void {
        expect(spyNavigate).toHaveBeenCalledTimes(0);
    }

    it('should redirect to login if user has no verified email, is not demo and navigate to a page different from login', () => {
        mocks.auth.control.authUserInfo$ = of({isDemo: false, emailVerified: false});
        guard.canActivate(null, routeToOtherPage).subscribe();
        expectRedirect();
    });

    it('should not redirect to login if user already navigate to login page', () => {
        mocks.auth.control.authUserInfo$ = of({isDemo: false, emailVerified: false});
        guard.canActivate(null, routeToOtherLogin).subscribe();
        expectNoRedirect();
    });

    it('should not redirect to login if user is demo user', () => {
        mocks.auth.control.authUserInfo$ = of({isDemo: true, emailVerified: false});
        guard.canActivate(null, routeToOtherPage).subscribe();
        expectNoRedirect();
    });

    it('should not redirect to login if user has a verified email', () => {
        mocks.auth.control.authUserInfo$ = of({isDemo: false, emailVerified: true});
        guard.canActivate(null, routeToOtherPage).subscribe();
        expectNoRedirect();
    });
});
