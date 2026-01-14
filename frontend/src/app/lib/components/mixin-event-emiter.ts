import {EventEmitter} from '@angular/core';
import {Observable} from 'rxjs';
import {OnDestroyMixin} from '@app/lib/components/mixin-on-destroy';


export class EventEmitterMixin extends OnDestroyMixin {
    /*
    Reactive components which emit events often need to map streams to event emitter output.
    This mixin handles the automatic unsubscribe.
     */

    protected mapStream2Event<T>(change$: Observable<T>, event: EventEmitter<T>): void {
        change$.pipe(
            this.takeUntilDestroyed()
        ).subscribe(change => event.emit(change));
    }

}
