import {Observable, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';

export interface MockControl<A, B> {
	mock: A;
	control: B;
}

export function fromControl<T>(get: () => Observable<T>): Observable<T> {
	// the observable under mockControl could be modified after construction
	return of('dummy').pipe(
		switchMap(trig => get() ));
}

export function emptyArray(array) {
	while (array.length) {
		array.pop();
	}
}
