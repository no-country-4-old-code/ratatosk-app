import {Observable, OperatorFunction} from 'rxjs';
import {filter, take, tap} from 'rxjs/operators';

export function onlyFirstEmitWillPass<T>(): OperatorFunction<T, T> {
    // Use instead of take(1) if take(1) is following by switchMap(..) [because it actually not work]
    const memory = {firstPass: true};
    return (source$: Observable<T>) => source$.pipe(
        filter(() => memory.firstPass),
        tap(() => {memory.firstPass = false;}),
        take(1) // to send a "cancel subscription"
    );
}
