import {Observable, of, Subject} from 'rxjs';
import {fromControl, MockControl} from '@test/helper-frontend/mocks/helper';
import {ScanService} from '@app/services/scan.service';
import {ScanFrontend} from '@app/lib/scan/interfaces';
import {Scan} from '@shared_library/scan/interfaces';

export interface MockControlScan {
	scans$: Observable<ScanFrontend[]>;
	readonly paramsOfScanUpdate$: Observable<Scan | ScanFrontend>;
}

export function buildMockControlScan(): MockControl<ScanService, MockControlScan> {
	const subjectUpdateParams = new Subject<Scan | ScanFrontend>();
	const control = {scans$: of(null), paramsOfScanUpdate$: subjectUpdateParams.asObservable()};
	const mock = {
		scans$: fromControl(() => control.scans$),
		deleteScan$: (idx: number) => of(null), // use spyOn(..).and.return(...)
		getScan$: (idx: number) => of(null), // use spyOn(..).and.return(...)
		updateScan: (scan: Scan | ScanFrontend) => {
			subjectUpdateParams.next(scan);
			return of(true);
		},
		updateScans: (scansFrontend: (ScanFrontend | Scan)[]) => of(null) // use spyOn(..).and.return(...)
	} as ScanService;
	return {mock, control};
}
