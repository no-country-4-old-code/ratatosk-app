import {TestScheduler} from 'rxjs/testing';
import {RunHelpers} from 'rxjs/internal/testing/TestScheduler';
import {TestColdObservable} from 'jasmine-marbles/src/test-observables';
import {Observable} from 'rxjs';

export function marbleRun(func) {
  const scheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });
  scheduler.run(helpers => func(helpers));
}

export function expectMarbles(result$: Observable<any>, expected$: TestColdObservable, env: RunHelpers): void {
  env.expectObservable(result$).toBe(expected$.marbles, expected$.values);
}

