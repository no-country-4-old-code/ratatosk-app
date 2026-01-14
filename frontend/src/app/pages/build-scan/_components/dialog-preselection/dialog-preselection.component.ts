import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {distinctUntilChanged, map, shareReplay, startWith} from 'rxjs/operators';
import {combineLatest, Observable, Subject} from 'rxjs';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatCheckboxChange} from '@angular/material/checkbox';
import {materialIcons} from '@app/lib/global/icons';


export interface DialogPreselectionOptionData {
    id: string;
    iconPath: string;
    title: string;
    sidetext: string;
}

export interface DialogPreselectionData {
    title: string;
    optionsSelected: string[];
    optionsAvailable: DialogPreselectionOptionData[];
}

interface Option extends DialogPreselectionOptionData {
    checked: boolean;
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-dialog-preselection',
    templateUrl: './dialog-preselection.component.html',
    styleUrls: ['./dialog-preselection.component.scss']
})
export class DialogPreselectionComponent {
    readonly subjectOptions = new Subject<Option[]>();
    readonly subjectFilter = new Subject<string>();
    readonly areAllSelected$: Observable<boolean>;
    readonly optionsShown$: Observable<Option[]>;
    readonly selected$: Observable<string[]>;
    readonly icons = materialIcons;
    readonly idsOfAlloptions: string[];
    isSearchDialogActive = false;
    private readonly options: Option[];

    constructor(@Inject(MAT_DIALOG_DATA) public data: DialogPreselectionData) {
        this.idsOfAlloptions = this.getIdsOfAlloptions(this.data.optionsAvailable);
        this.options = this.mapData2Options(this.data.optionsAvailable);
        const options$ = this.getOptions$();
        this.optionsShown$ = this.getOptionsShown$(options$);
        this.selected$ = this.getSelected$(options$);
        this.areAllSelected$ = this.getAreAllSelected$();
    }

    updateElement(option: string) {
        const idx = this.options.findIndex(ele => ele.id === option);
        if (idx >= 0) {
            this.options[idx].checked = !this.options[idx].checked;
            this.subjectOptions.next(this.options);
        }
    }

    toggleAll(event: MatCheckboxChange) {
        if (event.checked) {
            this.enableAll();
        } else if (this.areAllSelected()) {
            this.disableAll();
        }
    }

    showSearch(isActive: boolean): void {
        this.isSearchDialogActive = isActive;
    }

    onSearchTermUpdate(term: string): void {
        this.subjectFilter.next(term);
    }

    // private

    private getIdsOfAlloptions(optionsDataAvailable: DialogPreselectionOptionData[]) {
        return optionsDataAvailable.map(option => option.id);
    }

    private mapData2Options(optionsDataAvailable: DialogPreselectionOptionData[]) {
        return optionsDataAvailable.map(option => ({
            ...option,
            checked: this.data.optionsSelected.includes(option.id)
        }));
    }

    private getOptions$() {
        return this.subjectOptions.asObservable().pipe(
            startWith(this.options),
            shareReplay(1)
        );
    }

    private getAreAllSelected$() {
        return this.selected$.pipe(map(ids => ids.length === this.idsOfAlloptions.length), distinctUntilChanged());
    }

    private getSelected$<T>(elements$: Observable<Option[]>) {
        return elements$.pipe(
            map(elements => elements.filter(ele => ele.checked).map(ele => ele.id))
        );
    }

    private getOptionsShown$(options$: Observable<Option[]>): Observable<Option[]> {
        const filter$ = this.subjectFilter.asObservable().pipe(
            startWith(''),
            distinctUntilChanged());

        return combineLatest(options$, filter$).pipe(
            map(([options, filterTerm]) => {
                return this.filterOptionsByTerm(options, filterTerm);
            }),
            map(options => [...options]),
            shareReplay(1),
        );
    }

    private areAllSelected(): boolean {
        return this.options.every(ele => ele.checked);
    }

    private disableAll() {
        this.options.forEach(ele => ele.checked = false);
        this.subjectOptions.next(this.options);
    }

    private enableAll() {
        this.options.forEach(ele => ele.checked = true);
        this.subjectOptions.next(this.options);
    }

    private filterOptionsByTerm(options: Option[], filterTerm: string): Option[] {
        return options.filter(option => this.isTermInOption(option, filterTerm));
    }

    private isTermInOption(option: Option, filterTerm: string): boolean {
        const optionTerms = [option.title, option.sidetext].map(t => t.toLowerCase());
        return optionTerms.some(term => term.toLowerCase().includes(filterTerm.toLowerCase()));
    }

}
