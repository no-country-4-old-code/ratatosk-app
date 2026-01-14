import {Observable, of} from 'rxjs';
import {fromControl, MockControl} from '@test/helper-frontend/mocks/helper';
import {AuthService} from '@app/services/auth.service';

export interface MockControlAuth {
	authUserInfo$: Observable<any>;
	isLoggedIn$: Observable<boolean>;
}

export function buildMockControlAuthService(): MockControl<AuthService, MockControlAuth> {
	const control = {authUserInfo$: of(null), isLoggedIn$: of(null)};
	const mock = {
		getTokenId$: () => of(null),
		authUserInfo$: fromControl(() => control.authUserInfo$),
		isLoggedIn$: fromControl(() => control.isLoggedIn$)
	} as any as AuthService;
	return {mock, control};
}
