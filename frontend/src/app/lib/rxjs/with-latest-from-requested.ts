import {Observable, OperatorFunction} from 'rxjs';
import {map, switchMap, take} from 'rxjs/operators';

export function withLatestFromRequested<T, T2>(hotReplayedStream$: Observable<T2>): OperatorFunction<T, [T, T2]> {
    // like "withLatestFrom" but it returns the newest stuff (no need for delay(1) to solve stream race)
    return (source$: Observable<T>) => source$.pipe(
        switchMap((source: T) => hotReplayedStream$.pipe(
            take(1),
            map((content: T2): [T, T2] => [source, content]))));
}
