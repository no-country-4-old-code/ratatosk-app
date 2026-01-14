import {Observable, of, Subject} from 'rxjs';
import {fromControl, MockControl} from '@test/helper-frontend/mocks/helper';
import {UserService} from '@app/services/user.service';
import {UserData} from '../../../../shared-library/src/datatypes/user';

export interface MockControlUser {
	user$: Observable<UserData>;
	updateResponse$: Observable<boolean>;
	readonly updateParams$: Observable<Partial<UserData>>;
}

export function buildMockControlUserService(): MockControl<UserService, MockControlUser> {
	const subjectUpdateParams = new Subject();
	const control = {user$: of(null), updateResponse$: of(true), updateParams$: subjectUpdateParams.asObservable()};
	const mock = {
		user$: fromControl(() => control.user$),
		updateUserData: (userData: Partial<UserData>) => {
			subjectUpdateParams.next(userData);
			return fromControl(() => control.updateResponse$);
		}
	} as UserService;
	return {mock, control};
}
