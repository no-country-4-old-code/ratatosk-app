import {combineLatest, Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';

export function selectByIdx$<T>(array$: Observable<T[]>, idx$: Observable<number>, verbose = true): Observable<T> {
    return combineLatest(array$, idx$).pipe(
        tap(([array, idx]) => logOverflow(array, idx, verbose)),
        map(([array, idx]) => array[idx % array.length])
    );
}

export function selectByStaticIdx$<T>(array$: Observable<T[]>, idx: number, verbose = true): Observable<T> {
    return array$.pipe(
        tap(array => logOverflow(array, idx, verbose)),
        map(array => array[idx % array.length])
    );
}

function logOverflow<T>(array: T[], index: number, logEnable: boolean): void {
    if (index >= array.length && logEnable) {
        console.warn(`Overflow: Used index of ${index} for array with length ${array.length}: `, array);
    }
}
