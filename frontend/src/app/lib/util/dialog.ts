import {take, takeWhile} from 'rxjs/operators';

export const dialogWidth = '90%';

export function updateOnDialogClose<T>(dialogRef: any, update: (result: T) => void) {
    dialogRef.afterClosed().pipe(
        takeWhile(result => result !== undefined),
        take(1)).subscribe(result => update(result));
}
