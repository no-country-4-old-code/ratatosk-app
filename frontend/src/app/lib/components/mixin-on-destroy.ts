import {Component, OnDestroy} from '@angular/core';
import {Observable, ReplaySubject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
    template: ''
})
export class OnDestroyMixin implements OnDestroy {
    /*
    Automatically unsubscribe if used with take until destroyed.
    Do not overwrite ngOnDestroy()
     */
    readonly subjectDestroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

    takeUntilDestroyed() {
        const destroyed$ = this.subjectDestroyed$.asObservable();
        return (source$: Observable<any>) => source$.pipe(
            takeUntil(destroyed$));
    }

    ngOnDestroy(): void {
        this.subjectDestroyed$.next(true);
        this.subjectDestroyed$.complete();
    }
}
