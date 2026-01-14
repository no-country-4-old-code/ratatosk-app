import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-fab-button-secondary',
  templateUrl: './fab-button-secondary.component.html',
  styleUrls: ['./fab-button-secondary.component.scss']
})
export class FabButtonSecondaryComponent implements OnInit {
  @Input() icon: string;
  @Input() isDisabled$: Observable<boolean> = of(false);
  @Input() isOnlyButton: boolean = false;
  @Output() clickedAndEnabled = new EventEmitter<boolean>();
  isDisabledObj$: Observable<{ isDisabled: boolean }>;

  constructor() {
  }

  ngOnInit() {
    this.isDisabledObj$ = this.isDisabled$.pipe(map(isDisabled => ({isDisabled})));
  }

  onClick(isDisabled: boolean) {
    if (!isDisabled) {
      this.clickedAndEnabled.emit(true);
    }
  }
}
