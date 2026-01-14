import {Observable, of, ReplaySubject} from 'rxjs';
import {ScanFrontend} from '@app/lib/scan/interfaces';
import {fromControl, MockControl} from '@test/helper-frontend/mocks/helper';
import {BuildService} from '@app/services/build.service';
import {BuildError} from '@app/lib/build/plausibility-checks';
import {Scan} from '../../../../shared-library/src/scan/interfaces';

export interface MockControlBuild {
	scan$: Observable<ScanFrontend>;
	error$: Observable<BuildError[]>;
	save$: Observable<number>;
	hasChanged: boolean;
	readonly updateParams$: Observable<Partial<Scan>>;
}

export function buildMockControlBuild(): MockControl<BuildService, MockControlBuild> {
	const updateSubject = new ReplaySubject<Partial<Scan>>(1);
	const control = {scan$: of(null), error$: of(null), save$: of(null),
		hasChanged: false, updateParams$: updateSubject.asObservable()};
	const mock = {
		currentBlueprint$: fromControl(() => control.scan$),
		errorBuild$: fromControl(() => control.error$),
		hasChanged: (): boolean => control.hasChanged,
		update: (partial: Partial<Scan>) => updateSubject.next(partial),
		save: (idx?) => fromControl(() => control.save$), // if spyOn(..) use call through
		reset: () => {} // use spyOn(..) to count calls
	} as BuildService;
	return {mock, control};
}
