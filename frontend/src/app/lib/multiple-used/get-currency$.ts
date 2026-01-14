import {UserService} from '@app/services/user.service';
import {distinctUntilChanged, map, shareReplay} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {Currency} from '../../../../../shared-library/src/datatypes/currency';

export function getCurrency$(userService: UserService): Observable<Currency> {
    return userService.user$.pipe(
        map(user => user.settings.currency),
        distinctUntilChanged(),
        shareReplay(1));
}
