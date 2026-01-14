import {marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {OnDestroyMixin} from '@app/lib/components/mixin-on-destroy';
import {cold} from 'jasmine-marbles';

describe('Test mixin on destroy', function () {
    const mixin = new OnDestroyMixin();

    it('should complete stream if mixin is destroyed', () => marbleRun(env => {
        const stream$ = cold('a-b-c-d-e').pipe(mixin.takeUntilDestroyed());
        const trigger$ = env.hot('-----a---');
        const expected$ = cold('a-b-c|');
        trigger$.subscribe(trig => mixin.ngOnDestroy());
        env.expectObservable(stream$).toBe(expected$.marbles, expected$.values);
    }));

});
