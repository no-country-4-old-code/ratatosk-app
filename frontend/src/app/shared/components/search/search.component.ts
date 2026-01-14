import {Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {FormControl} from '@angular/forms';
import {of} from 'rxjs';
import {delay, startWith} from 'rxjs/operators';

@Component({
	selector: 'app-search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
	@Input() hasFocusOnStartUp = true;
	@Output() keyUpSearch = new EventEmitter<string>();
	@ViewChild('search', {static: true}) searchForm: ElementRef;
	readonly searchTermControl = new FormControl();

	constructor() {
	}

	ngOnInit() {
		this.searchTermControl.setValue('');
		if (this.hasFocusOnStartUp) {
			this.searchForm.nativeElement.focus();
		} else {
			this.unfocusElement(this.searchForm.nativeElement);
		}
	}

	ngOnDestroy(): void {
		this.keyUpSearch.emit('');
	}

	onClickClearSearch() {
		this.searchTermControl.setValue('');
		this.searchForm.nativeElement.focus();
		this.keyUpSearch.emit('');
	}

	// private

	unfocusElement(element: any) {
		const delayToHoldDisableInMs = 750;
		of(false).pipe(
			delay(delayToHoldDisableInMs),
			startWith(true)
		).subscribe(disabled => {
			element.disabled = disabled;
		});
	}
}
