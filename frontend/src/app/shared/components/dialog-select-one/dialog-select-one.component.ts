import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {printErrorIfDifferentLength} from '@app/lib/util/error';
import {Observable, of} from "rxjs";

export interface DialogSelectOneData {
	options: string[];
	optionsInfo: string[];
	title?: string;
	selected?: string;
	map2Name$?: (option: string) => Observable<string>;
}

@Component({
	selector: 'app-dialog-select-one',
	templateUrl: './dialog-select-one.component.html',
	styleUrls: ['./dialog-select-one.component.scss']
})
export class DialogSelectOneComponent {
	readonly minWidthInPx: number;
	readonly displayedOptions: Observable<string>[];
	private readonly pixelPerChar = 10;

	constructor(public dialogRef: MatDialogRef<DialogSelectOneComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogSelectOneData) {
		if (data.map2Name$ !== undefined) {
			this.displayedOptions = data.options.map(d => data.map2Name$(d));
		} else {
			this.displayedOptions = data.options.map(d => of(d));
		}
		printErrorIfDifferentLength(data.options, data.optionsInfo, `DialogSelectOneComponent: ${data.options} <-> ${data.optionsInfo}`);
		const maxNumberOfCharsInOption = Math.max(...data.options.map(option => option.length));
		this.minWidthInPx = maxNumberOfCharsInOption * this.pixelPerChar;
	}

}
