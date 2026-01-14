import {Observable, of} from 'rxjs';

export function handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
        console.error(`${operation} failed: ${error.message}`, error);
        return of(result as T);
    };
}

export function throwErrorIfInvalid(obj, info = 'Object is invalid') {
    if (!obj) {
        const msg = info + ' : ' + obj;
        console.error(msg);
        throw new Error(msg);
    }
}

export function printErrorIfDifferentLength(array1: any[], array2: any[], msg?: string): void {
    if (array1.length !== array2.length) {
        console.error('Length of given arrays differ ! : ' + msg);
    }
}
