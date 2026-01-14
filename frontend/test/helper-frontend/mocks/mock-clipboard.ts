import {MockControl} from '@test/helper-frontend/mocks/helper';
import {Clipboard} from '@angular/cdk/clipboard';

export function buildMockControlClipboard(): MockControl<Clipboard, {}> {
	const control = {};
	const mock = {
		// use spyOn(..).and.return to count calls / params etc
		copy: (message: string) => {}
	} as Clipboard;
	return {mock, control};
}
