import {ChartBoolSample, ChartLineSample} from '@app/lib/chart-data/interfaces';
import {createRangeArray} from '../../../../shared-library/src/functions/general/array';

export function createDummyChartLineSamples(values: number[][], dateStepMs=1000000): ChartLineSample[] {
	return createRangeArray(values[0].length).map( idx => {
		const date: Date = new Date(idx * dateStepMs);
		return {x: date, yCharts: [values[0][idx], values[1][idx]]};
	});
}

export function createDummyChartBoolSamples(values: boolean[], dateStepMs=1000000): ChartBoolSample[] {
	return values.map( (val, idx) => {
		const date: Date = new Date(idx * dateStepMs);
		return {x: date, y: val};
	});
}
