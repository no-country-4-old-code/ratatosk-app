import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {distinctUntilChanged, filter, map} from 'rxjs/operators';
import {FormControl, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {OnDestroyMixin} from '@lib/components/mixin-on-destroy';
import {isValueInRange, MinMax} from '@shared_library/scan/indicator-functions/params/min-max';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-selector-number-form',
  templateUrl: './selector-number.component.html',
  styleUrls: ['./selector-number.component.scss']
})
export class SelectorNumberComponent extends OnDestroyMixin implements OnInit {
  @Input() selected$: Observable<number[]>; // input / output is selector compatible
  @Input() minMax: MinMax;
  @Output() onSelection = new EventEmitter<number[]>();
  readonly inputControl = new FormControl();

  ngOnInit() {
    this.inputControl.setValidators([Validators.min(this.minMax.min), Validators.max(this.minMax.max)]);
    const internalChanges$ = this.getInternalValueChanges();
    const externalChanges$ = this.getExternalValueChanges();
    internalChanges$.subscribe(newValue => this.onSelection.emit([newValue]));
    externalChanges$.subscribe(currentValue => this.inputControl.setValue(currentValue));
  }

  // private
  private getInternalValueChanges(): Observable<number> {
    return this.inputControl.valueChanges.pipe(
        this.takeUntilDestroyed(),
        filter(newValue => this.isNumber(newValue)),
        map(newValue => Number(newValue)),
        filter(newValue => isValueInRange(newValue, this.minMax)),
        distinctUntilChanged()
    );
  }

  private getExternalValueChanges(): Observable<number> {
    return this.selected$.pipe(
        this.takeUntilDestroyed(),
        filter(array => array.length > 0),
        map(array => array[0]),
        filter(currentValue => this.isNumber(currentValue)),
        map(newValue => Number(newValue)),
        distinctUntilChanged(),
    );
  }

  private isNumber(newValue: any): boolean {
    return ! isNaN(Number(newValue));
  }
}
