import {Observable, of} from 'rxjs';
import {fromControl, MockControl} from '@test/helper-frontend/mocks/helper';
import {MatDialog} from '@angular/material/dialog';

export interface MockControlDialog {
	afterClosed$: Observable<any>;
}

export function buildMockControlDialog(): MockControl<MatDialog, MockControlDialog> {
	const control = {afterClosed$: of(null)};
	const mock = {
		open: (component: any, config: any) => {
			return {
				afterClosed: () => fromControl(() => control.afterClosed$)
			};
		}
	} as any as MatDialog;
	return {mock, control};
}
