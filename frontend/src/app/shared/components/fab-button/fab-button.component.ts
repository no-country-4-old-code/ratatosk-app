import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
	selector: 'app-fab-button',
	templateUrl: './fab-button.component.html',
	styleUrls: ['./fab-button.component.scss']
})
export class FabButtonComponent implements OnInit {
	@Input() isDisabled$: Observable<boolean> = of(false);
	@Input() icon: string;
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
