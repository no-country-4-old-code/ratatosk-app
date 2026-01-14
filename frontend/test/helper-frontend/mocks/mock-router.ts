import {MockControl} from '@test/helper-frontend/mocks/helper';
import {NavigationExtras, Router} from '@angular/router';

export function buildMockControlRouter(): MockControl<Router, {}> {
	const control = {};
	const mock = {
		navigate: (commands: any[], extras?: NavigationExtras) => {}, // use spyOn(..) to count calls
	} as Router;
	return {mock, control};
}
