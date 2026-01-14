import {Observable, of} from 'rxjs';
import {fromControl, MockControl} from '@test/helper-frontend/mocks/helper';
import {ActivatedRoute} from '@angular/router';

export interface MockControlRoute {
	paramMap$: Observable<any>;
}

export function buildMockControlActiveRoute(): MockControl<ActivatedRoute, MockControlRoute> {
	const control = {paramMap$: of(null)};
	const mock = {
		paramMap: fromControl(() => control.paramMap$),
		parent: {} // overwrite me if needed with component.xyz
	} as ActivatedRoute;
	return {mock, control};
}
