import {marbleRun} from '@test/helper-frontend/marble/functions.spec';
import {cold} from 'jasmine-marbles';
import {EventEmitterMixin} from '@app/lib/components/mixin-event-emiter';
import {EventEmitter} from '@angular/core';
import {Observable} from 'rxjs';

class A extends EventEmitterMixin {
    eventEmitter = new EventEmitter();

    public stream2Event(stream$: Observable<any>) {
        this.mapStream2Event(stream$, this.eventEmitter);
    }

}

describe('Test mixin event emitter', function () {

    function act(stream$, trigger$, expected, env) {
        const testClass = new A();
        const collected = [];
        testClass.stream2Event(stream$);
        testClass.eventEmitter.subscribe(char => collected.push(char));
        trigger$.subscribe(trig => testClass.ngOnDestroy());
        env.flush();
        expect(collected).toEqual(expected);
    }

    it('should complete stream if mixin is destroyed', () => marbleRun(env => {
        const stream$ = cold('a-b-c-d-e');
        const trigger$ = env.hot('-----a---');
        const expected = ['a', 'b', 'c'];
        act(stream$, trigger$, expected, env);
    }));

});
