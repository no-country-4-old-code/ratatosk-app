import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {FunctionBlueprint} from "@shared_library/scan/indicator-functions/interfaces";
import {MatDialog} from "@angular/material/dialog";
import {distinctUntilChanged, map, shareReplay, switchMap} from "rxjs/operators";
import {dialogWidth, updateOnDialogClose} from "@lib/util/dialog";
import {
    DialogModifyFunctionComponent,
    DialogModifyFunctionData
} from "@app/pages/build-scan/_components/dialog-modify-function/dialog-modify-function.component";
import {AbstractSelector} from "@lib/components/abstract-selector";
import {ColorChart} from "@lib/chart-data/interfaces";
import {MetricHistory} from "@shared_library/datatypes/data";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-selector-modify-function',
  templateUrl: './selector-modify-function.component.html',
  styleUrls: ['./selector-modify-function.component.scss']
})
export class SelectorModifyFunctionComponent<T> extends AbstractSelector<T> implements OnInit {
  @Input() functionBlueprint: FunctionBlueprint;
  @Input() metric: MetricHistory<any>;
  @Input() color: ColorChart;
  displayedSelection$: Observable<string>;
  readonly title;

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

  openDialog(): void {
    const dataFunc: DialogModifyFunctionData = {functionBlueprint: this.functionBlueprint, metric: this.metric};
    const dialogRef = this.dialog.open(DialogModifyFunctionComponent, {width: dialogWidth, data: dataFunc});
    updateOnDialogClose<T>(dialogRef, this.updateFunc);
  }

  // private

  private updateFunc = (result: T) => {
    this.onSelection.emit([result]);
  };

}
