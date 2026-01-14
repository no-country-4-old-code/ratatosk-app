import {createDummyScan} from '../../../../shared-library/src/functions/test-utils/dummy-data/scan';
import {ScanFrontend} from '@app/lib/scan/interfaces';
import {createRangeArray} from '../../../../shared-library/src/functions/general/array';
import {createDummyConditionAlwaysTrue} from '../../../../shared-library/src/functions/test-utils/dummy-data/condition';
import {mapScan2Frontend} from '@app/lib/firestore/mapFirestore';
import {ScanNotification} from '../../../../shared-library/src/scan/interfaces';
import {ConditionBlueprint} from '../../../../shared-library/src/scan/condition/interfaces';

export function createDummyScanFronted(numberOfConditions = 1): ScanFrontend {
	const scan = mapScan2Frontend( createDummyScan() );
	scan.conditions = createRangeArray(numberOfConditions).map( count => createDummyConditionAlwaysTrue());
	return scan;
}

export function createDummyScanWithConditions(conditions: ConditionBlueprint<'coin'>[]): ScanFrontend {
	const scan = createDummyScanFronted(1);
	scan.conditions = conditions;
	return scan;
}

export function createDummyScanNotification(isEnabled: boolean): ScanNotification<'coin'> {
	return {lastNotified: [], lastSeen: [], isEnabled};
}
