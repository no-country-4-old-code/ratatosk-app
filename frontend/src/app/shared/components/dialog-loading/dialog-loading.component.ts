import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Observable, of} from 'rxjs';
import {catchError, take} from 'rxjs/operators';
import {dialogWidth, updateOnDialogClose} from '@lib/util/dialog';

export interface DialogLoadingData {
	stream$: Observable<any>;
}

@Component({
	selector: 'app-dialog-loading',
	templateUrl: './dialog-loading.component.html',
	styleUrls: ['./dialog-loading.component.scss']
})
export class DialogLoadingComponent {

	constructor(public dialogRef: MatDialogRef<DialogLoadingComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogLoadingData) {
		const stream$ = data.stream$.pipe(
			catchError(err => of(err)), // error should not lead to endless dialog
			take(1));
		stream$.subscribe(result => dialogRef.close(result));
	}
}

export function openDialogLoading(stream$: Observable<any>, dialog: MatDialog, callback: (resp: any) => void = logCallback): void {
	const dialogRef = dialog.open(DialogLoadingComponent, {
		width: dialogWidth,
		data: {stream$: stream$},
		disableClose: true
	});
	updateOnDialogClose<boolean>(dialogRef, callback);
}

function logCallback(resp: any): void {
	console.log('End of loading', resp);
}