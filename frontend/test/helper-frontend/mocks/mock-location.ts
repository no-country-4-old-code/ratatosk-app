import {MockControl} from '@test/helper-frontend/mocks/helper';
import {Location} from '@angular/common';

export interface MockControlLocation {
	changeUrl: (url: string, state: unknown) => void;
}


export function buildMockControlLocation(): MockControl<Location, MockControlLocation> {
	const control = {changeUrl: null};
	const mock = {
		back: () => {},  // use spyOn(..) to count calls
		onUrlChange: ( fn: (url: string, state: unknown) => void ) => {control.changeUrl = fn; }
	} as Location;
	return {mock, control};
}
