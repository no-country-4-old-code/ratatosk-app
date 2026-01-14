import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl} from '@angular/forms';
import {materialIcons} from '@app/lib/global/icons';

@Component({
	changeDetection: ChangeDetectionStrategy.OnPush,
	selector: 'app-bar-search',
	templateUrl: './app-bar-search.component.html',
	styleUrls: ['./app-bar-search.component.scss']
})
export class AppBarSearchComponent implements OnInit {
	@Input() disableElevation = false;
	@Output() clickOnReturn = new EventEmitter();
	@Output() keyUpSearch = new EventEmitter<string>();
	readonly searchTermControl = new FormControl();
	readonly icons = materialIcons;

	constructor() {
	}

	ngOnInit() {
	}

	onClickEmitReturn(clicked_element: string) {
		if (clicked_element === this.icons.back) {
			this.clickOnReturn.emit();
		}
	}

	onKeyUpEmitTerm(searchTerm: string) {
		this.keyUpSearch.emit(searchTerm);
	}

}
