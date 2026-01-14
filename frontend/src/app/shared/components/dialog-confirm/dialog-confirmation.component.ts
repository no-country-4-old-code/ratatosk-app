import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

export interface DialogConfirmationData {
	dialog: string;
}

@Component({
	selector: 'app-dialog-reset',
	templateUrl: './dialog-confirmation.component.html',
	styleUrls: ['./dialog-confirmation.component.scss']
})
export class DialogConfirmationComponent {

	constructor(
		public dialogRef: MatDialogRef<DialogConfirmationComponent>,
		@Inject(MAT_DIALOG_DATA) public data: DialogConfirmationData) {
	}

}
