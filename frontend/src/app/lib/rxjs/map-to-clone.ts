import {Observable, OperatorFunction} from 'rxjs';
import {map} from 'rxjs/operators';
import {deepCopy} from '../../../../../shared-library/src/functions/general/object';

export function mapToClone<T>(): OperatorFunction<T, T> {
    // Use clone to prevent side-effect when working on objects of same reference (used for all global streams [mostly form services])
    return (source$: Observable<T>) => source$.pipe(
        map(source => deepCopy(source))
    );
}
