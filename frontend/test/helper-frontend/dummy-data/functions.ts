import {chartColors} from '@app/lib/chart-data/line/color/dye-functions';
import {ColoredFunction} from '@app/lib/chart-data/interfaces';
import {FunctionBlueprint} from '../../../../shared-library/src/scan/indicator-functions/interfaces';

export function createDummyFunctionSelected(): ColoredFunction {
	const blueprint: FunctionBlueprint = {func: 'value', params: {factor: 1}};
	return {blueprint, color: chartColors[0]};
}
