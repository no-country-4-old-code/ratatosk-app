import {Observable, of} from 'rxjs';
import {fromControl, MockControl} from '@test/helper-frontend/mocks/helper';
import {PermissionCheckResult, RestrictedAction, UserRole} from '@app/lib/user-role/permission-check/interfaces';
import {UserRoleService} from '@app/services/user-role.service';

export interface MockControlRole {
	role$: Observable<UserRole>;
	permission$: Observable<PermissionCheckResult>;
	readonly permissionParams: RestrictedAction[];
}

export function buildMockControlUserRole(): MockControl<UserRoleService, MockControlRole> {
	const control = {role$: of(null), permission$: of(null), permissionParams: []};
	const mock = {
		role$: fromControl(() => control.role$),
		getPermissionCheck$: (action: RestrictedAction) => {
			control.permissionParams.push(action);
			console.log('uff ', action);
			return fromControl(() => control.permission$);
		},
	} as UserRoleService;
	return {mock, control};
}
