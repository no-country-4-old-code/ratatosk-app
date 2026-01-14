import {of} from 'rxjs';
import {MockControl} from '@test/helper-frontend/mocks/helper';
import {AreScansSynchronizedService} from '@app/services/are-scans-synchronized.service';

export function buildMockControlScansSynchronized(): MockControl<AreScansSynchronizedService, {}> {
	const mock = {
		areScansSynchronized$: of(true)
	} as AreScansSynchronizedService;
	return {mock, control: {}};
}
