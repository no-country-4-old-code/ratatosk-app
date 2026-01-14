import {UserRoleService} from '@app/services/user-role.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

export function getPermittedOptions$<T>(role: UserRoleService, freeOptions: T, allOptions: T): Observable<T> {
    const permission$ = role.getPermissionCheck$('showAllOptions');
    return permission$.pipe(
        map(permission => permission.isPermitted),
        map(isPermitted => isPermitted ? allOptions : freeOptions)
    );
}
