import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {combineLatest, Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {AbstractSelector} from '@app/lib/components/abstract-selector';


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-selector-slide',
    templateUrl: './selector-slide.component.html',
    styleUrls: ['./selector-slide.component.scss']
})
export class SelectorSlideComponent<T> extends AbstractSelector<T> implements OnInit {
    readonly minIndex = 0;
    readonly stepWidth = 1;
    maxIndex$: Observable<number>;
    indexFromExternal$: Observable<number>;

    ngOnInit() {
        const optionsShared$ = this.options$.pipe(shareReplay(1));
        const selectedOption$ = this.selected$.pipe(map(options => options[0]));
        this.maxIndex$ = this.getMaxIndex$(optionsShared$);
        this.indexFromExternal$ = this.getSelectedIndex$(optionsShared$, selectedOption$);
    }

    emitSelectionChangeEvent(index: number, options: T[]): void {
        const selected = options[index];
        this.onSelection.emit([selected]);
    }

    // private

    private getMaxIndex$<T>(options$: Observable<T[]>): Observable<number> {
        return options$.pipe(
            map(options => options.length - 1),
        );
    }

    private getSelectedIndex$<T>(options$: Observable<T[]>, selectedOption$: Observable<T>): Observable<number> {
        return combineLatest(selectedOption$, options$).pipe(
            map(([selected, options]) => options.indexOf(selected)),
            shareReplay(1)
        );
    }
}
