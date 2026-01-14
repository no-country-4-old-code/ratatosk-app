import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {
    DialogSelectOneComponent,
    DialogSelectOneData
} from '@shared_comp/dialog-select-one/dialog-select-one.component';
import {dialogWidth, updateOnDialogClose} from '@app/lib/util/dialog';
import {MatDialog} from '@angular/material/dialog';
import {AbstractSelector} from '@app/lib/components/abstract-selector';
import {Observable} from 'rxjs';
import {distinctUntilChanged, map, shareReplay, switchMap} from 'rxjs/operators';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-selector-condition-option',
    templateUrl: './selector-condition-option.component.html',
    styleUrls: ['./selector-condition-option.component.scss']
})
export class SelectorConditionOptionComponent<T> extends AbstractSelector<T> implements OnInit {
    @Input() optionsInfos$: Observable<string[]>;
    @Input() title = '';
    displayedSelection$: Observable<string>;

    constructor(private dialog: MatDialog) {
        super();
    }

    ngOnInit(): void {
        this.displayedSelection$ = this.selected$.pipe(
            switchMap((selected) => this.mapOption2String$(selected[0])),
            distinctUntilChanged(),
            shareReplay(1),
            map(ele => ele.slice())
        );
    }

    openDialog(options: string[], optionsInfo: string[], selected: string): void {
        const map2Name$ = (option) => this.mapOption2String$(option);
        const data: DialogSelectOneData = {options, selected, optionsInfo, title: this.title, map2Name$};
        const dialogRef = this.dialog.open(DialogSelectOneComponent, {width: dialogWidth, data});
        updateOnDialogClose<T>(dialogRef, this.updateFunc);
    }

    // private

    private updateFunc = (result: T) => {
        this.onSelection.emit([result]);
    };

}
