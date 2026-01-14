import {marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {cold} from 'jasmine-marbles';
import {withLatestFromRequested} from '@app/lib/rxjs/with-latest-from-requested';
import {MarbleLookup} from '@test/helper-frontend/marble/lookup';
import {shareReplay} from 'rxjs/operators';

describe('Test own rxjs operator withLatestFromRequested', function () {
    const lookup: MarbleLookup<string[]> = {
        a: ['a', 'a'],
        b: ['a', 'b'],
        c: ['a', 'c'],
        d: ['b', 'a'],
        e: ['b', 'b'],
        f: ['b', 'c']
    };

    it('should only take one', () => marbleRun(env => {
        const stream1$ = cold('a------');
        const stream2$ = env.hot('--a-b-c').pipe(shareReplay(1));
        const expected$ = cold('--a----', lookup);
        const result$ = stream1$.pipe(withLatestFromRequested(stream2$));
        env.expectObservable(result$).toBe(expected$.marbles, expected$.values);
    }));

    it('should always take latest', () => marbleRun(env => {
        const stream1$ = cold('a--a--a');
        const stream2$ = env.hot('a--b--c').pipe(shareReplay(1));
        const expected$ = cold('a--b--c', lookup);
        stream2$.subscribe(); // otherwise first value get lost
        const result$ = stream1$.pipe(withLatestFromRequested(stream2$));
        env.expectObservable(result$).toBe(expected$.marbles, expected$.values);
    }));

    it('should vary based on src stream', () => marbleRun(env => {
        const stream1$ = cold('a---b---b');
        const stream2$ = env.hot('--a--b-c-').pipe(shareReplay(1));
        const expected$ = cold('--a-d---f', lookup);
        const result$ = stream1$.pipe(withLatestFromRequested(stream2$));
        env.expectObservable(result$).toBe(expected$.marbles, expected$.values);
    }));
});
