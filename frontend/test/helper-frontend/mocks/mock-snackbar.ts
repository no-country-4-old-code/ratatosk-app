import {MockControl} from '@test/helper-frontend/mocks/helper';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';

export function buildMockControlMatSnackBar(): MockControl<MatSnackBar, {}> {
	const control = {};
	const mock = {
		// use spyOn(..).and.return to count calls / params etc
		open: (message: string, action?: string, config?: MatSnackBarConfig) => {}
	} as MatSnackBar;
	return {mock, control};
}
